import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Root' })
  @ApiResponse({ status: 200, description: 'API info.' })
  getRoot() {
    return {
      name: '🚀 Nexo API',
      status: 'ok',
      docs: '/api/docs',
      endpoints: {
        health: 'GET /api/health',
        prices: {
          ves: 'GET /api/prices/ves',
          vesHistory: 'GET /api/prices/ves/history?days=7',
          forex: 'GET /api/prices/forex?from=USD&to=EUR',
          forexHistory: 'GET /api/prices/forex/history?days=7&from=USD&to=EUR',
          crypto: 'GET /api/prices/crypto?symbols=BTC,ETH&currency=USD',
          cryptoHistory: 'GET /api/prices/crypto/history?symbol=BTC&days=7&currency=USD',
          cryptoBySymbol: 'GET /api/prices/crypto/:symbol',
        },
        users: {
          getProfile: 'GET /api/users/profile',
          updateProfile: 'PATCH /api/users/profile',
        },
        cron: {
          vesSnapshot: 'GET /api/cron/ves-snapshot',
        },
      },
    };
  }

  @Get('api/health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'API is healthy.' })
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
