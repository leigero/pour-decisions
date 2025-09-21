import { inject, Injectable } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

import { Room, Guest, Drink, Order, OrderWithDetails } from './models';
import { RoomCodeService } from '../roomCode.service';

const supabaseUrl = environment.supabaseUrl;
const supabaseAnonKey = environment.supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private roomCodeService = inject(RoomCodeService);

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
  // ROOMS
  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase.from('rooms').select();
    if (error) {
      console.error(error);
      return null;
    }
    return data;
  }
  async getRoomById(roomId: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .select()
      .eq('id', roomId);
    if (error) {
      console.error(error);
      return null;
    }
    if (data?.length > 0) {
      return data[0] as Room;
    }
    return null;
  }

  async getRoomByCode(roomCode: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .select()
      .eq('code', roomCode.toUpperCase());
    if (error) {
      console.error(error);
      return null;
    }
    if (data?.length > 0) {
      return data[0] as Room;
    }
    return null;
  }

  async createRoom(roomName: string, description: string) {
    let roomCode = this.roomCodeService.generateRoomcode();
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        name: roomName,
        description: description,
        is_active: true,
        code: roomCode,
      })
      .select();

    if (error) throw error;

    if (data?.length > 0) {
      return data[0] as Room;
    }
    return null;
  }

  // // GUESTS
  // async addGuest(name: string, roomId: string): Promise<{ data: Guest | null; error: any }> {
  //   return await supabase
  //     .from<any, Guest>('guests')
  //     .insert([{ name, room_id: roomId }])
  //     .single();
  // }

  // DRINKS
  async getDrinksForRoom(roomId: string): Promise<Drink[]> {
    const { data, error } = await supabase
      .from('drink_room')
      .select('drinks(*)')
      .eq('room_id', roomId);

    if (error) throw error;
    // Map the results to flatten the nested 'drinks' object
    const drinks = data.flatMap((d: { drinks: Drink[] }) => d.drinks);
    console.log('in get drinks service: ', drinks);
    const drinksWithImages = this.populateDrinkImages(drinks);
    return drinksWithImages || [];
  }
  async getDrinks(): Promise<Drink[]> {
    const { data, error } = await supabase.from('drinks').select();
    if (error) {
      console.error(error);
      return null;
    }
    const drinks = data as Drink[];

    const drinksWithURLs = this.populateDrinkImages(drinks);

    return drinksWithURLs;
  }

  private populateDrinkImages(drinks: Drink[]) {
    return drinks.map((drink) => {
      // Check if image_path exists before trying to get the URL

      if (drink.image_path) {
        const urlParts = drink.image_path.split('/');
        const response = supabase.storage
          .from(urlParts[0])
          .getPublicUrl(urlParts[1], {
            transform: { width: 300, height: 300 },
          });

        // The 'data' object contains the public URL
        return {
          ...drink,
          image_url: response.data.publicUrl,
        };
      } else {
        // Return the drink as is, without an image URL
        return drink;
      }
    });
  }

  async addDrink(drinkName: string, ingredients: string[], roomId: string) {
    const { data, error } = await supabase
      .from('drinks')
      .insert({ name: drinkName, ingredients: ingredients, room_id: roomId });

    if (error) throw error;
    return data!;
  }

  async assignDrinksToRoom(roomId: string, drinks: Drink[]): Promise<Drink[]> {
    // Step 1: Delete all existing drinks for this room to ensure a clean slate
    const { error: deleteError } = await supabase
      .from('drink_room')
      .delete()
      .eq('room_id', roomId);

    if (deleteError) throw deleteError;

    // If there are no drinks to insert, we can stop here
    if (drinks.length === 0) {
      return [];
    }

    // Step 2: Map the 'drinks' array to the shape of your join table.
    const recordsToInsert = drinks.map((drink) => ({
      room_id: roomId,
      drink_id: drink.id,
    }));

    // Step 3: Insert the new, selected drinks
    const { data, error: insertError } = await supabase
      .from('drink_room')
      .insert(recordsToInsert)
      .select();

    if (insertError) throw insertError;

    return data;
  }

  // ORDERS
  async getOrdersForRoom(roomId: string): Promise<OrderWithDetails[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, guest:guest_id(display_name), drink:drink_id(name)')
      .eq('room_id', roomId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  async getSingleOrderForRoom(orderId: string): Promise<OrderWithDetails> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, guest:guest_id(display_name), drink:drink_id(name)')
      .eq('id', orderId)
      .order('created_at')
      .single();

    if (error) throw error;
    return data;
  }

  async getOrdersForGuest(
    roomCode: string,
    guestUsername: string,
  ): Promise<any[]> {
    // we first need to get the room by Code then use the code to get the room by ID
    const room = await this.getRoomByCode(roomCode);
    console.log(room);
    const { data, error } = await supabase
      .from('orders')
      .select('*, drinks(name)')
      .eq('room_id', room.id)
      .eq('guest_id', guestUsername)
      .order('created_at', { ascending: false });

    if (error) throw error;
    console.log(data);
    return data || [];
  }

  async placeOrder(drinkId: string, roomId: string, guestId: string) {
    const { data, error } = await supabase
      .from('orders')
      .insert({ drink_id: drinkId, room_id: roomId, guest_id: guestId });

    if (error) throw error;
    return data!;
  }

  /**
   * Subscribes to new orders for a specific room.
   * @param roomId The ID of the room to listen to.
   * @param callback The function to execute when a new order is received.
   * @returns The RealtimeChannel for later unsubscribing.
   */
  public onNewOrder(
    roomId: string,
    callback: (newOrder: OrderWithDetails) => void,
  ): RealtimeChannel {
    const channel = supabase
      .channel(`room-orders-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          // When a new order is inserted, we receive its data.
          // We need to fetch its details (guest and drink name).
          this.getSingleOrderForRoom(payload.new['id']).then((orderDetails) => {
            if (orderDetails) {
              callback(orderDetails);
            }
          });
        },
      )
      .subscribe();

    return channel;
  }

  /**
   * Removes a Supabase Realtime subscription.
   * @param channel The channel to unsubscribe from.
   */
  public removeSubscription(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  }

  //GUEST
  async joinRoom(roomCode: string, guestName: string): Promise<Guest> {
    const room = await this.getRoomByCode(roomCode);
    const { data, error } = await supabase
      .from('guests')
      .insert({
        display_name: guestName,
        room_id: room.id,
      })
      .select();

    if (error) throw error;

    if (data?.length > 0) {
      return data[0] as Guest;
    }
    return null;
  }

  async getGuestById(guestId: string): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .select()
      .eq('id', guestId);
    if (error) {
      console.error(error);
      return null;
    }
    if (data?.length > 0) {
      return data[0] as Guest;
    }
    return null;
  }
}
