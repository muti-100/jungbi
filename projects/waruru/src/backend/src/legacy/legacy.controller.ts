import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import CircuitBreaker from 'opossum';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '../common/guards/jwt-auth.guard';

/**
 * Bridge proxy to the legacy service with an Opossum circuit breaker.
 *
 * Circuit breaker config:
 *   - Opens after 3 consecutive failures
 *   - Half-open probe after 30s
 *   - Timeout per request: LEGACY_SERVICE_TIMEOUT_MS (default 5000ms)
 */
@ApiTags('Legacy')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'legacy', version: '1' })
export class LegacyController {
  private readonly logger = new Logger(LegacyController.name);
  private readonly breaker: CircuitBreaker;

  constructor(private readonly configService: ConfigService) {
    const legacyUrl = this.configService.getOrThrow<string>('LEGACY_SERVICE_URL');
    const timeout = this.configService.get<number>('LEGACY_SERVICE_TIMEOUT_MS', 5000);

    // Wrap the actual HTTP call in a circuit breaker
    this.breaker = new CircuitBreaker(
      async (payload: { path: string; body: unknown; authHeader: string }) => {
        const response = await axios.post(
          `${legacyUrl}${payload.path}`,
          payload.body,
          {
            timeout,
            headers: {
              Authorization: payload.authHeader,
              'Content-Type': 'application/json',
              'X-Forwarded-By': 'waruru-backend',
            },
          },
        );
        return response.data;
      },
      {
        timeout,
        errorThresholdPercentage: 50,   // open after 50% failures in rolling window
        volumeThreshold: 3,              // minimum calls before stats are considered
        resetTimeout: 30_000,            // half-open probe after 30s
      },
    );

    this.breaker.on('open', () =>
      this.logger.warn('Legacy service circuit breaker OPEN'),
    );
    this.breaker.on('halfOpen', () =>
      this.logger.log('Legacy service circuit breaker HALF-OPEN (probing)'),
    );
    this.breaker.on('close', () =>
      this.logger.log('Legacy service circuit breaker CLOSED (healthy)'),
    );
  }

  @Post('migrate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Proxy migration request to legacy service',
    description:
      'Forwards the request body and Authorization header to the legacy service. '
      + 'Protected by a circuit breaker: opens after 3 failures within the window, '
      + 'probes again after 30s. Returns 503 when the circuit is open.',
  })
  @ApiResponse({ status: 200, description: 'Legacy service response forwarded.' })
  @ApiServiceUnavailableResponse({ description: 'Circuit breaker open — legacy service degraded.' })
  async migrate(
    @Req() req: Request & { user: JwtPayload },
    @Body() body: Record<string, unknown>,
  ) {
    const authHeader = req.headers.authorization ?? '';

    try {
      return await this.breaker.fire({
        path: '/migrate',
        body,
        authHeader,
      });
    } catch (err) {
      if (this.breaker.opened) {
        throw new ServiceUnavailableException(
          'Legacy service is temporarily unavailable. Please try again later.',
        );
      }

      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status ?? 502;
      const message =
        (axiosErr.response?.data as { message?: string })?.message ??
        'Legacy service error';

      this.logger.error(
        `Legacy proxy error [${status}]: ${message}`,
      );

      throw new ServiceUnavailableException(message);
    }
  }
}
