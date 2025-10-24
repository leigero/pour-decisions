import { Drink } from './drinks.model';
import { Guest } from './guest.model';
export type OrderStatus =
  | 'queued'
  | 'in-progress'
  | 'ready'
  | 'served'
  | 'cancelled';

export interface Order {
  id: string;
  guest_id: string;
  drink_id: string;
  room_id: string;
  status: OrderStatus;
  created_at: string;
  notes: string;
}

export interface OrderWithDetails extends Order {
  guest: Pick<Guest, 'display_name' | 'profile_picture'>;
  drink: Drink;
}
