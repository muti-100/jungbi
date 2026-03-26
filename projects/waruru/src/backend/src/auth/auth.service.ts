import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import { PG_POOL } from '../database/database.module';
import { SendOtpDto, VerifyOtpDto } from './dto/verify-phone.dto';

export interface AuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user_id: string;
  kyc_verified: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(PG_POOL) private readonly pool: Pool,
  ) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  /**
   * Step 1: Send OTP via Supabase Auth (SMS).
   * Returns void — no info leaked about whether the number is registered.
   */
  async sendOtp(dto: SendOtpDto): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOtp({
      phone: dto.phone,
    });

    if (error) {
      this.logger.error(`OTP send failed for ${dto.phone}: ${error.message}`);
      // Do not expose raw Supabase errors to the client
      throw new BadRequestException('Failed to send OTP. Try again later.');
    }
  }

  /**
   * Step 2: Verify OTP and return a signed JWT.
   * Also upserts the user row in our users table.
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<AuthTokenResponse> {
    // Verify OTP against Supabase Auth
    const { data, error } = await this.supabase.auth.verifyOtp({
      phone: dto.phone,
      token: dto.token,
      type: 'sms',
    });

    if (error || !data?.user) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const supabaseUserId = data.user.id;

    // Upsert user in our own users table (parameterized — no SQL injection risk)
    const upsertResult = await this.pool.query<{
      id: string;
      kyc_verified: boolean;
    }>(
      `INSERT INTO users (id, phone, kyc_verified)
       VALUES ($1, $2, false)
       ON CONFLICT (phone) DO UPDATE
         SET id = EXCLUDED.id
       RETURNING id, kyc_verified`,
      [supabaseUserId, dto.phone],
    );

    const user = upsertResult.rows[0];

    // Sign our own JWT — contains KYC flag so downstream guards can gate
    const payload = {
      sub: user.id,
      phone: dto.phone,
      kyc_verified: user.kyc_verified,
    };

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    const access_token = this.jwtService.sign(payload, { expiresIn });

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 7 * 24 * 3600, // seconds — matches "7d"
      user_id: user.id,
      kyc_verified: user.kyc_verified,
    };
  }

  /**
   * Guard helper: throw 403 if user has not passed KYC.
   */
  assertKycVerified(kycVerified: boolean): void {
    if (!kycVerified) {
      throw new ForbiddenException('KYC verification required to use this feature');
    }
  }
}
