import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { VesService } from './ves.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

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
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to retrieve (default: 7)' })
  @ApiResponse({ status: 200, description: 'Returns historical data for VES rates.' })
  async getHistory(
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number
  ) {
    const daysValid = Math.min(90, Math.max(1, days));
    const history = await this.vesService.getHistory(daysValid);
    return { history };
  }
}
