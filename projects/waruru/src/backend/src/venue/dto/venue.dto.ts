import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, ValidateNested } from 'class-validator';

export class CoordinateDto {
  @ApiProperty({ example: 37.5665 })
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: 126.978 })
  @IsLongitude()
  lng: number;
}

export class MidpointRequestDto {
  @ApiProperty({ type: CoordinateDto })
  @ValidateNested()
  @Type(() => CoordinateDto)
  user_a_location: CoordinateDto;

  @ApiProperty({ type: CoordinateDto })
  @ValidateNested()
  @Type(() => CoordinateDto)
  user_b_location: CoordinateDto;
}

export interface VenueResult {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  district: string;
  eta_a_seconds: number;
  eta_b_seconds: number;
  score: number;
}

export interface MidpointResponse {
  midpoint: { lat: number; lng: number };
  venues: VenueResult[];
}
