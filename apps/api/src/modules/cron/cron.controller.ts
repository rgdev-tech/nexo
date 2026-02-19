import { Controller, Get, UseGuards, Logger, BadGatewayException } from '@nestjs/common';
import { VesService } from '../ves/ves.service';
import { AlertsEvaluatorService } from '../alerts/alerts-evaluator.service';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth, ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { CronAuthGuard } from '../../shared/guards/cron-auth.guard';
import { CronSnapshotResponseDto } from '../../shared/dto/responses';
import { ErrorResponseDto } from '../../shared/dto/error-response.dto';

@ApiBearerAuth()
@ApiTags('Cron')
@Controller('api/cron')
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(
    private readonly vesService: VesService,
    private readonly alertsEvaluatorService: AlertsEvaluatorService,
  ) {}

  @Get('ves-snapshot')
  @UseGuards(CronAuthGuard)
  @ApiOperation({ summary: 'Cron: save VES snapshot (protected by CRON_SECRET)' })
  @ApiOkResponse({ description: 'VES snapshot saved.', type: CronSnapshotResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid Authorization header format.', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 502, description: 'VES fetch/save failed.', type: ErrorResponseDto })
  async vesSnapshot() {
    try {
      await this.vesService.fetchAndSaveVes();
      return { ok: true, message: 'VES snapshot saved' };
    } catch (e) {
      this.logger.error('fetchAndSaveVes failed', e instanceof Error ? e : e);
      throw new BadGatewayException({
        error: 'ves_snapshot_failed',
        message: 'Failed to fetch or save VES snapshot',
      });
    }
  }

  @Get('evaluate-alerts')
  @UseGuards(CronAuthGuard)
  @ApiOperation({ summary: 'Cron: evaluate all active price alerts (protected by CRON_SECRET)' })
  @ApiOkResponse({ description: 'Alerts evaluated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid Authorization header format.', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.', type: ErrorResponseDto })
  @ApiResponse({ status: 502, description: 'Alert evaluation failed.', type: ErrorResponseDto })
  async evaluateAlerts() {
    try {
      const result = await this.alertsEvaluatorService.evaluateAll();
      return { ok: true, ...result };
    } catch (e) {
      this.logger.error('evaluateAlerts failed', e instanceof Error ? e : e);
      throw new BadGatewayException({
        error: 'evaluate_alerts_failed',
        message: 'Failed to evaluate alerts',
      });
    }
  }
}
