import { inject, Injectable } from '@angular/core';
import { SupabaseBaseService } from './supabase-base.service';
import { Guest } from './models';
import { StorageService } from '.';

@Injectable({ providedIn: 'root' })
export class GuestService extends SupabaseBaseService {
  private storageService = inject(StorageService);
  async createGuest(guestName: string, roomId: string): Promise<Guest> {
    await this.initializePromise; // Ensure auth is initialized
    // Sign in the user anonymously.

    const {
      data: { user },
      error: authError,
    } = await this.supabase.auth.signInAnonymously();
    if (!user) throw new Error('User is not authenticated.');

    const { data, error } = await this.supabase
      .from('guests') // <-- Using your 'guests' table name
      .insert({
        // Omit 'id' here to let the database generate it
        auth_id: user.id, // <-- Save the auth ID to the correct foreign key column
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
    if (profilePicture) {
      // 1. Get the current user
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated for image upload');

      // 2. Upload image using the secure auth_id
      const newImageUrl = await this.storageService.uploadProfileImage(
        profilePicture,
        user.id, // <-- Pass the user's auth_id
      );
      updates.profile_picture = newImageUrl;
    }

    // 3. Update the guest record
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

  async getGuestById(guestId: string): Promise<Guest> {
    const { data, error } = await this.supabase
      .from('guests')
      .select()
      .eq('id', guestId)
      .single();
    if (error) {
      console.error(error);
      return null;
    }
    return data as Guest;
  }
}
