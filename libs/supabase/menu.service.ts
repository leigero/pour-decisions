import { inject, Injectable } from '@angular/core';
import { SupabaseBaseService } from './supabase-base.service';
import { Drink } from './models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class MenuService extends SupabaseBaseService {
  private storageService = inject(StorageService);
  constructor() {
    super();
  }

  async getDrinksForRoom(roomId: string): Promise<Drink[]> {
    const { data, error } = await this.supabase
      .from('drink_room')
      .select('drinks(*)')
      .eq('room_id', roomId);

    if (error) throw error;

    const drinks = data.flatMap((d: { drinks: Drink[] }) => d.drinks);
    return this.populateDrinkImages(drinks) || [];
  }

  async getDrinks(): Promise<Drink[]> {
    const { data, error } = await this.supabase.from('drinks').select();
    if (error) {
      console.error(error);
      return null;
    }
    return this.populateDrinkImages(data as Drink[]);
  }

  public populateDrinkImages(drinks: Drink[]): Drink[] {
    return drinks.map((drink) => {
      if (drink.image_path) {
        const imageUrl = this.storageService.getPublicImageUrl(
          drink.image_path,
        );
        return { ...drink, image_url: imageUrl };
      }
      return drink;
    });
  }

  async addDrinkToRoom(roomId: string, drinkId: string): Promise<void> {
    const { error } = await this.supabase
      .from('drink_room')
      .insert({ room_id: roomId, drink_id: drinkId });

    if (error) throw error;
  }

  async removeDrinkFromRoom(roomId: string, drinkId: string): Promise<void> {
    const { error } = await this.supabase
      .from('drink_room')
      .delete()
      .eq('room_id', roomId)
      .eq('drink_id', drinkId);

    if (error) throw error;
  }
}
