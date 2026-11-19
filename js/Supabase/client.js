
/* ==========================================
   CALI29 V2
   CONFIGURATION SUPABASE
========================================== */

const SUPABASE_URL = "https://vexntpftkynijqssqwro.supabase.co";

// Clé publique uniquement.
// Ne jamais mettre la clé Secret ici.

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_H3A8FpzVAIjYUuOMoAKVuw_SKNwedEz";


/* ==========================================
   INITIALISATION
========================================== */

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


/* ==========================================
   TEST DE CONNEXION
========================================== */

console.log("CALI29 V2 : client Supabase initialisé");
