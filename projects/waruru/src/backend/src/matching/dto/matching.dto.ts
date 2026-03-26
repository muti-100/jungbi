import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
} from 'class-validator';

export class LocationDto {
  @ApiProperty({ description: 'WGS-84 latitude', example: 37.5665 })
  @IsLatitude()
  lat: number;

  @ApiProperty({ description: 'WGS-84 longitude', example: 126.9780 })
  @IsLongitude()
  lng: number;
}

export class EnterQueueDto {
  @ApiProperty({ type: LocationDto })
  location: LocationDto;

  @ApiProperty({
    description:
      'Big Five personality snapshot — [O, C, E, A, N] each 0.0–1.0',
    example: [0.72, 0.65, 0.80, 0.55, 0.40],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(5, { message: 'big_five_snapshot must have exactly 5 values' })
  @ArrayMaxSize(5, { message: 'big_five_snapshot must have exactly 5 values' })
  @IsNumber({}, { each: true })
  @Min(0.0, { each: true })
  @Max(1.0, { each: true })
  big_five_snapshot: number[];

  @ApiPropertyOptional({
    description: 'Maximum acceptable queue wait in seconds (default 300)',
    example: 180,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(600)
  max_wait_seconds?: number;
}
