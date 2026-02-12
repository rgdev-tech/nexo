import { IsOptional, IsIn, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ALLOWED_CURRENCIES, type AllowedCurrency } from '../../../shared/constants';

export class GetCryptoPricesQueryDto {
  @ApiPropertyOptional({
    description: 'Comma-separated crypto symbols',
    example: 'BTC,ETH',
    default: 'BTC,ETH',
  })
  @IsOptional()
  @IsString()
  symbols?: string;

  @ApiPropertyOptional({
    description: 'Target currency',
    enum: ALLOWED_CURRENCIES,
    default: 'USD',
  })
  @IsOptional()
  @IsIn(ALLOWED_CURRENCIES, { message: `currency must be one of: ${ALLOWED_CURRENCIES.join(', ')}` })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  currency?: AllowedCurrency = 'USD';
}
