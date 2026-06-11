import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wmtvbbczyjdaciuzquqx.supabase.co';
const supabaseAnonKey = 'sb_publishable__Er4awY8vKiiSBX709kBNA_cJlxUrgm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);