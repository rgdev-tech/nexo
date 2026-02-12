import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';
import { ExternalHttpService } from './http.service';

@Global()
@Module({
  providers: [SupabaseService, ExternalHttpService],
  exports: [SupabaseService, ExternalHttpService],
})
export class SharedModule {}
