import { IsOptional, IsString, IsObject, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar_url?: string;

  @IsOptional()
  @IsObject()
  preferences?: Record<string, unknown>;
}
