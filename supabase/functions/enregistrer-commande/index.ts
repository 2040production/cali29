
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SHOP_ID = "5a2d6373-8f06-4fb9-ac90-a87d237a8cbc";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normaliserVille(ville: string) {
  return String(ville || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function arrondir(montant: number) {
  return Math.round((montant + Number.EPSILON) * 100) / 100;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return response({ success: false, error: "Méthode non autorisée." }, 405);
  }

  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return response({ success: false, error: "Connexion requise." }, 401);
    }

    const token = authorization.slice(7);

    const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");

    if (!secretKeysRaw) {
      throw new Error("Configuration serveur SUPABASE_SECRET_KEYS absente.");
    }

    const secretKeys = JSON.parse(secretKeysRaw);
    const serviceRoleKey = secretKeys["default"];

    if (!serviceRoleKey) {
      throw new Error("Clé secrète Supabase par défaut introuvable.");
    }

    const supabase = createClient(SUPABASE_URL, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Vérifier la session du client
    const { data: authData, error: authError } =
      await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      console.error("ERREUR AUTHENTIFICATION :", authError);

      return response({
        success: false,
        error: "Session invalide ou expirée.",
      }, 401);
    }

    const user = authData.user;

    // 2. Récupérer le profil client
    const { data: profil, error: profilError } = await supabase
      .from("profiles")
      .select("id, pseudo, first_name, last_name, phone")
      .eq("id", user.id)
      .maybeSingle();

    if (profilError) {
      console.error("ERREUR PROFIL SUPABASE :", {
        code: profilError.code,
        message: profilError.message,
        details: profilError.details,
        hint: profilError.hint,
      });

      throw new Error(
        `Erreur profil Supabase : ${profilError.message} (${profilError.code})`
      );
    }

    if (!profil) {
      return response({
        success: false,
        error: "Profil client introuvable.",
      }, 400);
    }

    // 3. Lire les données envoyées par le panier
    const body = await req.json();

    const items = body.items;
    const livraison = body.livraison;
    const codePromo = String(body.codePromo || "").trim().toUpperCase();

    if (!Array.isArray(items) || items.length === 0) {
      return response({
        success: false,
        error: "Le panier est vide.",
      }, 400);
    }

    if (
      !livraison ||
      !String(livraison.adresse || "").trim() ||
      !String(livraison.codePostal || "").trim() ||
      !String(livraison.ville || "").trim()
    ) {
      return response({
        success: false,
        error: "Adresse de livraison incomplète.",
      }, 400);
    }

    if (items.length > 50) {
      return response({
        success: false,
        error: "Panier trop volumineux.",
      }, 400);
    }

    // 4. Récupérer les produits publiés de CALI29
    const { data: produits, error: produitsError } = await supabase
      .from("products")
      .select(`
        id,
        legacy_id,
        name,
        description,
        price,
        status,
        product_prices (
          quantity_min,
          quantity_max,
          total_price,
          city
        )
      `)
      .eq("shop_id", SHOP_ID)
      .eq("status", "published");

    if (produitsError) {
      console.error("ERREUR CATALOGUE SUPABASE :", produitsError);

      throw new Error(
        `Impossible de vérifier le catalogue : ${produitsError.message}`
      );
    }

    const lignesCommande = [];
    let sousTotal = 0;

    // 5. Vérifier chaque ligne du panier
    for (const item of items) {
      const idPanier = String(item.id || "");
      const quantite = Number(item.quantite);

      const grammage =
        item.grammage === null || item.grammage === undefined
          ? null
          : Number(item.grammage);

      if (
        !idPanier ||
        !Number.isInteger(quantite) ||
        quantite < 1 ||
        quantite > 100 ||
        (grammage !== null &&
          (!Number.isFinite(grammage) || grammage <= 0))
      ) {
        return response({
          success: false,
          error: "Article ou quantité invalide.",
        }, 400);
      }

      const produit = produits?.find(
        (p) => String(p.legacy_id || p.id) === idPanier
      );

      if (!produit) {
        return response({
          success: false,
          error: `Le produit "${idPanier}" n'est plus disponible.`,
        }, 400);
      }

      let prixUnitaire = Number(produit.price) || 0;
      let description = produit.description || "";

      if (grammage !== null) {
        const tarifs = (produit.product_prices || []).filter(
          (tarif: any) => tarif.city === null
        );

        const tarif = tarifs.find(
          (t: any) => Number(t.quantity_min) === grammage
        );

        if (!tarif) {
          return response({
            success: false,
            error: `Tarif introuvable pour ${produit.name}, ${grammage} g.`,
          }, 400);
        }

        prixUnitaire = Number(tarif.total_price);

        description =
          `${description}${description ? " — " : ""}${grammage} g`;
      }

      if (!Number.isFinite(prixUnitaire) || prixUnitaire < 0) {
        throw new Error(`Tarif invalide pour ${produit.name}.`);
      }

      const totalLigne = arrondir(prixUnitaire * quantite);

      lignesCommande.push({
        product_id: produit.id,
        product_name: produit.name,
        product_description: description,
        quantity: quantite,
        unit_price: prixUnitaire,
        total_price: totalLigne,
      });

      sousTotal += totalLigne;
    }

    sousTotal = arrondir(sousTotal);

    // 6. Frais de livraison et minimum
    const villeNormalisee = normaliserVille(livraison.ville);
    const fraisLivraison = villeNormalisee === "brest" ? 0 : 10;

    if (villeNormalisee === "brest" && sousTotal < 30) {
      return response({
        success: false,
        error: "Le minimum de commande à Brest est de 30 €.",
      }, 400);
    }

    // 7. Vérifier le code promo connu actuellement
    let reduction = 0;

    if (codePromo) {
      if (codePromo !== "BIENVENUE10") {
        return response({
          success: false,
          error: "Code promo invalide.",
        }, 400);
      }

      reduction = arrondir(sousTotal * 0.10);
    }

    const total = Math.max(
      0,
      arrondir(sousTotal - reduction + fraisLivraison)
    );

    // 8. Préparer le nom client
    const nomClient =
      [profil.first_name, profil.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      profil.pseudo ||
      "Client CALI29";

    const adresseLivraison = {
      adresse: String(livraison.adresse).trim(),
      codePostal: String(livraison.codePostal).trim(),
      ville: String(livraison.ville).trim(),
    };

    // 9. Enregistrer la commande et ses lignes en une transaction SQL
    const { data: resultat, error: insertionError } = await supabase.rpc(
      "enregistrer_commande_cali29",
      {
        p_customer_id: user.id,
        p_customer_name: nomClient,
        p_customer_email: null,
        p_customer_phone: profil.phone || null,
        p_delivery_address: adresseLivraison,
        p_subtotal: sousTotal,
        p_delivery_fee: fraisLivraison,
        p_discount: reduction,
        p_total: total,
        p_items: lignesCommande,
      }
    );

    if (insertionError) {
      console.error("ERREUR ENREGISTREMENT COMMANDE :", insertionError);

      throw new Error(
        `L'enregistrement de la commande a échoué : ${insertionError.message}`
      );
    }

    return response({
      success: true,
      order: resultat,
      totals: {
        subtotal: sousTotal,
        discount: reduction,
        delivery_fee: fraisLivraison,
        total,
      },
    });

  } catch (error) {
    console.error("Edge Function enregistrer-commande :", error);

    return response({
      success: false,
      error: error instanceof Error
        ? error.message
        : "Erreur serveur lors de la commande.",
    }, 500);
  }
});
