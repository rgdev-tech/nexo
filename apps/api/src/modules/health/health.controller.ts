import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('api')
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'API is healthy.' })
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
