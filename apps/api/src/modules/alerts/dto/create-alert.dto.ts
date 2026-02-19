import { IsIn, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty({ description: 'Alert type', enum: ['ves', 'crypto', 'forex'], example: 'ves' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['ves', 'crypto', 'forex'])
  type!: string;

  @ApiProperty({ description: 'Symbol to track', example: 'paralelo' })
  @IsNotEmpty()
  @IsString()
  symbol!: string;

  @ApiProperty({ description: 'Price threshold', example: 50.0 })
  @IsNumber()
  @Min(0.000001)
  threshold!: number;

  @ApiProperty({ description: 'Direction: fire when price goes above or below threshold', enum: ['above', 'below'], example: 'above' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['above', 'below'])
  direction!: string;
}
