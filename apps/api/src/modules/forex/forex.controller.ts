import { Controller, Get, Query, NotFoundException, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ForexService } from './forex.service';

@Controller('api/prices/forex')
export class ForexController {
  constructor(private readonly forexService: ForexService) {}

  @Get('history')
  async getHistory(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    @Query('from', new DefaultValuePipe('USD')) from: string,
    @Query('to', new DefaultValuePipe('EUR')) to: string,
  ) {
    const history = await this.forexService.getHistory(from, to, days);
    return { history };
  }

  @Get()
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
