import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBadGatewayResponse,
} from '@nestjs/swagger';
import { VenueService } from './venue.service';
import { MidpointRequestDto, MidpointResponse } from './dto/venue.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Venue')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'venue', version: '1' })
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Post('midpoint')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Find top-3 midpoint venues',
    description:
      'Computes the geographic midpoint of two users, queries nearby venues via PostGIS, scores them using OSRM travel time matrix, and returns the top 3. Auto-expands search radius from 500m to 1km when fewer than 3 venues are found.',
  })
  @ApiResponse({
    status: 200,
    description: 'Top 3 venues with ETA for each user.',
    schema: {
      example: {
        midpoint: { lat: 37.548, lng: 126.992 },
        venues: [
          {
            id: 'uuid',
            name: '블루보틀 성수',
            category: 'cafe',
            lat: 37.5447,
            lng: 127.0556,
            district: '성동',
            eta_a_seconds: 420,
            eta_b_seconds: 390,
            score: -156,
          },
        ],
      },
    },
  })
  @ApiBadGatewayResponse({ description: 'OSRM routing service unavailable.' })
  async getMidpointVenues(
    @Body() dto: MidpointRequestDto,
  ): Promise<MidpointResponse> {
    return this.venueService.getMidpointVenues(dto);
  }
}
