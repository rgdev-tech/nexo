import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { User, AuthError } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Workaround: en monorepos los tipos de @supabase/auth-js pueden no resolverse
 * correctamente en el build de Vercel. Usamos un tipo wrapper en lugar de `as any`
 * para mantener type-safety sin depender de la resolución de tipos interna.
 * Ref: https://github.com/rgdev-org/nexo/issues/29
 */
type SupabaseAuth = {
  getUser(token: string): Promise<{
    data: { user: User | null };
    error: AuthError | null;
  }>;
};

@Injectable()
export class SupabaseGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    const client = this.supabaseService.getClient();
    const auth = client.auth as unknown as SupabaseAuth;
    const { data, error } = await auth.getUser(token);
    const user = data?.user ?? null;

    if (error || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = user;
    return true;
  }
}
