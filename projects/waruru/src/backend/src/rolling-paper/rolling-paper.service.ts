import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import {
  CreateRollingPaperDto,
  RollingPaperResponse,
} from './dto/rolling-paper.dto';

@Injectable()
export class RollingPaperService {
  private readonly logger = new Logger(RollingPaperService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Creates a rolling paper for a match.
   * Requires match.status = 'arrived' before allowing creation.
   */
  async create(
    matchId: string,
    authorId: string,
    dto: CreateRollingPaperDto,
  ): Promise<RollingPaperResponse> {
    // Verify match exists and user is a participant
    const matchResult = await this.pool.query<{ status: string }>(
      `SELECT status FROM matches
       WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2)`,
      [matchId, authorId],
    );

    if (!matchResult.rows.length) {
      throw new NotFoundException('Match not found or user is not a participant');
    }

    const match = matchResult.rows[0];

    // Gate: only allow rolling paper if both users have arrived
    if (match.status !== 'arrived') {
      throw new BadRequestException(
        `Rolling paper can only be created after arrival confirmation. Current match status: "${match.status}"`,
      );
    }

    // Prevent duplicate rolling papers per match per author
    const existing = await this.pool.query(
      `SELECT id FROM rolling_papers WHERE match_id = $1 AND author_id = $2`,
      [matchId, authorId],
    );
    if (existing.rows.length) {
      throw new ConflictException('Rolling paper already created for this match');
    }

    // Insert rolling paper (figurine_url null until AI generates it)
    const insertResult = await this.pool.query<{
      id: string;
      match_id: string;
      author_id: string;
      message: string;
      figurine_url: string | null;
      created_at: string;
    }>(
      `INSERT INTO rolling_papers (match_id, author_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, match_id, author_id, message, figurine_url, created_at`,
      [matchId, authorId, dto.message],
    );

    const paper = insertResult.rows[0];

    // Trigger AI figurine generation asynchronously — do not block response
    this.triggerFigurineGeneration(paper.id, matchId, authorId).catch((err) => {
      this.logger.warn(
        `Figurine generation trigger failed for paper ${paper.id}: ${(err as Error).message}`,
      );
    });

    return {
      ...paper,
      figurine_status: 'pending',
    };
  }

  async getByMatch(
    matchId: string,
    userId: string,
  ): Promise<RollingPaperResponse> {
    const result = await this.pool.query<{
      id: string;
      match_id: string;
      author_id: string;
      message: string;
      figurine_url: string | null;
      created_at: string;
    }>(
      `SELECT rp.id, rp.match_id, rp.author_id, rp.message, rp.figurine_url, rp.created_at
       FROM rolling_papers rp
       JOIN matches m ON m.id = rp.match_id
       WHERE rp.match_id = $1
         AND (m.user_a_id = $2 OR m.user_b_id = $2)`,
      [matchId, userId],
    );

    if (!result.rows.length) {
      throw new NotFoundException('Rolling paper not found for this match');
    }

    const paper = result.rows[0];
    return {
      ...paper,
      figurine_status: paper.figurine_url ? 'ready' : 'pending',
    };
  }

  /** Public-facing method — verifies ownership before triggering generation. */
  async generateFigurineForMatch(
    matchId: string,
    userId: string,
    style?: string,
  ): Promise<{ job_id: string }> {
    const result = await this.pool.query<{ id: string }>(
      `SELECT rp.id FROM rolling_papers rp
       JOIN matches m ON m.id = rp.match_id
       WHERE rp.match_id = $1
         AND rp.author_id = $2
         AND (m.user_a_id = $2 OR m.user_b_id = $2)`,
      [matchId, userId],
    );
    if (!result.rows.length) {
      throw new ForbiddenException('Rolling paper not found or user is not the author');
    }
    return this.triggerFigurineGeneration(result.rows[0].id, matchId, userId, style);
  }

  async triggerFigurineGeneration(
    paperId: string,
    matchId: string,
    userId: string,
    style?: string,
  ): Promise<{ job_id: string }> {
    const sidecarUrl = this.configService.getOrThrow<string>('AI_SIDECAR_URL');

    const response = await axios.post<{ job_id: string }>(
      `${sidecarUrl}/generate-figurine`,
      {
        rolling_paper_id: paperId,
        match_id: matchId,
        user_id: userId,
        style: style ?? 'default',
      },
      {
        timeout: 5000,
        headers: {
          'X-Internal-Secret':
            this.configService.getOrThrow<string>('AI_SIDECAR_SECRET'),
        },
      },
    );

    this.logger.log(`Figurine job queued: ${response.data.job_id} for paper ${paperId}`);
    return response.data;
  }
}
