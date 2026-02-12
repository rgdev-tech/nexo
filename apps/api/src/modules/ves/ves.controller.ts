import { Controller, Get, Query } from '@nestjs/common';
import { VesService } from './ves.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetVesHistoryQueryDto } from './dto/get-ves-history.query.dto';

@ApiTags('VES')
@Controller('api/prices/ves')
export class VesController {
  constructor(private readonly vesService: VesService) {}

  @Get()
  @ApiOperation({ summary: 'Get current VES price (Official & Parallel)' })
  @ApiResponse({ status: 200, description: 'Returns current USD to VES rates.' })
  async getPrice() {
    return this.vesService.getPrice();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get VES price history' })
  @ApiResponse({ status: 200, description: 'Returns historical data for VES rates.' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
  async getHistory(@Query() dto: GetVesHistoryQueryDto) {
    const history = await this.vesService.getHistory(dto.days);
    return { history };
  }
}
