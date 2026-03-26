import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional } from 'class-validator';

export class CreateRollingPaperDto {
  @ApiProperty({
    description: 'Message to leave on the rolling paper (max 200 chars)',
    maxLength: 200,
    example: '오늘 만남 정말 즐거웠어요! 다음에 또 봬요 :)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  message: string;
}

export class GenerateFigurineDto {
  @ApiProperty({ description: 'UUID of the match', example: 'uuid-...' })
  @IsUUID('4')
  match_id: string;

  @ApiPropertyOptional({
    description: 'Optional style hint for AI figurine generation',
    example: 'chibi',
  })
  @IsOptional()
  @IsString()
  style?: string;
}

export interface RollingPaperResponse {
  id: string;
  match_id: string;
  author_id: string;
  message: string;
  figurine_url: string | null;
  figurine_status: 'pending' | 'ready' | 'failed';
  created_at: string;
}
