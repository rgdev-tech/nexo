import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DAYS_MIN, DAYS_MAX_VES } from '../../../shared/constants';

export class GetVesHistoryQueryDto {
  @ApiPropertyOptional({
    description: `Number of days (${DAYS_MIN}-${DAYS_MAX_VES})`,
    minimum: DAYS_MIN,
    maximum: DAYS_MAX_VES,
    default: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'days must be an integer' })
  @Min(DAYS_MIN, { message: `days must be at least ${DAYS_MIN}` })
  @Max(DAYS_MAX_VES, { message: `days must be at most ${DAYS_MAX_VES}` })
  days: number = 7;
}
