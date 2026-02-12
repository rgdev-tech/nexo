import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VesService } from '../ves/ves.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ParseBearerTokenPipe } from '../../shared/pipes/parse-bearer-token.pipe';

@ApiTags('Cron')
@Controller('api/cron')
export class CronController {
  private readonly bearerPipe = new ParseBearerTokenPipe();

  constructor(
    private readonly vesService: VesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('ves-snapshot')
  @ApiOperation({ summary: 'Cron: save VES snapshot (protected by CRON_SECRET)' })
  @ApiResponse({ status: 200, description: 'VES snapshot saved.' })
  @ApiResponse({ status: 400, description: 'Invalid Authorization header format.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async vesSnapshot(@Headers('authorization') authHeader?: string) {
    const token = this.bearerPipe.transform(authHeader);

    const secret = this.configService.get<string>('CRON_SECRET');
    if (!secret) {
      throw new UnauthorizedException('CRON_SECRET not configured');
    }
    if (token !== secret) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    await this.vesService.fetchAndSaveVes();
    return { ok: true, message: 'VES snapshot saved' };
  }
}
