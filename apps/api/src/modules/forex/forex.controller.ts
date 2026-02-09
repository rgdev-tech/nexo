import { Controller, Get, Query, NotFoundException, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ForexService } from './forex.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Forex')
@Controller('api/prices/forex')
export class ForexController {
  constructor(private readonly forexService: ForexService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get forex rate history' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days (default: 30)' })
  @ApiQuery({ name: 'from', required: false, description: 'Base currency (default: USD)', example: 'USD' })
  @ApiQuery({ name: 'to', required: false, description: 'Target currency (default: EUR)', example: 'EUR' })
  @ApiResponse({ status: 200, description: 'Returns historical exchange rates.' })
  async getHistory(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    @Query('from', new DefaultValuePipe('USD')) from: string,
    @Query('to', new DefaultValuePipe('EUR')) to: string,
  ) {
    const history = await this.forexService.getHistory(from, to, days);
    return { history };
  }

  @Get()
  @ApiOperation({ summary: 'Get current forex rate' })
  @ApiQuery({ name: 'from', required: false, description: 'Base currency (default: USD)', example: 'USD' })
  @ApiQuery({ name: 'to', required: false, description: 'Target currency (default: EUR)', example: 'EUR' })
  @ApiResponse({ status: 200, description: 'Returns current exchange rate.' })
  @ApiResponse({ status: 404, description: 'Rate not found.' })
  async getRate(
    @Query('from', new DefaultValuePipe('USD')) from: string,
    @Query('to', new DefaultValuePipe('EUR')) to: string,
  ) {
    const result = await this.forexService.getRate(from, to);
    if (!result) {
      throw new NotFoundException({ error: "not_found", message: `No rate for ${from} → ${to}` });
    }
    return result;
  }
}
