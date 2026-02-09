import { Controller, Get, Query, Param, NotFoundException, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Crypto')
@Controller('api/prices/crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get cryptocurrency price history' })
  @ApiQuery({ name: 'symbol', required: false, description: 'Crypto symbol (e.g. BTC)', example: 'BTC' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days (default: 7)' })
  @ApiQuery({ name: 'currency', required: false, description: 'Target currency (default: USD)', example: 'USD' })
  @ApiResponse({ status: 200, description: 'Returns historical price data.' })
  async getHistory(
    @Query('symbol', new DefaultValuePipe('BTC')) symbol: string,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
    @Query('currency', new DefaultValuePipe('USD')) currency: string,
  ) {
    const history = await this.cryptoService.getHistory(symbol, currency, days);
    return { history };
  }

  @Get()
  @ApiOperation({ summary: 'Get current prices for multiple cryptocurrencies' })
  @ApiQuery({ name: 'symbols', required: false, description: 'Comma-separated symbols (e.g. BTC,ETH)', example: 'BTC,ETH' })
  @ApiQuery({ name: 'currency', required: false, description: 'Target currency (default: USD)', example: 'USD' })
  @ApiResponse({ status: 200, description: 'Returns list of current prices.' })
  async getPrices(
    @Query('symbols') symbolsParam: string,
    @Query('currency', new DefaultValuePipe('USD')) currency: string,
  ) {
    const symbols = symbolsParam ? symbolsParam.split(",").map((s) => s.trim()).filter(Boolean) : ["BTC", "ETH"];
    const prices = await this.cryptoService.getPrices(symbols, currency);
    return { prices };
  }

  @Get(':symbol')
  @ApiOperation({ summary: 'Get current price for a single cryptocurrency' })
  @ApiParam({ name: 'symbol', description: 'Crypto symbol (e.g. BTC)', example: 'BTC' })
  @ApiQuery({ name: 'currency', required: false, description: 'Target currency (default: USD)', example: 'USD' })
  @ApiResponse({ status: 200, description: 'Returns current price.' })
  @ApiResponse({ status: 404, description: 'Symbol not found.' })
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
