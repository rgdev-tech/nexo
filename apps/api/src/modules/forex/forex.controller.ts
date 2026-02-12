import { Controller, Get, Query } from '@nestjs/common';
import { ForexService } from './forex.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetForexRateQueryDto } from './dto/get-forex-rate.query.dto';
import { GetForexHistoryQueryDto } from './dto/get-forex-history.query.dto';

@ApiTags('Forex')
@Controller('api/prices/forex')
export class ForexController {
  constructor(private readonly forexService: ForexService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get forex rate history' })
  @ApiResponse({ status: 200, description: 'Returns historical exchange rates.' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
  async getHistory(@Query() dto: GetForexHistoryQueryDto) {
    const history = await this.forexService.getHistory(dto.from, dto.to, dto.days);
    return { history };
  }

  @Get()
  @ApiOperation({ summary: 'Get current forex rate' })
  @ApiResponse({ status: 200, description: 'Returns current exchange rate.' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
  @ApiResponse({ status: 404, description: 'Rate not found.' })
  async getRate(@Query() dto: GetForexRateQueryDto) {
    return this.forexService.getRate(dto.from, dto.to);
  }
}
