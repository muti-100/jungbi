import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { PG_POOL } from '../database/database.module';
import { REDIS_CLIENT } from '../database/redis.module';
import { EnterQueueDto } from './dto/matching.dto';

const QUEUE_KEY = 'matching:queue';
const USER_QUEUE_PREFIX = 'matching:user:';

export interface QueueEntry {
  user_id: string;
  lat: number;
  lng: number;
  big_five: number[];
  entered_at: number;
  max_wait_seconds: number;
  ab_variant: string;
}

export interface MatchResult {
  match_id: string;
  status: string;
  user_a_id: string;
  user_b_id: string;
  venue: {
    id: string;
    name: string;
    category: string;
    eta_a_seconds: number;
    eta_b_seconds: number;
  } | null;
  created_at: string;
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Enters user into the Redis sorted set matching queue.
   * Score = unix timestamp (FIFO within window).
   * Triggers match attempt against the existing pool.
   */
  async enterQueue(userId: string, dto: EnterQueueDto): Promise<{ queued: boolean; match_id?: string }> {
    const userQueueKey = `${USER_QUEUE_PREFIX}${userId}`;

    // Prevent double-queueing
    const alreadyQueued = await this.redis.exists(userQueueKey);
    if (alreadyQueued) {
      throw new ConflictException('User is already in the matching queue');
    }

    const now = Date.now();
    const maxWait =
      dto.max_wait_seconds ??
      this.configService.get<number>('MATCHING_QUEUE_MAX_WAIT_SECONDS', 300);

    const entry: QueueEntry = {
      user_id: userId,
      lat: dto.location.lat,
      lng: dto.location.lng,
      big_five: dto.big_five_snapshot,
      entered_at: now,
      max_wait_seconds: maxWait,
      ab_variant: 'control', // resolved by GrowthBook in /abtest
    };

    // Add to sorted set; score = ms timestamp for FIFO ordering
    const pipeline = this.redis.pipeline();
    pipeline.zadd(QUEUE_KEY, now, JSON.stringify(entry));
    pipeline.set(userQueueKey, '1', 'EX', maxWait);
    await pipeline.exec();

    // Attempt immediate match
    const matchId = await this.attemptMatch(userId, entry);
    if (matchId) {
      return { queued: false, match_id: matchId };
    }

    return { queued: true };
  }

  async leaveQueue(userId: string): Promise<void> {
    const userQueueKey = `${USER_QUEUE_PREFIX}${userId}`;
    const inQueue = await this.redis.exists(userQueueKey);
    if (!inQueue) {
      throw new NotFoundException('User is not in the matching queue');
    }

    // Remove all entries belonging to this user from the sorted set
    const allEntries = await this.redis.zrange(QUEUE_KEY, 0, -1);
    const toRemove = allEntries.filter((raw) => {
      try {
        const e: QueueEntry = JSON.parse(raw);
        return e.user_id === userId;
      } catch {
        return false;
      }
    });

    const pipeline = this.redis.pipeline();
    for (const entry of toRemove) {
      pipeline.zrem(QUEUE_KEY, entry);
    }
    pipeline.del(userQueueKey);
    await pipeline.exec();
  }

  async getMatch(matchId: string, userId: string): Promise<MatchResult> {
    const result = await this.pool.query<{
      id: string;
      user_a_id: string;
      user_b_id: string;
      venue_id: string | null;
      status: string;
      ab_variant: string;
      created_at: string;
      venue_name: string | null;
      venue_category: string | null;
    }>(
      `SELECT
         m.id, m.user_a_id, m.user_b_id, m.venue_id, m.status,
         m.ab_variant, m.created_at,
         v.name AS venue_name, v.category AS venue_category
       FROM matches m
       LEFT JOIN venues v ON v.id = m.venue_id
       WHERE m.id = $1
         AND (m.user_a_id = $2 OR m.user_b_id = $2)`,
      [matchId, userId],
    );

    if (!result.rows.length) {
      throw new NotFoundException('Match not found');
    }

    const row = result.rows[0];

    return {
      match_id: row.id,
      status: row.status,
      user_a_id: row.user_a_id,
      user_b_id: row.user_b_id,
      venue:
        row.venue_id
          ? {
              id: row.venue_id,
              name: row.venue_name ?? '',
              category: row.venue_category ?? '',
              eta_a_seconds: 0, // populated after OSRM call
              eta_b_seconds: 0,
            }
          : null,
      created_at: row.created_at,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────

  private async attemptMatch(
    currentUserId: string,
    currentEntry: QueueEntry,
  ): Promise<string | null> {
    const poolSize = this.configService.get<number>('MATCHING_CANDIDATE_POOL_SIZE', 10);

    // Pull oldest N entries from the queue (excluding current user)
    const rawEntries = await this.redis.zrange(QUEUE_KEY, 0, poolSize + 1);
    const candidates = rawEntries
      .map((raw) => {
        try {
          return JSON.parse(raw) as QueueEntry;
        } catch {
          return null;
        }
      })
      .filter(
        (e): e is QueueEntry => e !== null && e.user_id !== currentUserId,
      );

    if (!candidates.length) return null;

    // Call Python sidecar for cosine similarity scoring
    let bestCandidate: QueueEntry | null = null;
    try {
      const sidecarUrl = this.configService.getOrThrow<string>('AI_SIDECAR_URL');
      const response = await axios.post<{ best_match: QueueEntry | null }>(
        `${sidecarUrl}/score`,
        {
          current: currentEntry,
          candidates,
        },
        {
          timeout: 3000,
          headers: {
            'X-Internal-Secret':
              this.configService.getOrThrow<string>('AI_SIDECAR_SECRET'),
          },
        },
      );
      bestCandidate = response.data.best_match;
    } catch (err) {
      this.logger.warn(
        `AI sidecar unavailable — falling back to FIFO: ${(err as Error).message}`,
      );
      bestCandidate = candidates[0];
    }

    if (!bestCandidate) return null;

    return this.createMatch(currentEntry, bestCandidate);
  }

  private async createMatch(
    entryA: QueueEntry,
    entryB: QueueEntry,
  ): Promise<string> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Insert the match row
      const matchResult = await client.query<{ id: string }>(
        `INSERT INTO matches (user_a_id, user_b_id, status, ab_variant)
         VALUES ($1, $2, 'pending', $3)
         RETURNING id`,
        [entryA.user_id, entryB.user_id, entryA.ab_variant],
      );
      const matchId = matchResult.rows[0].id;

      await client.query('COMMIT');

      // Remove both users from queue
      const rawA = JSON.stringify(entryA);
      const rawB = JSON.stringify(entryB);
      const pipeline = this.redis.pipeline();
      pipeline.zrem(QUEUE_KEY, rawA);
      pipeline.zrem(QUEUE_KEY, rawB);
      pipeline.del(`${USER_QUEUE_PREFIX}${entryA.user_id}`);
      pipeline.del(`${USER_QUEUE_PREFIX}${entryB.user_id}`);
      await pipeline.exec();

      this.logger.log(`Match created: ${matchId} (${entryA.user_id} <-> ${entryB.user_id})`);
      return matchId;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
