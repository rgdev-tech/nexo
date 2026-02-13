import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAlertDto {
  @ApiProperty({ description: 'Whether the alert is enabled', example: true })
  @IsBoolean()
  enabled!: boolean;
}
