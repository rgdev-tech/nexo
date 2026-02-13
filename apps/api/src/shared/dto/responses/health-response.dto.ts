import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', description: 'Health status' })
  status!: string;

  @ApiProperty({ example: '2025-01-15T12:00:00.000Z', description: 'Current server timestamp' })
  timestamp!: string;
}

export class RootResponseDto {
  @ApiProperty({ example: '🚀 Nexo API', description: 'API name' })
  name!: string;

  @ApiProperty({ example: 'ok', description: 'API status' })
  status!: string;

  @ApiProperty({ example: '/api/docs', description: 'Swagger docs URL' })
  docs!: string;

  @ApiProperty({
    description: 'Available API endpoints',
    example: {
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
  })
  endpoints!: Record<string, unknown>;
}
