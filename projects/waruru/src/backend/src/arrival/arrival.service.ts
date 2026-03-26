import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { PG_POOL } from '../database/database.module';
import { REDIS_CLIENT } from '../database/redis.module';
import { BleEventDto } from './dto/arrival.dto';

const ARRIVAL_KEY_PREFIX = 'arrival:';

export interface ArrivalStatus {
  match_id: string;
  user_a_arrived: boolean;
  user_b_arrived: boolean;
  both_confirmed: boolean;
  match_status: string;
}

@Injectable()
export class ArrivalService {
  private readonly logger = new Logger(ArrivalService.name);

  private readonly rssiThreshold: number;
  private readonly arrivalTtl: number;
  private readonly gpsFallbackMaxDistance: number;

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.rssiThreshold = this.configService.get<number>('BLE_RSSI_THRESHOLD', -75);
    this.arrivalTtl = this.configService.get<number>('ARRIVAL_REDIS_TTL_SECONDS', 300);
    this.gpsFallbackMaxDistance = this.configService.get<number>(
      'GPS_FALLBACK_MAX_DISTANCE_METERS',
      100,
    );
  }

  /**
   * Processes a BLE or GPS arrival event.
   * Returns true if both users are now confirmed at the venue.
   */
  async processBleEvent(dto: BleEventDto): Promise<{ confirmed: boolean; both_arrived: boolean }> {
    const method = dto.method ?? 'ble';

    if (method === 'ble') {
      this.validateBleRssi(dto.rssi);
    } else if (method === 'gps_fallback') {
      await this.validateGpsFallback(dto);
    }

    // Verify match exists and user is a participant
    const match = await this.getMatchRow(dto.match_id, dto.user_id);
    if (!match) {
      throw new NotFoundException('Match not found or user is not a participant');
    }

    if (match.status === 'arrived') {
      return { confirmed: true, both_arrived: true };
    }

    // Insert arrival event (parameterized)
    await this.pool.query(
      `INSERT INTO arrival_events (match_id, user_id, method, rssi)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [dto.match_id, dto.user_id, method, dto.rssi],
    );

    // Set Redis TTL key for this user's arrival confirmation
    const redisKey = `${ARRIVAL_KEY_PREFIX}${dto.match_id}:${dto.user_id}`;
    await this.redis.set(redisKey, '1', 'EX', this.arrivalTtl);

    // Check if the other user has also confirmed — atomic via SET NX lock
    const otherUserId =
      match.user_a_id === dto.user_id ? match.user_b_id : match.user_a_id;
    const otherKey = `${ARRIVAL_KEY_PREFIX}${dto.match_id}:${otherUserId}`;
    const otherArrived = await this.redis.exists(otherKey);

    if (otherArrived) {
      // Use SET NX to claim the "both arrived" transition atomically.
      // Only the first writer proceeds; the second gets null and skips the UPDATE.
      const lockKey = `arrival:lock:${dto.match_id}`;
      const acquired = await this.redis.set(lockKey, '1', 'EX', 60, 'NX');
      if (acquired === 'OK') {
        await this.pool.query(
          `UPDATE matches SET status = 'arrived' WHERE id = $1 AND status <> 'arrived'`,
          [dto.match_id],
        );
        this.logger.log(`Both users arrived for match ${dto.match_id}`);
      }
      return { confirmed: true, both_arrived: true };
    }

    return { confirmed: true, both_arrived: false };
  }

  async getArrivalStatus(matchId: string, userId: string): Promise<ArrivalStatus> {
    const match = await this.getMatchRow(matchId, userId);
    if (!match) {
      throw new NotFoundException('Match not found or user is not a participant');
    }

    const keyA = `${ARRIVAL_KEY_PREFIX}${matchId}:${match.user_a_id}`;
    const keyB = `${ARRIVAL_KEY_PREFIX}${matchId}:${match.user_b_id}`;

    const [aArrived, bArrived] = await Promise.all([
      this.redis.exists(keyA),
      this.redis.exists(keyB),
    ]);

    return {
      match_id: matchId,
      user_a_arrived: aArrived === 1,
      user_b_arrived: bArrived === 1,
      both_confirmed: aArrived === 1 && bArrived === 1,
      match_status: match.status,
    };
  }

  // ── Private helpers ───────────────────────────────────────────────

  private validateBleRssi(rssi: number): void {
    if (rssi < this.rssiThreshold) {
      throw new BadRequestException(
        `RSSI ${rssi} dBm is below threshold ${this.rssiThreshold} dBm. Move closer to the beacon.`,
      );
    }
  }

  private async validateGpsFallback(dto: BleEventDto): Promise<void> {
    if (dto.gps_lat == null || dto.gps_lng == null) {
      throw new BadRequestException(
        'gps_lat and gps_lng are required when method is gps_fallback',
      );
    }

    // Fetch venue coordinates for the match
    const venueResult = await this.pool.query<{
      lat: number;
      lng: number;
    }>(
      `SELECT
         ST_Y(v.location_point::geometry) AS lat,
         ST_X(v.location_point::geometry) AS lng
       FROM matches m
       JOIN venues v ON v.id = m.venue_id
       WHERE m.id = $1`,
      [dto.match_id],
    );

    if (!venueResult.rows.length) {
      throw new BadRequestException('No venue assigned to this match yet');
    }

    const { lat: venueLat, lng: venueLng } = venueResult.rows[0];
    const distMeters = this.haversineMeters(
      dto.gps_lat,
      dto.gps_lng,
      venueLat,
      venueLng,
    );

    if (distMeters > this.gpsFallbackMaxDistance) {
      throw new BadRequestException(
        `GPS distance ${Math.round(distMeters)}m exceeds maximum ${this.gpsFallbackMaxDistance}m`,
      );
    }
  }

  private async getMatchRow(
    matchId: string,
    userId: string,
  ): Promise<{ id: string; user_a_id: string; user_b_id: string; status: string } | null> {
    const result = await this.pool.query<{
      id: string;
      user_a_id: string;
      user_b_id: string;
      status: string;
    }>(
      `SELECT id, user_a_id, user_b_id, status
       FROM matches
       WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2)`,
      [matchId, userId],
    );
    return result.rows[0] ?? null;
  }

  /** Haversine formula — returns distance in meters */
  private haversineMeters(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6_371_000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
