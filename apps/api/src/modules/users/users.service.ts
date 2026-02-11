import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';

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
      throw error;
    }

    return data;
  }

  async updateProfile(userId: string, updates: { first_name?: string; last_name?: string; avatar_url?: string; preferences?: Record<string, unknown> }) {
    const { data, error } = await this.supabaseService.getClient()
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error updating profile for user ${userId}`, error);
      throw error;
    }

    return data;
  }
}
