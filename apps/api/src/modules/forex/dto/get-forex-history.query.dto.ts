import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ALLOWED_CURRENCIES, DAYS_MIN, DAYS_MAX_FOREX, type AllowedCurrency } from '../../../shared/constants';

export class GetForexHistoryQueryDto {
  @ApiPropertyOptional({
    description: `Number of days (${DAYS_MIN}-${DAYS_MAX_FOREX})`,
    minimum: DAYS_MIN,
    maximum: DAYS_MAX_FOREX,
    default: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'days must be an integer' })
  @Min(DAYS_MIN, { message: `days must be at least ${DAYS_MIN}` })
  @Max(DAYS_MAX_FOREX, { message: `days must be at most ${DAYS_MAX_FOREX}` })
  days?: number = 30;

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
