import { IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ALLOWED_CURRENCIES, type AllowedCurrency } from '../../../shared/constants';

export class GetForexRateQueryDto {
  @ApiPropertyOptional({
    description: 'Base currency',
    enum: ALLOWED_CURRENCIES,
    default: 'USD',
  })
  @IsOptional()
  @IsIn(ALLOWED_CURRENCIES, { message: `from must be one of: ${ALLOWED_CURRENCIES.join(', ')}` })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  from?: AllowedCurrency = 'USD';

  @ApiPropertyOptional({
    description: 'Target currency',
    enum: ALLOWED_CURRENCIES,
    default: 'EUR',
  })
  @IsOptional()
  @IsIn(ALLOWED_CURRENCIES, { message: `to must be one of: ${ALLOWED_CURRENCIES.join(', ')}` })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  to?: AllowedCurrency = 'EUR';
}
