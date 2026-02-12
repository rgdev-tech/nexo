import { Injectable, Logger, NotFoundException, BadGatewayException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import type { UserPreferences } from '../../shared/types';

const PGRST_NO_ROWS = 'PGRST116';

function toHttpException(error: { code?: string; message?: string; details?: string }, context: string): never {
  const code = error?.code ?? '';
  const message = error?.message ?? 'Unknown error';
  if (code === PGRST_NO_ROWS) {
    throw new NotFoundException({ error: 'not_found', message: `Profile not found: ${context}` });
  }
  throw new BadGatewayException({ error: 'upstream_error', message: `Database error: ${message}`, details: error?.details });
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabaseService.getClient()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      this.logger.error(`Error fetching profile for user ${userId}`, error);
      toHttpException(error as { code?: string; message?: string; details?: string }, userId);
    }

    return data;
  }

  async updateProfile(userId: string, updates: { first_name?: string; last_name?: string; avatar_url?: string; preferences?: UserPreferences }) {
    const { data, error } = await this.supabaseService.getClient()
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error updating profile for user ${userId}`, error);
      toHttpException(error as { code?: string; message?: string; details?: string }, userId);
    }

    return data;
  }
}
