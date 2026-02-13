import { Injectable, Logger, NotFoundException, ForbiddenException, BadGatewayException } from '@nestjs/common';
import { SupabaseService } from '../../shared/supabase/supabase.service';
import type { AlertRow } from '../../shared/types';
import type { CreateAlertDto } from './dto/create-alert.dto';
import type { UpdateAlertDto } from './dto/update-alert.dto';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(userId: string, dto: CreateAlertDto): Promise<AlertRow> {
    const { data, error } = await this.supabaseService.getClient()
      .from('alerts')
      .insert({
        user_id: userId,
        type: dto.type,
        symbol: dto.symbol,
        threshold: dto.threshold,
        direction: dto.direction,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating alert for user ${userId}`, error);
      throw new BadGatewayException({ error: 'upstream_error', message: `Database error: ${error.message}` });
    }

    return data!;
  }

  async findAll(userId: string): Promise<AlertRow[]> {
    const { data, error } = await this.supabaseService.getClient()
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`Error fetching alerts for user ${userId}`, error);
      throw new BadGatewayException({ error: 'upstream_error', message: `Database error: ${error.message}` });
    }

    return data ?? [];
  }

  async update(userId: string, alertId: string, dto: UpdateAlertDto): Promise<AlertRow> {
    // Verify ownership first
    const existing = await this.findOneOrFail(userId, alertId);

    const { data, error } = await this.supabaseService.getClient()
      .from('alerts')
      .update({ enabled: dto.enabled })
      .eq('id', alertId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error updating alert ${alertId}`, error);
      throw new BadGatewayException({ error: 'upstream_error', message: `Database error: ${error.message}` });
    }

    return data!;
  }

  async remove(userId: string, alertId: string): Promise<void> {
    // Verify ownership first
    await this.findOneOrFail(userId, alertId);

    const { error } = await this.supabaseService.getClient()
      .from('alerts')
      .delete()
      .eq('id', alertId)
      .eq('user_id', userId);

    if (error) {
      this.logger.error(`Error deleting alert ${alertId}`, error);
      throw new BadGatewayException({ error: 'upstream_error', message: `Database error: ${error.message}` });
    }
  }

  /** Obtener todas las alertas habilitadas (para el evaluador) */
  async findAllEnabled(): Promise<AlertRow[]> {
    const { data, error } = await this.supabaseService.getClient()
      .from('alerts')
      .select('*')
      .eq('enabled', true);

    if (error) {
      this.logger.error('Error fetching enabled alerts', error);
      return [];
    }

    return data ?? [];
  }

  /** Actualizar triggered_at después de disparar una alerta */
  async markTriggered(alertId: string): Promise<void> {
    const { error } = await this.supabaseService.getClient()
      .from('alerts')
      .update({ triggered_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) {
      this.logger.error(`Error marking alert ${alertId} as triggered`, error);
    }
  }

  private async findOneOrFail(userId: string, alertId: string): Promise<AlertRow> {
    const { data, error } = await this.supabaseService.getClient()
      .from('alerts')
      .select('*')
      .eq('id', alertId)
      .single();

    if (error || !data) {
      throw new NotFoundException({ error: 'not_found', message: `Alert ${alertId} not found` });
    }

    if (data.user_id !== userId) {
      throw new ForbiddenException({ error: 'forbidden', message: 'You do not own this alert' });
    }

    return data;
  }
}
