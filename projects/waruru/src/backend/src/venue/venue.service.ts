import {
  Injectable,
  Logger,
  BadGatewayException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import {
  CoordinateDto,
  MidpointRequestDto,
  MidpointResponse,
  VenueResult,
} from './dto/venue.dto';

const INITIAL_RADIUS_METERS = 500;
const EXPANDED_RADIUS_METERS = 1000;
const MIN_VENUE_COUNT = 3;
const MAX_OSRM_VENUES = 20;

@Injectable()
export class VenueService {
  private readonly logger = new Logger(VenueService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly configService: ConfigService,
  ) {}

  async getMidpointVenues(dto: MidpointRequestDto): Promise<MidpointResponse> {
    const midpoint = this.calcGeographicMidpoint(
      dto.user_a_location,
      dto.user_b_location,
    );

    let venues = await this.queryVenuesNear(midpoint, INITIAL_RADIUS_METERS);

    // Auto-expand radius if fewer than MIN_VENUE_COUNT found
    if (venues.length < MIN_VENUE_COUNT) {
      this.logger.log(
        `Only ${venues.length} venues within ${INITIAL_RADIUS_METERS}m — expanding to ${EXPANDED_RADIUS_METERS}m`,
      );
      venues = await this.queryVenuesNear(midpoint, EXPANDED_RADIUS_METERS);
    }

    if (!venues.length) {
      return { midpoint, venues: [] };
    }

    // Limit to MAX_OSRM_VENUES before calling OSRM (cost cap)
    const venueSubset = venues.slice(0, MAX_OSRM_VENUES);

    const scored = await this.scoreWithOsrm(
      dto.user_a_location,
      dto.user_b_location,
      venueSubset,
    );

    // Sort by score descending, return top 3
    const top3 = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, MIN_VENUE_COUNT);

    return { midpoint, venues: top3 };
  }

  // ── Private helpers ───────────────────────────────────────────────

  /**
   * Geographic midpoint using average of lat/lng.
   * Accurate enough within Seoul metro area (<50km span).
   */
  private calcGeographicMidpoint(
    a: CoordinateDto,
    b: CoordinateDto,
  ): { lat: number; lng: number } {
    return {
      lat: (a.lat + b.lat) / 2,
      lng: (a.lng + b.lng) / 2,
    };
  }

  private async queryVenuesNear(
    midpoint: { lat: number; lng: number },
    radiusMeters: number,
  ): Promise<Array<{ id: string; name: string; category: string; lat: number; lng: number; district: string }>> {
    // Parameterized PostGIS query — no injection risk
    const result = await this.pool.query<{
      id: string;
      name: string;
      category: string;
      lat: number;
      lng: number;
      district: string;
    }>(
      `SELECT
         id,
         name,
         category,
         district,
         ST_Y(location_point::geometry) AS lat,
         ST_X(location_point::geometry) AS lng
       FROM venues
       WHERE ST_DWithin(
         location_point::geography,
         ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
         $3
       )
       ORDER BY location_point::geography <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
       LIMIT $4`,
      [midpoint.lng, midpoint.lat, radiusMeters, MAX_OSRM_VENUES],
    );

    return result.rows;
  }

  /**
   * Calls OSRM duration matrix and scores venues.
   * Score = -(|t_a - t_b| + 0.3 * max(t_a, t_b))
   * Higher score = more balanced, shorter travel times.
   */
  private async scoreWithOsrm(
    userA: CoordinateDto,
    userB: CoordinateDto,
    venues: Array<{ id: string; name: string; category: string; lat: number; lng: number; district: string }>,
  ): Promise<VenueResult[]> {
    const osrmUrl = this.configService.getOrThrow<string>('OSRM_URL');

    // OSRM Table API: sources = [userA, userB], destinations = all venues
    const coords = [
      `${userA.lng},${userA.lat}`,
      `${userB.lng},${userB.lat}`,
      ...venues.map((v) => `${v.lng},${v.lat}`),
    ].join(';');

    const sourceIndices = '0;1';
    const destinationIndices = venues
      .map((_, i) => i + 2)
      .join(';');

    let durations: number[][] = [];
    try {
      const resp = await axios.get<{ durations: number[][] }>(
        `${osrmUrl}/table/v1/driving/${coords}`,
        {
          params: {
            sources: sourceIndices,
            destinations: destinationIndices,
            annotations: 'duration',
          },
          timeout: 5000,
        },
      );
      durations = resp.data.durations;
    } catch (err) {
      this.logger.error(`OSRM call failed: ${(err as Error).message}`);
      throw new BadGatewayException('Routing service unavailable. Try again.');
    }

    // durations[0][i] = t_a for venue i, durations[1][i] = t_b for venue i
    return venues.map((venue, i) => {
      const tA = durations[0]?.[i] ?? 999;
      const tB = durations[1]?.[i] ?? 999;
      const score = -(Math.abs(tA - tB) + 0.3 * Math.max(tA, tB));

      return {
        ...venue,
        eta_a_seconds: Math.round(tA),
        eta_b_seconds: Math.round(tB),
        score,
      };
    });
  }
}
