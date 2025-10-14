import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient,
  RealtimeChannel,
} from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

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
    this.initializeSession();
    this.initializePromise = this.supabase.auth.initialize();
  }

  private async initializeSession(): Promise<void> {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();

    if (!session) {
      const { error } = await this.supabase.auth.signInAnonymously();
      if (error) {
        console.error('Error signing in anonymously:', error);
      }
    }
  }

  public removeSubscription(channel: RealtimeChannel) {
    this.supabase.removeChannel(channel);
  }

  public getPublicUrl(bucket: string, path: string): string | null {
    return this.supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
}
