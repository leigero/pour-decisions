import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient,
  RealtimeChannel,
} from '@supabase/supabase-js';

import { environment } from '@pour-decisions/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseBaseService {
  protected readonly supabase: SupabaseClient;
  public readonly initializePromise: Promise<any>;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
    );
    this.initializePromise = this.supabase.auth.initialize();
  }

  public removeSubscription(channel: RealtimeChannel) {
    this.supabase.removeChannel(channel);
  }

  public getPublicUrl(bucket: string, path: string): string | null {
    return this.supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
}
