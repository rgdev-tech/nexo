import { Module } from '@nestjs/common';
import { CronController } from './cron.controller';
import { VesModule } from '../ves/ves.module';

@Module({
  imports: [VesModule],
  controllers: [CronController],
})
export class CronModule {}
