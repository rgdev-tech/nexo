import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ParseBearerTokenPipe } from '../pipes/parse-bearer-token.pipe';

@Injectable()
export class CronAuthGuard implements CanActivate {
  private readonly bearerPipe = new ParseBearerTokenPipe();

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.bearerPipe.transform(request.headers.authorization);

    const secret = this.configService.get<string>('CRON_SECRET');
    if (!secret) {
      throw new UnauthorizedException('CRON_SECRET not configured');
    }
    if (token !== secret) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    return true;
  }
}
