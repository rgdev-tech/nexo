import { Controller, Get, UseGuards, Logger, BadGatewayException } from '@nestjs/common';
import { VesService } from '../ves/ves.service';
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

  constructor(private readonly vesService: VesService) {}

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
}
