import { inject, Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

import { Room, Guest, Drink, Order, OrderWithDetails } from './models';
import { RoomCodeService } from '../roomCode.service';

const supabaseUrl = environment.supabaseUrl;
const supabaseAnonKey = environment.supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private roomCodeService = inject(RoomCodeService);
  // ROOMS
  async getRooms(): Promise<Room[]>{
    const {data, error} = await supabase.from('rooms').select();
    if(error){
      console.error(error);
      return null;
    }
    return data;
  }
  async getRoomById(roomId: string) : Promise<Room> {
    const {data, error} = await supabase.from('rooms').select().eq('id', roomId);
    if(error){
      console.error(error);
      return null;
    }
    if(data?.length > 0){
      return data[0] as Room;
    }
    return null;
  }

  async getRoomByCode(roomCode: string) : Promise<Room> {
    const {data, error} = await supabase.from('rooms').select().eq('code', roomCode);
    if(error){
      console.error(error);
      return null;
    }
    if(data?.length > 0){
      return data[0] as Room;
    }
    return null;
  }

  async getDrinks() : Promise<Drink[]> {
    const { data, error } = await supabase.from('drinks').select();
    if(error){
      console.error(error);
      return null;
    }
    return data;
  }
     

  async addDrink(drinkName: string, ingredients: string[], roomId: string) {
    const { data, error } = await supabase
      .from('drinks')
      .insert({name: drinkName, ingredients: ingredients, room_id: roomId });

    if (error) throw error;
    return data!;
  }

  async createRoom(roomName: string, description: string) {
    
    let roomCode = this.roomCodeService.generateRoomcode();


    const { data, error } = await supabase
      .from('rooms')
      .insert({name: roomName, description: description, is_active: true, code: roomCode})
      .select();

    if (error) throw error;

    if(data?.length > 0){
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
      .from('drinks')
      .select()
      .eq('room_id', roomId);

    if (error) throw error;
    return data || [];
  }

  // ORDERS
  async getOrdersForRoom(roomId: string): Promise<OrderWithDetails[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, guest:guest_id(name), drink:drink_id(name)')
      .eq('room_id', roomId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }



  // async addOrder(guestId: string, drinkId: string, roomId: string): Promise<Order> {
  //   const { data, error } = await supabase
  //     .from<any, Order>('orders')
  //     .insert([{ guest_id: guestId, drink_id: drinkId, room_id: roomId }])
  //     .single();

  //   if (error) throw error;
  //   return data!;
  // }

  // async markOrderComplete(orderId: string): Promise<Order> {
  //   const { data, error } = await supabase
  //     .from<any, Order>('orders')
  //     .update({ status: 'complete' })
  //     .eq('id', orderId)
  //     .single();

  //   if (error) throw error;
  //   return data!;
  // }

  // private handleError<T> (error){
  //   if(error){
  //     console.error(error);
  //     return [];
  //   }
  // }

}