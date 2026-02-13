import { IsOptional, IsString, IsObject, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserPreferencesDto } from '../../../shared/dto/responses';
import type { UserPreferences } from '../../../shared/types';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'First name', example: 'John', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;

  @ApiPropertyOptional({ description: 'Avatar URL', example: 'https://example.com/avatar.png', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar_url?: string;

  @ApiPropertyOptional({ description: 'User preferences', type: UserPreferencesDto })
  @IsOptional()
  @IsObject()
  preferences?: UserPreferences;
}
