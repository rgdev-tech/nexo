import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { SupabaseGuard } from '../../shared/guards/supabase.guard';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../shared/dto/error-response.dto';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('api/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a price alert' })
  @ApiCreatedResponse({ description: 'Alert created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid body parameters.', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.', type: ErrorResponseDto })
  async create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateAlertDto,
  ) {
    return this.alertsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all alerts for the authenticated user' })
  @ApiOkResponse({ description: 'Returns the list of alerts.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.', type: ErrorResponseDto })
  async findAll(@Request() req: { user: { id: string } }) {
    return this.alertsService.findAll(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an alert (toggle enabled)' })
  @ApiParam({ name: 'id', description: 'Alert ID (UUID)' })
  @ApiOkResponse({ description: 'Alert updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid body parameters.', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Alert not found.', type: ErrorResponseDto })
  async update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateAlertDto,
  ) {
    return this.alertsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an alert' })
  @ApiParam({ name: 'id', description: 'Alert ID (UUID)' })
  @ApiOkResponse({ description: 'Alert deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated.', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Alert not found.', type: ErrorResponseDto })
  async remove(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    await this.alertsService.remove(req.user.id, id);
    return { ok: true, message: 'Alert deleted' };
  }
}
