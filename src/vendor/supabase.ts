import {createClient} from '@supabase/supabase-js';
import {SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY} from 'config/env';

export const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY);
