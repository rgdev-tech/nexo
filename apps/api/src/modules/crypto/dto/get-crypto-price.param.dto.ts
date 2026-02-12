import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetCryptoPriceParamDto {
  @ApiProperty({
    description: 'Crypto symbol (e.g. BTC)',
    example: 'BTC',
  })
  @IsString()
  @IsNotEmpty({ message: 'symbol must not be empty' })
  @Transform(({ value }) => (typeof value === 'string' ? decodeURIComponent(value).toUpperCase().trim() : value))
  symbol!: string;
}
