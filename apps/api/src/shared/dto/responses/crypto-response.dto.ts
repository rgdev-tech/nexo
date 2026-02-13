import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CryptoPriceDto {
  @ApiProperty({ example: 'BTC', description: 'Cryptocurrency symbol' })
  symbol: string;

  @ApiProperty({ example: 64250.5, description: 'Current price' })
  price: number;

  @ApiProperty({ example: 'USD', description: 'Currency of the price' })
  currency: string;

  @ApiProperty({ example: 'binance', description: 'Data source' })
  source: string;

  @ApiProperty({ example: 1700000000000, description: 'Unix timestamp in milliseconds' })
  timestamp: number;

  @ApiPropertyOptional({ example: -2.35, description: '24h price change percentage' })
  change24h?: number;
}

export class CryptoPricesResponseDto {
  @ApiProperty({ type: [CryptoPriceDto], description: 'List of cryptocurrency prices' })
  prices: CryptoPriceDto[];
}

export class CryptoHistoryDayDto {
  @ApiProperty({ example: '2025-01-15', description: 'Date (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ example: 64250.5, description: 'Price on that date' })
  price: number;
}

export class CryptoHistoryResponseDto {
  @ApiProperty({ type: [CryptoHistoryDayDto], description: 'Historical price data' })
  history: CryptoHistoryDayDto[];
}
