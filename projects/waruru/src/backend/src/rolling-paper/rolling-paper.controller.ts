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
  ApiConflictResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RollingPaperService } from './rolling-paper.service';
import {
  CreateRollingPaperDto,
  GenerateFigurineDto,
  RollingPaperResponse,
} from './dto/rolling-paper.dto';
import { JwtAuthGuard, JwtPayload } from '../common/guards/jwt-auth.guard';

@ApiTags('Rolling Paper')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller({ version: '1' })
export class RollingPaperController {
  constructor(private readonly rollingPaperService: RollingPaperService) {}

  @Post('rolling-paper/:match_id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create rolling paper',
    description:
      'Creates a rolling paper message for the match. Requires match.status = "arrived". '
      + 'Triggers async AI figurine generation via Python sidecar.',
  })
  @ApiParam({ name: 'match_id', description: 'UUID of the match' })
  @ApiResponse({ status: 201, description: 'Rolling paper created.' })
  @ApiBadRequestResponse({ description: 'Match not in "arrived" status.' })
  @ApiConflictResponse({ description: 'Rolling paper already exists for this match.' })
  @ApiNotFoundResponse({ description: 'Match not found.' })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('match_id') matchId: string,
    @Body() dto: CreateRollingPaperDto,
  ): Promise<RollingPaperResponse> {
    return this.rollingPaperService.create(matchId, req.user.sub, dto);
  }

  @Get('rolling-paper/:match_id')
  @ApiOperation({
    summary: 'Get rolling paper',
    description: 'Returns the rolling paper for a match including the figurine URL once generated.',
  })
  @ApiParam({ name: 'match_id', description: 'UUID of the match' })
  @ApiResponse({ status: 200, description: 'Rolling paper details.' })
  @ApiNotFoundResponse({ description: 'Rolling paper not found.' })
  async getByMatch(
    @Req() req: Request & { user: JwtPayload },
    @Param('match_id') matchId: string,
  ): Promise<RollingPaperResponse> {
    return this.rollingPaperService.getByMatch(matchId, req.user.sub);
  }

  @Post('figurine/generate')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Trigger AI figurine generation',
    description:
      'Enqueues an AI figurine generation job via the Python sidecar. '
      + 'The figurine_url on the rolling paper will be updated when the job completes.',
  })
  @ApiResponse({
    status: 202,
    description: 'Job accepted.',
    schema: { example: { job_id: 'uuid' } },
  })
  async generateFigurine(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: GenerateFigurineDto,
  ) {
    return this.rollingPaperService.generateFigurineForMatch(
      dto.match_id,
      req.user.sub,
      dto.style,
    );
  }
}
