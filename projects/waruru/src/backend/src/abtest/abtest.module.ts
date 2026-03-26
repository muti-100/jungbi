import { Module } from '@nestjs/common';
import { AbTestController } from './abtest.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AbTestController],
})
export class AbTestModule {}
