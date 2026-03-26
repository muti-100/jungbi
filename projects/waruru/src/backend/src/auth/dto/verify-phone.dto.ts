import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
  Length,
} from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    description: 'E.164 format Korean phone number',
    example: '+821012345678',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+82[0-9]{9,10}$/, {
    message: 'phone must be a valid Korean E.164 number (+821XXXXXXXX)',
  })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+821012345678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+82[0-9]{9,10}$/, {
    message: 'phone must be a valid Korean E.164 number (+821XXXXXXXX)',
  })
  phone: string;

  @ApiProperty({ description: '6-digit OTP', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'token must be exactly 6 digits' })
  @Matches(/^[0-9]{6}$/, { message: 'token must be numeric' })
  token: string;
}
