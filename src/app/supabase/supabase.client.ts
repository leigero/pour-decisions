import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

const supabaseUrl = environment.supabaseUrl;
const supabaseAnonKey = environment.supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);