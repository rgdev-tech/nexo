import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { VesService } from './ves.service';

@Controller('api/prices/ves')
export class VesController {
  constructor(private readonly vesService: VesService) {}

  @Get()
  async getPrice() {
    return this.vesService.getPrice();
  }

  @Get('history')
  async getHistory(
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number
  ) {
    const daysValid = Math.min(90, Math.max(1, days));
    const history = await this.vesService.getHistory(daysValid);
    return { history };
  }
}
