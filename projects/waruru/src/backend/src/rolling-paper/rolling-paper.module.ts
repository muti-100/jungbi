import { Module } from '@nestjs/common';
import { RollingPaperController } from './rolling-paper.controller';
import { RollingPaperService } from './rolling-paper.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RollingPaperController],
  providers: [RollingPaperService],
  exports: [RollingPaperService],
})
export class RollingPaperModule {}
