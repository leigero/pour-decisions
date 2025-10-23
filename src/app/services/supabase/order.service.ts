import { inject, Injectable } from '@angular/core';
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';
import { SupabaseBaseService } from './supabase-base.service';
import { Drink, Order, OrderWithDetails } from './models';
import { RoomService } from './room.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class OrderService extends SupabaseBaseService {
  private storageService = inject(StorageService);
  private roomService = inject(RoomService);

  constructor() {
    super();
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

  /** Base select used for all order queries to keep fields consistent */
  private baseOrdersSelect() {
    return '*, guest:guest_id(display_name, profile_picture), drink:drink_id(*)';
  }

  /**
   * Ensures any drink objects on orders have populated image_url and
   * normalizes both `drink` and `drinks` properties for compatibility.
   */
  private populateOrderDrinkImages(orders: any[]): OrderWithDetails[] {
    if (!orders?.length) return [] as OrderWithDetails[];

    const drinks: Drink[] = orders.map((o) => o.drink).filter(Boolean); // Extract drinks
    const populatedDrinks = this.populateDrinkImages(drinks); // Populate drink images

    return orders.map((o) => {
      // Populate drink image
      if (o.drink) {
        const populatedDrink =
          populatedDrinks.find((d) => d.id === o.drink.id) || o.drink;
        o.drink = populatedDrink;
      }

      // Populate guest profile picture
      if (o.guest) {
        if (o.guest.profile_picture) {
          o.guest.profile_picture = this.storageService.getPublicImageUrl(
            o.guest.profile_picture,
          );
        } else {
          // Fallback to UI Avatars if no picture is set
          o.guest.profile_picture = `https://ui-avatars.com/api/?name=${o.guest.display_name}`;
        }
      }
      return o as OrderWithDetails;
    }) as OrderWithDetails[];
  }

  async getOrdersForRoom(roomId: string): Promise<OrderWithDetails[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(this.baseOrdersSelect())
      .eq('room_id', roomId)
      .order('created_at');

    if (error) throw error;
    return this.populateOrderDrinkImages(data || []);
  }

  async getSingleOrderForRoom(orderId: string): Promise<OrderWithDetails> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(this.baseOrdersSelect())
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return this.populateOrderDrinkImages([data])[0];
  }

  async getOrdersForGuest(
    roomCode: string,
    guestId: string,
  ): Promise<OrderWithDetails[]> {
    const room = await this.roomService.getRoomByCode(roomCode);
    if (!room) return [];
    const { data, error } = await this.supabase
      .from('orders')
      .select(this.baseOrdersSelect())
      .eq('room_id', room.id)
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return this.populateOrderDrinkImages(data || []);
  }

  async placeOrder(order: Partial<Order>): Promise<void> {
    const { error } = await this.supabase.from('orders').insert(order);

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
