import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsIn,
  IsOptional,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class BleEventDto {
  @ApiProperty({ description: 'UUID of the match', example: 'uuid-...' })
  @IsUUID('4')
  match_id: string;

  @ApiProperty({ description: 'BLE beacon identifier', example: 'beacon-001' })
  @IsString()
  @IsNotEmpty()
  beacon_id: string;

  @ApiProperty({
    description: 'Received Signal Strength Indicator in dBm',
    example: -70,
  })
  @IsInt()
  @Min(-120)
  @Max(0)
  rssi: number;

  @ApiProperty({ description: 'UUID of the scanning user', example: 'uuid-...' })
  @IsUUID('4')
  user_id: string;

  @ApiPropertyOptional({
    description: 'Detection method — defaults to ble',
    enum: ['ble', 'gps_fallback', 'manual'],
    example: 'ble',
  })
  @IsOptional()
  @IsIn(['ble', 'gps_fallback', 'manual'])
  method?: 'ble' | 'gps_fallback' | 'manual';

  @ApiPropertyOptional({ description: 'GPS latitude (required when method=gps_fallback)' })
  @IsOptional()
  @IsLatitude()
  gps_lat?: number;

  @ApiPropertyOptional({ description: 'GPS longitude (required when method=gps_fallback)' })
  @IsOptional()
  @IsLongitude()
  gps_lng?: number;
}
