import { Module } from '@nestjs/common';
import { LegacyController } from './legacy.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [LegacyController],
})
export class LegacyModule {}
