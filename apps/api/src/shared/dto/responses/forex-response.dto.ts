import { ApiProperty } from '@nestjs/swagger';

export class ForexRateDto {
  @ApiProperty({ example: 'USD', description: 'Base currency' })
  from!: string;

  @ApiProperty({ example: 'EUR', description: 'Target currency' })
  to!: string;

  @ApiProperty({ example: 0.92, description: 'Exchange rate' })
  rate!: number;

  @ApiProperty({ example: '2025-01-15', description: 'Rate date (YYYY-MM-DD)' })
  date!: string;

  @ApiProperty({ example: 'frankfurter', description: 'Data source' })
  source!: string;

  @ApiProperty({ example: 1700000000000, description: 'Unix timestamp in milliseconds' })
  timestamp!: number;
}

export class ForexHistoryDayDto {
  @ApiProperty({ example: '2025-01-15', description: 'Date (YYYY-MM-DD)' })
  date!: string;

  @ApiProperty({ example: 0.92, description: 'Exchange rate on that date' })
  rate!: number;
}

export class ForexHistoryResponseDto {
  @ApiProperty({ type: [ForexHistoryDayDto], description: 'Historical exchange rate data' })
  history!: ForexHistoryDayDto[];
}
