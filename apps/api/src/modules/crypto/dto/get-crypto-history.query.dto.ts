import { IsOptional, IsIn, IsNotEmpty, IsString, Min, Max, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ALLOWED_CURRENCIES, DAYS_MIN, DAYS_MAX_CRYPTO, type AllowedCurrency } from '../../../shared/constants';

export class GetCryptoHistoryQueryDto {
  @ApiProperty({
    description: 'Crypto symbol (e.g. BTC)',
    example: 'BTC',
    default: 'BTC',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'symbol must not be empty' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value))
  symbol: string = 'BTC';

  @ApiPropertyOptional({
    description: `Number of days (${DAYS_MIN}-${DAYS_MAX_CRYPTO})`,
    minimum: DAYS_MIN,
    maximum: DAYS_MAX_CRYPTO,
    default: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'days must be an integer' })
  @Min(DAYS_MIN, { message: `days must be at least ${DAYS_MIN}` })
  @Max(DAYS_MAX_CRYPTO, { message: `days must be at most ${DAYS_MAX_CRYPTO}` })
  days: number = 7;

  @ApiPropertyOptional({
    description: 'Target currency',
    enum: ALLOWED_CURRENCIES,
    default: 'USD',
  })
  @IsOptional()
  @IsIn(ALLOWED_CURRENCIES, { message: `currency must be one of: ${ALLOWED_CURRENCIES.join(', ')}` })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  currency: AllowedCurrency = 'USD';
}
