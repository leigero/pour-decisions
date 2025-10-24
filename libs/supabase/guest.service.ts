import { inject, Injectable } from '@angular/core';
import { SupabaseBaseService } from './supabase-base.service';
import { Guest } from './models';
import { StorageService } from '.';

@Injectable({ providedIn: 'root' })
export class GuestService extends SupabaseBaseService {
  private storageService = inject(StorageService);
  async createGuest(guestName: string, roomId: string): Promise<Guest> {
    await this.initializePromise; // Ensure auth is initialized

    // Sign in the user anonymously. This will create a new user if one doesn't
    // exist, or reuse the existing session.
    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.signInAnonymously();
    if (!user) throw new Error('User is not authenticated.');

    const { data, error } = await this.supabase
      .from('guests')
      .insert({
        id: user.id, // Use the authenticated user's ID
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

  async updateGuest(
    guestId: string,
    updates: Partial<Guest>,
    profilePicture: File | null = null,
  ): Promise<Guest> {
    const newImageUrl = await this.storageService.uploadProfileImage(
      profilePicture,
      guestId,
    );
    updates.profile_picture = newImageUrl;

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
