import { Drink, Order } from '../../services/supabase/models';

// This is now the single source of truth for what an OrderVM is.
export interface OrderVM extends Omit<Order, 'drink_id'> {
  drink: Drink;
}
