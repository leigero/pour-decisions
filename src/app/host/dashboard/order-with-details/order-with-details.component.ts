import { Order } from '../../../services/supabase/models';
import { Guest } from '../../../services/supabase/models';
import { Drink } from '../../../services/supabase/models';

export interface OrderWithDetails extends Order {
  guest: Pick<Guest, 'name'>;
  drink: Pick<Drink, 'name'>;
}