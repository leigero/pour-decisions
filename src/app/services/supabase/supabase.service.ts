import { inject, Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabaseUrl = environment.supabaseUrl;
const supabaseAnonKey = environment.supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** @deprecated Please use domain-specific services like RoomService, OrderService, or MenuService instead. */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  // IMAGES
  async getImage(image_path: string, width: number, height: number) {
    // Check if image_path exists before trying to get the URL
    const imgWidth = width || 300;
    const imgHeight = height || 300;

    const urlParts = image_path.split('/');
    const response = supabase.storage
      .from(urlParts[0])
      .getPublicUrl(urlParts[1], {
        transform: { width: imgWidth, height: imgHeight },
      });

    // The 'data' object contains the public URL
    return response.data.publicUrl;
  }
}
