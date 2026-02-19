import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTokenDto {
  @ApiProperty({ description: 'Expo push token', example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' })
  @IsNotEmpty()
  @IsString()
  token!: string;

  @ApiProperty({ description: 'Device platform', enum: ['ios', 'android', 'web'], example: 'ios' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['ios', 'android', 'web'])
  platform!: string;
}
