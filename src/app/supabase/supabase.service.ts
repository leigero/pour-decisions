import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  getRooms() {
    return supabase.from('rooms').select('');
  }

  getDrinksForRoom(roomId: string) {
    return supabase.from('drinks').select('').eq('room_id', roomId);
  }

  getOrdersForRoom(roomId: string) {
    return supabase
      .from('orders')
      .select('*, guest:guest_id(name), drink:drink_id(name)')
      .eq('room_id', roomId)
      .order('created_at');
  }

  addOrder(guestId: string, drinkId: string, roomId: string) {
    return supabase.from('orders').insert([{ guest_id: guestId, drink_id: drinkId, room_id: roomId }]);
  }

  markOrderComplete(orderId: string) {
    return supabase.from('orders').update({ status: 'complete' }).eq('id', orderId);
  }

  createGuest(name: string, roomId: string) {
    return supabase.from('guests').insert([{ name, room_id: roomId }]);
  }
}