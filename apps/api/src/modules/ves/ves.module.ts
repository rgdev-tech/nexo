import { Module } from '@nestjs/common';
import { VesController } from './ves.controller';
import { VesService } from './ves.service';

import { ForexModule } from '../forex/forex.module';

@Module({
  imports: [ForexModule],
  controllers: [VesController],
  providers: [VesService],
  exports: [VesService],
})
export class VesModule {}
