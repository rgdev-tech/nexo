import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Pipe que valida que el header Authorization tenga formato "Bearer <token>"
 * y devuelve el token limpio (sin el prefijo "Bearer ").
 */
@Injectable()
export class ParseBearerTokenPipe implements PipeTransform<string | undefined, string> {
  transform(value: string | undefined): string {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Authorization header is required');
    }

    const match = value.match(/^Bearer\s+(\S+)$/i);
    if (!match) {
      throw new BadRequestException('Authorization header must have format: Bearer <token>');
    }

    return match[1];
  }
}
