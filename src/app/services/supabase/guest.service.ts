import { Injectable } from '@angular/core';
import { SupabaseBaseService } from './supabase-base.service';
import { Guest } from './models';

@Injectable({ providedIn: 'root' })
export class GuestService extends SupabaseBaseService {
  async createGuest(guestName: string, roomId: string): Promise<Guest> {
    const { data, error } = await this.supabase
      .from('guests')
      .insert({
        display_name: guestName,
        room_id: roomId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating guest:', error);
      throw error;
    }

    return data;
  }

  async updateGuest(guestId: string, updates: Partial<Guest>): Promise<Guest> {
    console.log('updating guest', guestId, updates);
    const { data, error } = await this.supabase
      .from('guests')
      .update(updates)
      .eq('id', guestId)
      .select()
      .single();

    if (error) {
      console.error('Error updating guest profile:', error);
      throw error;
    }

    return data;
  }
}
