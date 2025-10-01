import { Injectable } from '@angular/core';
import { SupabaseBaseService } from './supabase-base.service';
import { Guest } from './models';

@Injectable({ providedIn: 'root' })
export class GuestService extends SupabaseBaseService {
  async updateGuest(guest: Guest) {
    console.log('updating guest', guest);
    const { data, error } = await this.supabase
      .from('guests')
      .update({ display_name: guest.display_name })
      .eq('id', guest.id);

    if (error) throw error;

    return data;
  }
}
