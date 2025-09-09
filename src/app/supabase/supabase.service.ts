import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

import { Room, Guest, Drink, Order, OrderWithDetails } from './models';

const supabaseUrl = environment.supabaseUrl;
const supabaseAnonKey = environment.supabaseAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  // ROOMS
  async getRooms(): Promise<{ data: Room[] | null; error: any }> {
    return await supabase.from<any, Room>('rooms').select('');
  }

  async getDrinks(): Promise<{ data: Drink[] | null; error: any }> {
    return await supabase.from<any, Drink>('drinks').select('');
  }

  async addDrink(drinkName: string, ingredients: string[], roomId: string): Promise<Drink> {
    const { data, error } = await supabase
      .from('drinks')
      .insert({name: drinkName, ingredients: ingredients, room_id: roomId });

    if (error) throw error;
    return data!;
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
      .select('*')
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
}