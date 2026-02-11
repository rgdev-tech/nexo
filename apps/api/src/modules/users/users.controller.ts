import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../../shared/guards/supabase.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile.' })
  async getProfile(@Request() req: { user: { id: string } }) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Returns the updated user profile.' })
  async updateProfile(@Request() req: { user: { id: string } }, @Body() updates: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updates);
  }
}
