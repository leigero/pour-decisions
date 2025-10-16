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
    const storageBucket = 'user-profile-images';
    const fileExtension = file.name.split('.').pop();
    const filePath = `${guestId}/${Date.now()}.${fileExtension}`;

    const { data, error } = await this.supabase.storage
      .from(storageBucket)
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    } else {
      console.log('Storeage succeeded.');
    }

    return data.fullPath;
  }

  /**
   * Gets the public URL for a file from its full path.
   * @param fullPath The full path of the file (e.g., 'user-profile-images/image.png').
   * @returns The public URL for the file.
   */
  getPublicImageUrl(fullPath: string): string {
    const [bucketName, ...pathParts] = fullPath.split('/');
    const publicURL = this.supabase.storage
      .from(bucketName)
      .getPublicUrl(pathParts.join('/'), {
        transform: { width: 300, height: 300 },
      }).data.publicUrl;
    console.log('get public image: ', publicURL);
    return publicURL;
  }
}
