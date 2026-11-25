const SUPABASE_URL = "https://vexntpftkynijqssqwro.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_H3A8FpzVAIjYUuOMoAKVuw_SKNwedEz";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("CALI29 V2 : client Supabase initialisé");