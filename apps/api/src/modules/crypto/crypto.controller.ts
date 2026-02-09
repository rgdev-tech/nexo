import { Controller, Get, Query, Param, NotFoundException, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { CryptoService } from './crypto.service';

@Controller('api/prices/crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('history')
  async getHistory(
    @Query('symbol', new DefaultValuePipe('BTC')) symbol: string,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
    @Query('currency', new DefaultValuePipe('USD')) currency: string,
  ) {
    const history = await this.cryptoService.getHistory(symbol, currency, days);
    return { history };
  }

  @Get()
  async getPrices(
    @Query('symbols') symbolsParam: string,
    @Query('currency', new DefaultValuePipe('USD')) currency: string,
  ) {
    const symbols = symbolsParam ? symbolsParam.split(",").map((s) => s.trim()).filter(Boolean) : ["BTC", "ETH"];
    const prices = await this.cryptoService.getPrices(symbols, currency);
    return { prices };
  }

  @Get(':symbol')
  async getPrice(
    @Param('symbol') symbol: string,
    @Query('currency', new DefaultValuePipe('USD')) currency: string,
  ) {
    const decodedSymbol = decodeURIComponent(symbol);
    const result = await this.cryptoService.getPrice(decodedSymbol, currency);
    if (!result) {
      throw new NotFoundException({ error: "not_found", message: `No price for ${decodedSymbol}` });
    }
    return result;
  }
}
