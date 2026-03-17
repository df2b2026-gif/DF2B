import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sbp-3a0c44e57607db0708bc2d822c574923e6a39430.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sbp_3a0c44e57607db0708bc2d822c574923e6a39430';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);