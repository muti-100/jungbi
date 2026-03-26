import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_POOL = 'PG_POOL';

/**
 * Global module — every other module receives the pg Pool via injection.
 * All queries MUST use parameterized form: pool.query('SELECT $1', [value])
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Pool({
          connectionString: config.getOrThrow<string>('DATABASE_URL'),
          max: 20,
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 5_000,
          ssl:
            config.get<string>('NODE_ENV') === 'production'
              ? { rejectUnauthorized: true }
              : false,
        });
      },
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}
