import { ApiProperty } from '@nestjs/swagger';

export class CronSnapshotResponseDto {
  @ApiProperty({ example: true, description: 'Whether the operation succeeded' })
  ok: boolean;

  @ApiProperty({ example: 'VES snapshot saved', description: 'Result message' })
  message: string;
}
