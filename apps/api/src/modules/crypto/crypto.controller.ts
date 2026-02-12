import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetCryptoPricesQueryDto } from './dto/get-crypto-prices.query.dto';
import { GetCryptoHistoryQueryDto } from './dto/get-crypto-history.query.dto';
import { GetCryptoPriceParamDto } from './dto/get-crypto-price.param.dto';

@ApiTags('Crypto')
@Controller('api/prices/crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get cryptocurrency price history' })
  @ApiResponse({ status: 200, description: 'Returns historical price data.' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
  async getHistory(@Query() dto: GetCryptoHistoryQueryDto) {
    const history = await this.cryptoService.getHistory(dto.symbol!, dto.currency!, dto.days!);
    return { history };
  }

  @Get()
  @ApiOperation({ summary: 'Get current prices for multiple cryptocurrencies' })
  @ApiResponse({ status: 200, description: 'Returns list of current prices.' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
  async getPrices(@Query() dto: GetCryptoPricesQueryDto) {
    const symbols = dto.symbols
      ? dto.symbols.split(',').map((s) => s.trim()).filter(Boolean)
      : ['BTC', 'ETH'];
    const prices = await this.cryptoService.getPrices(symbols, dto.currency!);
    return { prices };
  }

  @Get(':symbol')
  @ApiOperation({ summary: 'Get current price for a single cryptocurrency' })
  @ApiResponse({ status: 200, description: 'Returns current price.' })
  @ApiResponse({ status: 400, description: 'Invalid symbol.' })
  @ApiResponse({ status: 404, description: 'Symbol not found.' })
  async getPrice(
    @Param() params: GetCryptoPriceParamDto,
    @Query() dto: GetCryptoPricesQueryDto,
  ) {
    const result = await this.cryptoService.getPrice(params.symbol, dto.currency!);
    if (!result) {
      throw new NotFoundException({ error: 'not_found', message: `No price for ${params.symbol}` });
    }
    return result;
  }
}
