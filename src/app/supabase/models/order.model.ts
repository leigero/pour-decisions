export type OrderStatus = 'queued' | 'in-progress' | 'complete';

export interface Order {
  id: string;
  guest_id: string;
  drink_id: string;
  room_id: string;
  status: OrderStatus;
  created_at: string;
}