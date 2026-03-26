import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ArrivalService } from './arrival.service';
import { ArrivalGateway } from './arrival.gateway';
import { BleEventDto } from './dto/arrival.dto';
import { JwtAuthGuard, JwtPayload } from '../common/guards/jwt-auth.guard';

@ApiTags('Arrival')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'arrival', version: '1' })
export class ArrivalController {
  constructor(
    private readonly arrivalService: ArrivalService,
    private readonly arrivalGateway: ArrivalGateway,
  ) {}

  @Post('ble-event')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit BLE or GPS arrival event',
    description:
      'Records a BLE beacon scan or GPS position check for arrival confirmation. '
      + 'RSSI must be >= -75 dBm for BLE. GPS fallback requires gps_lat + gps_lng within 100m of venue. '
      + 'When both participants confirm, updates match.status = "arrived" and emits WebSocket event.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: { confirmed: true, both_arrived: false },
    },
  })
  @ApiBadRequestResponse({ description: 'RSSI below threshold or GPS distance exceeded.' })
  @ApiNotFoundResponse({ description: 'Match not found or user not a participant.' })
  async bleEvent(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: BleEventDto,
  ) {
    // Ensure user_id in body matches authenticated caller
    dto.user_id = req.user.sub;

    const result = await this.arrivalService.processBleEvent(dto);

    // If both arrived, also notify via WebSocket for clients not using the WS gateway
    if (result.both_arrived) {
      this.arrivalGateway.emitArrivalConfirmed(dto.match_id, {
        match_id: dto.match_id,
        user_id: dto.user_id,
        both_arrived: true,
        message: 'Both users have arrived at the venue!',
      });
    }

    return result;
  }

  @Get(':match_id/status')
  @ApiOperation({ summary: 'Get arrival status for a match' })
  @ApiParam({ name: 'match_id', description: 'UUID of the match' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        match_id: 'uuid',
        user_a_arrived: true,
        user_b_arrived: false,
        both_confirmed: false,
        match_status: 'pending',
      },
    },
  })
  async getStatus(
    @Req() req: Request & { user: JwtPayload },
    @Param('match_id') matchId: string,
  ) {
    return this.arrivalService.getArrivalStatus(matchId, req.user.sub);
  }
}
