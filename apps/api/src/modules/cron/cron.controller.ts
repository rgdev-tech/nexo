import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { VesService } from '../ves/ves.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Cron')
@Controller('api/cron')
export class CronController {
  constructor(private readonly vesService: VesService) {}

  @Get('ves-snapshot')
  @ApiOperation({ summary: 'Cron: save VES snapshot (protected by CRON_SECRET)' })
  @ApiResponse({ status: 200, description: 'VES snapshot saved.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async vesSnapshot(@Headers('authorization') authHeader?: string) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      throw new UnauthorizedException('CRON_SECRET not configured');
    }
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    if (token !== secret) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    await this.vesService.fetchAndSaveVes();
    return { ok: true, message: 'VES snapshot saved' };
  }
}
