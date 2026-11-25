/* ==========================================
   CATALOGUE PRODUITS - CALI29 V2
   Source des données : Supabase
========================================== */

const SLUG_BOUTIQUE = "cali29";
const VIDEOS_PROMOTIONS = {
    "promo-lemon-mint-5g": "assets/videos/190-390u.mp4",
    "promo-rmf-10g": "assets/videos/rmfvid.mp4"
};

window.produits = [];


/* ==========================================
   1. FORMATAGE DES PRIX
========================================== */

function formaterPrixCatalogue(prix) {
    return Number(prix).toFixed(2).replace(".", ",") + " €";
}


// Prix affiché sur les cartes : premier tarif disponible si le produit
// propose des grammages, sinon prix de base.
function obtenirPrixAfficheCatalogue(produit) {

    const tarifs = Array.isArray(produit.tarifs)
        ? [...produit.tarifs].sort(
            (a, b) => Number(a.grammage) - Number(b.grammage)
        )
        : [];

    if (tarifs.length > 0) {
        return "À partir de " + formaterPrixCatalogue(tarifs[0].prix);
    }

    return formaterPrixCatalogue(produit.prix);
}


/* ==========================================
   2. SÉCURITÉ HTML
========================================== */

function echapperHTML(valeur) {

    return String(valeur ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);

}


/* ==========================================
   3. RÉCUPÉRER LE CATALOGUE SUPABASE
========================================== */

async function obtenirCatalogue() {

    if (typeof supabaseClient === "undefined") {
        throw new Error("Client Supabase non initialisé.");
    }

    const { data: boutique, error: erreurBoutique } =
        await supabaseClient
            .from("shops")
            .select("id")
            .eq("slug", SLUG_BOUTIQUE)
            .eq("status", "active")
            .single();

    if (erreurBoutique) {
        throw erreurBoutique;
    }

    const { data: produitsSupabase, error: erreurProduits } =
        await supabaseClient
            .from("products")
            .select(`
                id,
                legacy_id,
                name,
                slug,
                description,
                image_url,
                video_url,
                price,
                popularity,
                position,
                categories (
                    name,
                    slug
                ),
                product_prices (
                    quantity_min,
                    quantity_max,
                    total_price,
                    city
                )
            `)
            .eq("shop_id", boutique.id)
            .eq("status", "published")
            .order("position", { ascending: true });

    if (erreurProduits) {
        throw erreurProduits;
    }

    return (produitsSupabase || []).map(produit => {

        // On conserve uniquement les tarifs standards.
        // Les anciens tarifs spéciaux par ville sont ignorés.

        const tarifsStandards = (produit.product_prices || [])
            .filter(tarif => tarif.city === null)
            .map(tarif => ({
                grammage: Number(tarif.quantity_min),
                grammageMax: Number(tarif.quantity_max),
                prix: Number(tarif.total_price)
            }))
            .sort((a, b) => a.grammage - b.grammage);

        return {

            id: produit.legacy_id || produit.id,

            uuid: produit.id,

            nom: produit.name,

            slug: produit.slug,

            categorie: produit.categories?.slug || "",

            description: produit.description || "",

            image: produit.image_url || "",

            video: produit.video_url || VIDEOS_PROMOTIONS[produit.slug] || "",

            prix: Number(produit.price) || 0,

            popularite: Number(produit.popularity) || 0,

            tarifs: tarifsStandards

        };

    });

}


/* ==========================================
   4. PROMESSE DE CHARGEMENT DU CATALOGUE
========================================== */

window.cataloguePret = obtenirCatalogue()
    .then(catalogue => {

        window.produits = catalogue;

        console.log(
            "Catalogue CALI29 chargé :",
            window.produits.length,
            "produit(s)"
        );

        return window.produits;

    })
    .catch(erreur => {

        console.error("Erreur chargement catalogue :", erreur);

        window.produits = [];

        throw erreur;

    });


/* ==========================================
   5. CRÉER UNE CARTE PRODUIT
========================================== */

function creerCarteProduit(produit) {

    return `
        <article class="carte-produit">

            <button
                class="bouton-favoris"
                type="button"
                aria-label="Ajouter ${echapperHTML(produit.nom)} aux favoris"
            >
                ♡
            </button>

            <a
                href="produit.html?id=${encodeURIComponent(produit.id)}"
                class="lien-produit"
            >

                <img
                    src="${echapperHTML(produit.image)}"
                    alt="${echapperHTML(produit.nom)}"
                >

                <h3>${echapperHTML(produit.nom)}</h3>

                <p>${echapperHTML(produit.description)}</p>

                <div class="prix-produit">
                    ${obtenirPrixAfficheCatalogue(produit)}
                </div>

            </a>

        </article>
    `;

}


/* ==========================================
   6. AFFICHER LE CATALOGUE
========================================== */

async function afficherCatalogue() {

    const conteneur = document.getElementById("catalogue-produits");

    if (!conteneur) return;

    conteneur.innerHTML = "<p>Chargement du catalogue...</p>";

    try {

        const catalogue = await window.cataloguePret;

        const sectionCategorie = conteneur.closest("[data-categorie]");

        const categorie = sectionCategorie?.dataset.categorie;

        const produitsAffiches = categorie
            ? catalogue.filter(produit => produit.categorie === categorie)
            : [...catalogue]
                .sort((a, b) => b.popularite - a.popularite)
                .slice(0, 4);

        conteneur.innerHTML = produitsAffiches.length
            ? produitsAffiches.map(creerCarteProduit).join("")
            : `
                <p class="catalogue-vide">
                    Aucun produit dans cette catégorie pour le moment.
                </p>
            `;

    } catch (erreur) {

        console.error("Erreur affichage catalogue :", erreur);

        conteneur.innerHTML = `
            <p class="catalogue-vide">
                Impossible de charger le catalogue.
                Veuillez réessayer ultérieurement.
            </p>
        `;

    }

}


/* ==========================================
   7. INITIALISATION
========================================== */

document.addEventListener("DOMContentLoaded", afficherCatalogue);
