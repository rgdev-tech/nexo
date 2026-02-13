import { Controller, Get, Query, Header } from '@nestjs/common';
import { VesService } from './ves.service';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { GetVesHistoryQueryDto } from './dto/get-ves-history.query.dto';
import { UsdToVesDto, VesHistoryResponseDto } from '../../shared/dto/responses';
import { ErrorResponseDto } from '../../shared/dto/error-response.dto';

@ApiTags('VES')
@Controller('api/prices/ves')
export class VesController {
  constructor(private readonly vesService: VesService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=900')
  @ApiOperation({ summary: 'Get current VES price (Official & Parallel)' })
  @ApiOkResponse({ description: 'Returns current USD to VES rates.', type: UsdToVesDto })
  async getPrice() {
    return this.vesService.getPrice();
  }

  @Get('history')
  @Header('Cache-Control', 'public, max-age=1800')
  @ApiOperation({ summary: 'Get VES price history' })
  @ApiOkResponse({ description: 'Returns historical data for VES rates.', type: VesHistoryResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.', type: ErrorResponseDto })
  async getHistory(@Query() dto: GetVesHistoryQueryDto) {
    const history = await this.vesService.getHistory(dto.days);
    return { history };
  }
}
