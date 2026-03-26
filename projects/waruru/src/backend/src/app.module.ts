import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MatchingModule } from './matching/matching.module';
import { VenueModule } from './venue/venue.module';
import { ArrivalModule } from './arrival/arrival.module';
import { RollingPaperModule } from './rolling-paper/rolling-paper.module';
import { LegacyModule } from './legacy/legacy.module';
import { AbTestModule } from './abtest/abtest.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // ConfigModule is global — all modules can inject ConfigService
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      // Fail fast if a required env var is missing
      expandVariables: true,
    }),

    DatabaseModule,

    AuthModule,
    MatchingModule,
    VenueModule,
    ArrivalModule,
    RollingPaperModule,
    LegacyModule,
    AbTestModule,
  ],
})
export class AppModule {}
