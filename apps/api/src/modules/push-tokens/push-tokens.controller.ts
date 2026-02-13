import { Controller, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { PushTokensService } from './push-tokens.service';
import { SupabaseGuard } from '../../shared/guards/supabase.guard';
import { RegisterTokenDto } from './dto/register-token.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../shared/dto/error-response.dto';

@ApiTags('Push Tokens')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('api/push-tokens')
export class PushTokensController {
  constructor(private readonly pushTokensService: PushTokensService) {}

  @Post()
  @ApiOperation({ summary: 'Register an Expo push token' })
  @ApiCreatedResponse({ description: 'Token registered successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid body parameters.', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.', type: ErrorResponseDto })
  async register(
    @Request() req: { user: { id: string } },
    @Body() dto: RegisterTokenDto,
  ) {
    return this.pushTokensService.register(req.user.id, dto.token, dto.platform);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove an Expo push token' })
  @ApiOkResponse({ description: 'Token removed successfully.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.', type: ErrorResponseDto })
  async remove(
    @Request() req: { user: { id: string } },
    @Body() body: { token: string },
  ) {
    await this.pushTokensService.remove(req.user.id, body.token);
    return { ok: true, message: 'Token removed' };
  }
}
