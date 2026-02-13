import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../../shared/guards/supabase.guard';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from '../../shared/dto/responses';
import { ErrorResponseDto } from '../../shared/dto/error-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse({ description: 'Returns the user profile.', type: UserProfileDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Profile not found.', type: ErrorResponseDto })
  async getProfile(@Request() req: { user: { id: string } }) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiOkResponse({ description: 'Returns the updated user profile.', type: UserProfileDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid body parameters.', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Profile not found.', type: ErrorResponseDto })
  async updateProfile(@Request() req: { user: { id: string } }, @Body() updates: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updates);
  }
}
