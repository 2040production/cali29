
/* ==========================================
   CATALOGUE PRODUITS - CALI29 V2
   Source des données : Supabase
========================================== */

const SLUG_BOUTIQUE = "cali29";

window.produits = [];

/* ==========================================
   1. FORMATAGE DES PRIX
========================================== */

function formaterPrixCatalogue(prix) {
    const valeur = Number(prix);

    if (!Number.isFinite(valeur)) return "Prix indisponible";

    return valeur.toFixed(2).replace(".", ",") + " €";
}

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
        throw new Error(
            "Impossible de récupérer la boutique : " + erreurBoutique.message
        );
    }

    if (!boutique?.id) {
        throw new Error("Boutique CALI29 introuvable ou inactive.");
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
        throw new Error(
            "Impossible de récupérer les produits : " + erreurProduits.message
        );
    }

    return (produitsSupabase || []).map(produit => {
        const tarifsStandards = (produit.product_prices || [])
            .filter(tarif => tarif.city === null)
            .map(tarif => ({
                grammage: Number(tarif.quantity_min),
                grammageMax: tarif.quantity_max === null
                    ? null
                    : Number(tarif.quantity_max),
                prix: Number(tarif.total_price)
            }))
            .filter(tarif =>
                Number.isFinite(tarif.grammage) &&
                Number.isFinite(tarif.prix)
            )
            .sort((a, b) => a.grammage - b.grammage);

        return {
            id: produit.legacy_id || produit.id,
            uuid: produit.id,
            nom: produit.name || "Produit sans nom",
            slug: produit.slug || "",
            categorie: produit.categories?.slug || "",
            description: produit.description || "",
            image: produit.image_url || "",
            video: produit.video_url || "",
            prix: Number(produit.price) || 0,
            popularite: Number(produit.popularity) || 0,
            position: Number(produit.position) || 0,
            tarifs: tarifsStandards
        };
    });
}

/* ==========================================
   4. CHARGEMENT DU CATALOGUE
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
    const id = encodeURIComponent(produit.id);

    const image = produit.image
        ? `<img src="${echapperHTML(produit.image)}"
                alt="${echapperHTML(produit.nom)}"
                loading="lazy"
                onerror="this.style.display='none'">`
        : "";

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
                href="produit.html?id=${id}"
                class="lien-produit"
            >
                ${image}

                <h3>${echapperHTML(produit.nom)}</h3>

                <p>${echapperHTML(produit.description)}</p>

                <div class="prix-produit">
                    ${obtenirPrixAfficheCatalogue(produit)}
                </div>
            </a>

            <button
                class="bouton-ajouter"
                type="button"
                data-produit-id="${echapperHTML(produit.id)}"
            >
                AJOUTER AU PANIER +
            </button>

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

        if (produitsAffiches.length === 0) {
            conteneur.innerHTML = `
                <p class="catalogue-vide">
                    Aucun produit dans cette catégorie pour le moment.
                </p>
            `;
            return;
        }

        conteneur.innerHTML = produitsAffiches
            .map(creerCarteProduit)
            .join("");

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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", afficherCatalogue);
} else {
    afficherCatalogue();
}
