import { Module } from '@nestjs/common';
import { ArrivalController } from './arrival.controller';
import { ArrivalService } from './arrival.service';
import { ArrivalGateway } from './arrival.gateway';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../database/redis.module';

@Module({
  imports: [AuthModule, RedisModule],
  controllers: [ArrivalController],
  providers: [ArrivalService, ArrivalGateway],
  exports: [ArrivalService, ArrivalGateway],
})
export class ArrivalModule {}
