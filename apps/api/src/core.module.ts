import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    HealthModule,
    SharedModule,
    VesModule,
    CryptoModule,
    ForexModule,
    UsersModule,
    AuthModule,
    CronModule,
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 1 minute default
    }),
  ],
  controllers: [],
  providers: [],
})
export class CoreModule {}
