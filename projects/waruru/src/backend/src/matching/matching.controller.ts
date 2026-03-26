import {
  Controller,
  Post,
  Delete,
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
  ApiConflictResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { MatchingService } from './matching.service';
import { EnterQueueDto } from './dto/matching.dto';
import { JwtAuthGuard, JwtPayload } from '../common/guards/jwt-auth.guard';

@ApiTags('Matching')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'matching', version: '1' })
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('queue')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enter matching queue',
    description:
      'Enters the authenticated user into the Redis matching queue with their current location and Big Five snapshot. If a compatible match is found immediately, returns the match_id.',
  })
  @ApiResponse({
    status: 200,
    description: 'Queued or matched immediately.',
    schema: {
      example: { queued: true },
    },
  })
  @ApiConflictResponse({ description: 'User is already in the queue.' })
  async enterQueue(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: EnterQueueDto,
  ) {
    return this.matchingService.enterQueue(req.user.sub, dto);
  }

  @Delete('queue')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave matching queue' })
  @ApiResponse({ status: 204, description: 'Removed from queue.' })
  @ApiNotFoundResponse({ description: 'User is not in the queue.' })
  async leaveQueue(@Req() req: Request & { user: JwtPayload }) {
    return this.matchingService.leaveQueue(req.user.sub);
  }

  @Get(':match_id')
  @ApiOperation({
    summary: 'Get match status and venue',
    description: 'Returns match details. User must be a participant in the match.',
  })
  @ApiParam({ name: 'match_id', description: 'UUID of the match' })
  @ApiResponse({ status: 200, description: 'Match details.' })
  @ApiNotFoundResponse({ description: 'Match not found or user not a participant.' })
  async getMatch(
    @Req() req: Request & { user: JwtPayload },
    @Param('match_id') matchId: string,
  ) {
    return this.matchingService.getMatch(matchId, req.user.sub);
  }
}
