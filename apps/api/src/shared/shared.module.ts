import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';
import { ExternalHttpService } from './http.service';
import { PushNotificationService } from './push-notification.service';

@Global()
@Module({
  providers: [SupabaseService, ExternalHttpService, PushNotificationService],
  exports: [SupabaseService, ExternalHttpService, PushNotificationService],
})
export class SharedModule {}
