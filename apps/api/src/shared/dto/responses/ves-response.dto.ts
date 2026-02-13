import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UsdToVesDto {
  @ApiProperty({ example: 'USD', description: 'Base currency' })
  from: string;

  @ApiProperty({ example: 'VES', description: 'Target currency' })
  to: string;

  @ApiProperty({ example: 36.5, description: 'Official exchange rate' })
  oficial: number;

  @ApiProperty({ example: 39.8, description: 'Parallel (market) exchange rate' })
  paralelo: number;

  @ApiProperty({ example: '2025-01-15', description: 'Rate date (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ example: 'dolarapi', description: 'Data source' })
  source: string;

  @ApiProperty({ example: 1700000000000, description: 'Unix timestamp in milliseconds' })
  timestamp: number;
}

export class VesHistoryDayDto {
  @ApiProperty({ example: '2025-01-15', description: 'Date (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ example: 36.5, description: 'Official exchange rate' })
  oficial: number;

  @ApiProperty({ example: 39.8, description: 'Parallel (market) exchange rate' })
  paralelo: number;

  @ApiPropertyOptional({ example: 33.2, description: 'Official rate in EUR' })
  oficial_eur?: number;

  @ApiPropertyOptional({ example: 36.1, description: 'Parallel rate in EUR' })
  paralelo_eur?: number;
}

export class VesHistoryResponseDto {
  @ApiProperty({ type: [VesHistoryDayDto], description: 'Historical VES rate data' })
  history: VesHistoryDayDto[];
}
