import { Order } from '../../../supabase/models';
import { Guest } from '../../../supabase/models';
import { Drink } from '../../../supabase/models';

export interface OrderWithDetails extends Order {
  guest: Pick<Guest, 'name'>;
  drink: Pick<Drink, 'name'>;
}