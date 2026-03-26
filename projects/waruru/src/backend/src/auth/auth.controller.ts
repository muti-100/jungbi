import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService, AuthTokenResponse } from './auth.service';
import { SendOtpDto, VerifyOtpDto } from './dto/verify-phone.dto';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-phone/send')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Send OTP',
    description: 'Sends a 6-digit OTP SMS to the given Korean phone number via Supabase Auth.',
  })
  @ApiResponse({ status: 204, description: 'OTP dispatched.' })
  @ApiBadRequestResponse({ description: 'Invalid phone format or send failure.' })
  async sendOtp(@Body() dto: SendOtpDto): Promise<void> {
    return this.authService.sendOtp(dto);
  }

  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP and issue JWT',
    description:
      'Verifies the OTP. On success returns a signed JWT. KYC flag is embedded in the token.',
  })
  @ApiResponse({
    status: 200,
    description: 'JWT issued.',
    schema: {
      example: {
        access_token: 'eyJhbGc...',
        token_type: 'Bearer',
        expires_in: 604800,
        user_id: 'uuid',
        kyc_verified: false,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired OTP.' })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthTokenResponse> {
    return this.authService.verifyOtp(dto);
  }
}
