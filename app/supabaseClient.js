import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jzavzxmudrcjywayebzl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_jDtr626Q3AftJXSfz5L5XA_JAfJp2mq";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
