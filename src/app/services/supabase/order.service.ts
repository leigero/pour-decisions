import { Injectable } from '@angular/core';
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
import { SupabaseBaseService } from './supabase-base.service';
import { OrderWithDetails } from './models';
import { RoomService } from './room.service';

@Injectable({ providedIn: 'root' })
export class OrderService extends SupabaseBaseService {
  constructor(private roomService: RoomService) {
    super();
  }

  async getOrdersForRoom(roomId: string): Promise<OrderWithDetails[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*, guest:guest_id(display_name), drink:drink_id(*)')
      .eq('room_id', roomId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  async getSingleOrderForRoom(orderId: string): Promise<OrderWithDetails> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*, guest:guest_id(display_name), drink:drink_id(*)')
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return data;
  }

  async getOrdersForGuest(roomCode: string, guestId: string): Promise<any[]> {
    const room = await this.roomService.getRoomByCode(roomCode);
    if (!room) return [];
    const { data, error } = await this.supabase
      .from('orders')
      .select('*, drinks(*)')
      .eq('room_id', room.id)
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async placeOrder(
    drinkId: string,
    roomId: string,
    guestId: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('orders')
      .insert({ drink_id: drinkId, room_id: roomId, guest_id: guestId });

    if (error) throw error;
  }

  async updateOrderStatus(orderId: string, orderStatus: string): Promise<void> {
    const { error } = await this.supabase
      .from('orders')
      .update({ status: orderStatus })
      .eq('id', orderId);
    if (error) throw error;
  }

  public onOrderChanges(
    roomId: string,
    callback: (
      payload: RealtimePostgresChangesPayload<{ [key: string]: any }>,
    ) => void,
  ): RealtimeChannel {
    const channel = this.supabase
      .channel(`room-orders-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `room_id=eq.${roomId}`,
        },
        callback,
      )
      .subscribe();

    return channel;
  }

  public onGuestOrderChanges(
    guestId: string,
    callback: (
      payload: RealtimePostgresChangesPayload<{ [key: string]: any }>,
    ) => void,
  ): RealtimeChannel {
    const channel = this.supabase
      .channel(`guest-orders-${guestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `guest_id=eq.${guestId}`,
        },
        callback,
      )
      .subscribe();

    return channel;
  }
}
