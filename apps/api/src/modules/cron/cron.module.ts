import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { VesModule } from '../ves/ves.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [VesModule, AlertsModule],
  controllers: [CronController],
})
export class CronModule {}
