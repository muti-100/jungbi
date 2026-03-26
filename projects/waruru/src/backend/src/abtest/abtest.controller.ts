import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  BadGatewayException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBadGatewayResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Request } from 'express';
import { JwtAuthGuard, JwtPayload } from '../common/guards/jwt-auth.guard';

interface GrowthBookAssignment {
  variant: 'control' | 'v2_weighted';
  feature_flags: Record<string, unknown>;
}

/**
 * Proxies A/B test assignments to the self-hosted GrowthBook SDK endpoint.
 * Variants:
 *   control      — standard Big Five cosine similarity (equal weights)
 *   v2_weighted  — Agreeableness x1.5 weighting (test hypothesis)
 */
@ApiTags('A/B Test')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'abtest', version: '1' })
export class AbTestController {
  private readonly logger = new Logger(AbTestController.name);

  constructor(private readonly configService: ConfigService) {}

  @Get('assignment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get A/B test variant assignment for authenticated user',
    description:
      'Proxies to GrowthBook and returns the variant and active feature flags for the current user. '
      + 'Variants: "control" (equal Big Five weights) | "v2_weighted" (Agreeableness x1.5). '
      + 'Graduate after 500 matches per variant.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        variant: 'control',
        feature_flags: {
          rolling_paper_v2: true,
          ble_rssi_threshold: -75,
        },
      },
    },
  })
  @ApiBadGatewayResponse({ description: 'GrowthBook service unavailable.' })
  async getAssignment(
    @Req() req: Request & { user: JwtPayload },
  ): Promise<GrowthBookAssignment> {
    const gbHost = this.configService.getOrThrow<string>('GROWTHBOOK_API_HOST');
    const clientKey = this.configService.getOrThrow<string>('GROWTHBOOK_CLIENT_KEY');

    try {
      const response = await axios.post<GrowthBookAssignment>(
        `${gbHost}/api/eval`,
        {
          attributes: {
            id: req.user.sub,
            phone: req.user.phone,
            kyc_verified: req.user.kyc_verified,
          },
          features: ['big_five_variant', 'rolling_paper_v2', 'ble_rssi_threshold'],
        },
        {
          headers: {
            Authorization: `Bearer ${clientKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 2000,
        },
      );

      return response.data;
    } catch (err) {
      this.logger.error(`GrowthBook unreachable: ${(err as Error).message}`);
      // Fail open — return control variant to avoid blocking user flow
      return {
        variant: 'control',
        feature_flags: {
          rolling_paper_v2: false,
          ble_rssi_threshold: -75,
        },
      };
    }
  }
}
