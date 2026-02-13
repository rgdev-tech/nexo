import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserPreferencesDto {
  @ApiPropertyOptional({ example: 'USD', description: 'Default currency for display' })
  defaultCurrency?: string;

  @ApiPropertyOptional({ example: ['BTC', 'ETH'], description: 'List of favorite crypto symbols' })
  favoriteCryptos?: string[];

  @ApiPropertyOptional({ enum: ['light', 'dark'], description: 'UI theme preference' })
  theme?: 'light' | 'dark';

  @ApiPropertyOptional({ example: false, description: 'Whether Face ID is enabled for balance' })
  balanceFaceIdEnabled?: boolean;
}

export class UserProfileDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'User ID' })
  id!: string;

  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  first_name?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  last_name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', description: 'Avatar URL' })
  avatar_url?: string;

  @ApiPropertyOptional({ type: UserPreferencesDto, description: 'User preferences' })
  preferences?: UserPreferencesDto;
}
