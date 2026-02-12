import { Controller, Get, UseGuards, Logger, BadGatewayException } from '@nestjs/common';
import { VesService } from '../ves/ves.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CronAuthGuard } from '../../shared/guards/cron-auth.guard';

@ApiTags('Cron')
@Controller('api/cron')
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(private readonly vesService: VesService) {}

  @Get('ves-snapshot')
  @UseGuards(CronAuthGuard)
  @ApiOperation({ summary: 'Cron: save VES snapshot (protected by CRON_SECRET)' })
  @ApiResponse({ status: 200, description: 'VES snapshot saved.' })
  @ApiResponse({ status: 400, description: 'Invalid Authorization header format.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 502, description: 'VES fetch/save failed.' })
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
}
