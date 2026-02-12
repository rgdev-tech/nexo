import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

import { SharedModule } from './shared/shared.module';

import { VesModule } from './modules/ves/ves.module';
import { CryptoModule } from './modules/crypto/crypto.module';
import { ForexModule } from './modules/forex/forex.module';

import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CronModule } from './modules/cron/cron.module';
import { HealthModule } from './modules/health/health.module';

import {
  THROTTLE_TTL_MS,
  THROTTLE_LIMIT,
  CACHE_TTL_DEFAULT,
} from './shared/constants';
import { getConfigNumber } from './shared/config-utils';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    SharedModule,
    VesModule,
    CryptoModule,
    ForexModule,
    UsersModule,
    AuthModule,
    CronModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [{
        ttl: getConfigNumber(config, 'THROTTLE_TTL_MS', THROTTLE_TTL_MS),
        limit: getConfigNumber(config, 'THROTTLE_LIMIT', THROTTLE_LIMIT),
      }],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: getConfigNumber(config, 'CACHE_TTL_DEFAULT', CACHE_TTL_DEFAULT),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class CoreModule {}
