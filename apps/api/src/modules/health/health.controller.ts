import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Root' })
  @ApiResponse({ status: 200, description: 'API info.' })
  getRoot() {
    return { name: '🚀 Nexo API', status: 'ok', docs: '/api/docs' };
  }

  @Get('api/health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'API is healthy.' })
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
