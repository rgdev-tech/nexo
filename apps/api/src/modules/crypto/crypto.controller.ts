import { Controller, Get, Query, Param, Header } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { GetCryptoPricesQueryDto } from './dto/get-crypto-prices.query.dto';
import { GetCryptoHistoryQueryDto } from './dto/get-crypto-history.query.dto';
import { GetCryptoPriceParamDto } from './dto/get-crypto-price.param.dto';
import { CryptoPriceDto, CryptoPricesResponseDto, CryptoHistoryResponseDto } from '../../shared/dto/responses';
import { ErrorResponseDto } from '../../shared/dto/error-response.dto';

@ApiTags('Crypto')
@Controller('api/prices/crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('history')
  @Header('Cache-Control', 'public, max-age=600')
  @ApiOperation({ summary: 'Get cryptocurrency price history' })
  @ApiOkResponse({ description: 'Returns historical price data.', type: CryptoHistoryResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.', type: ErrorResponseDto })
  async getHistory(@Query() dto: GetCryptoHistoryQueryDto) {
    const history = await this.cryptoService.getHistory(dto.symbol, dto.currency, dto.days);
    return { history };
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  @ApiOperation({ summary: 'Get current prices for multiple cryptocurrencies' })
  @ApiOkResponse({ description: 'Returns list of current prices.', type: CryptoPricesResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.', type: ErrorResponseDto })
  async getPrices(@Query() dto: GetCryptoPricesQueryDto) {
    const symbols = this.cryptoService.parseSymbols(dto.symbols);
    const prices = await this.cryptoService.getPrices(symbols, dto.currency);
    return { prices };
  }

  @Get(':symbol')
  @Header('Cache-Control', 'public, max-age=60')
  @ApiOperation({ summary: 'Get current price for a single cryptocurrency' })
  @ApiOkResponse({ description: 'Returns current price.', type: CryptoPriceDto })
  @ApiBadRequestResponse({ description: 'Invalid symbol.', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Symbol not found.', type: ErrorResponseDto })
  async getPrice(
    @Param() params: GetCryptoPriceParamDto,
    @Query() dto: GetCryptoPricesQueryDto,
  ) {
    return this.cryptoService.getPrice(params.symbol, dto.currency);
  }
}
