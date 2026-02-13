import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertsEvaluatorService } from './alerts-evaluator.service';
import { SharedModule } from '../../shared/shared.module';
import { PushTokensModule } from '../push-tokens/push-tokens.module';
import { VesModule } from '../ves/ves.module';
import { CryptoModule } from '../crypto/crypto.module';
import { ForexModule } from '../forex/forex.module';

@Module({
  imports: [SharedModule, PushTokensModule, VesModule, CryptoModule, ForexModule],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsEvaluatorService],
  exports: [AlertsService, AlertsEvaluatorService],
})
export class AlertsModule {}
