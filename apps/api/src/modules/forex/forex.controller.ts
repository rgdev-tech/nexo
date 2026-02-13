import { Controller, Get, Query } from '@nestjs/common';
import { ForexService } from './forex.service';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { GetForexRateQueryDto } from './dto/get-forex-rate.query.dto';
import { GetForexHistoryQueryDto } from './dto/get-forex-history.query.dto';
import { ForexRateDto, ForexHistoryResponseDto } from '../../shared/dto/responses';
import { ErrorResponseDto } from '../../shared/dto/error-response.dto';

@ApiTags('Forex')
@Controller('api/prices/forex')
export class ForexController {
  constructor(private readonly forexService: ForexService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get forex rate history' })
  @ApiOkResponse({ description: 'Returns historical exchange rates.', type: ForexHistoryResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.', type: ErrorResponseDto })
  async getHistory(@Query() dto: GetForexHistoryQueryDto) {
    const history = await this.forexService.getHistory(dto.from, dto.to, dto.days);
    return { history };
  }

  @Get()
  @ApiOperation({ summary: 'Get current forex rate' })
  @ApiOkResponse({ description: 'Returns current exchange rate.', type: ForexRateDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters.', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Rate not found.', type: ErrorResponseDto })
  async getRate(@Query() dto: GetForexRateQueryDto) {
    return this.forexService.getRate(dto.from, dto.to);
  }
}
