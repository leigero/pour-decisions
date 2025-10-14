import { inject, Injectable } from '@angular/core';
import { SupabaseBaseService } from './supabase-base.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService extends SupabaseBaseService {
  /**
   * Uploads a profile image to the 'user-profile-images' bucket in Supabase Storage.
   * @param file The image file to upload.
   * @param guestId The ID of the guest to associate the image with.
   * @returns The public URL of the uploaded image.
   */
  async uploadProfileImage(file: File, guestId: string): Promise<string> {
    const fileExtension = file.name.split('.').pop();
    const filePath = `${guestId}/${Date.now()}.${fileExtension}`;

    const { error } = await this.supabase.storage
      .from('user-profile-images')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const { data } = this.supabase.storage
      .from('user-profile-images')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Could not get public URL for uploaded image.');
    }

    return data.publicUrl;
  }
}
