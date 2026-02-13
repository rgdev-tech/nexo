import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import type { PushTokenRow } from '../../shared/types';

@Injectable()
export class PushTokensService {
  private readonly logger = new Logger(PushTokensService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async register(userId: string, token: string, platform: string): Promise<PushTokenRow> {
    const { data, error } = await this.supabaseService.getClient()
      .from('push_tokens')
      .upsert(
        { user_id: userId, token, platform },
        { onConflict: 'user_id,token' },
      )
      .select()
      .single();

    if (error) {
      this.logger.error(`Error registering push token for user ${userId}`, error);
      throw new BadGatewayException({ error: 'upstream_error', message: `Database error: ${error.message}` });
    }

    return data!;
  }

  async remove(userId: string, token: string): Promise<void> {
    const { error } = await this.supabaseService.getClient()
      .from('push_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token', token);

    if (error) {
      this.logger.error(`Error removing push token for user ${userId}`, error);
      throw new BadGatewayException({ error: 'upstream_error', message: `Database error: ${error.message}` });
    }
  }

  /** Obtener todos los tokens de un usuario (para el evaluador) */
  async findByUserId(userId: string): Promise<string[]> {
    const { data, error } = await this.supabaseService.getClient()
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (error) {
      this.logger.error(`Error fetching push tokens for user ${userId}`, error);
      return [];
    }

    return (data ?? []).map((row) => row.token);
  }
}
