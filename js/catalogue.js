
/* ==========================================
   AFFICHAGE DU CATALOGUE - CALI29
   Catalogue synchronisé avec localStorage
========================================== */

const VERSION_CATALOGUE = 4;
const CLE_VERSION_CATALOGUE = "catalogueCali29Version";


/* ==========================================
   1. FORMATAGE DES PRIX
========================================== */

function formaterPrixCatalogue(prix) {
    return Number(prix).toFixed(2).replace('.', ',') + ' €';
}


/* ==========================================
   2. SÉCURITÉ HTML
========================================== */

function echapperHTML(valeur) {
    return String(valeur ?? '').replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere]);
}


/* ==========================================
   3. MIGRATION DU CATALOGUE
========================================== */

function obtenirCatalogue() {

    try {

        const donnees = localStorage.getItem('catalogueCali29');

        // Aucun catalogue sauvegardé
        if (donnees === null) {

            localStorage.setItem(
                'catalogueCali29',
                JSON.stringify(produits)
            );

            localStorage.setItem(
                CLE_VERSION_CATALOGUE,
                VERSION_CATALOGUE
            );

            return [...produits];

        }

        const catalogueSauvegarde = JSON.parse(donnees);

        if (!Array.isArray(catalogueSauvegarde)) {
            throw new Error("Catalogue sauvegardé invalide.");
        }

        const versionStockee = Number(
            localStorage.getItem(CLE_VERSION_CATALOGUE) || 0
        );


        // MIGRATION LORS D'UN CHANGEMENT DE VERSION

        if (versionStockee < VERSION_CATALOGUE) {

            const catalogueFusionne = new Map();

            // Charger les produits présents dans produits.js

            produits.forEach(produit => {

                if (!produit.id) return;

                catalogueFusionne.set(
                    produit.id,
                    { ...produit }
                );

            });


            // Conserver les données de l'administration

            catalogueSauvegarde.forEach(produit => {

                if (!produit.id) return;

                const produitExistant =
                    catalogueFusionne.get(produit.id) || {};

                catalogueFusionne.set(produit.id, {

                    ...produitExistant,
                    ...produit

                });

            });


            const nouveauCatalogue = [
                ...catalogueFusionne.values()
            ];


            // Sauvegarder le catalogue fusionné

            localStorage.setItem(
                'catalogueCali29',
                JSON.stringify(nouveauCatalogue)
            );

            localStorage.setItem(
                CLE_VERSION_CATALOGUE,
                VERSION_CATALOGUE
            );


            return nouveauCatalogue;

        }


        // Catalogue déjà à jour

        return catalogueSauvegarde;


    } catch (erreur) {

        console.error("Erreur catalogue :", erreur);

        return [...produits];

    }

}


/* ==========================================
   4. CRÉER UNE CARTE PRODUIT
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
                    ${formaterPrixCatalogue(produit.prix)}
                </div>

            </a>

            <button
                class="bouton-ajouter"
                type="button"
            >
                AJOUTER AU PANIER +
            </button>

        </article>
    `;

}


/* ==========================================
   5. AFFICHER LE CATALOGUE
========================================== */

function afficherCatalogue() {

    const conteneur = document.getElementById('catalogue-produits');

    if (!conteneur) return;

    const catalogue = obtenirCatalogue();

    const sectionCategorie = conteneur.closest('[data-categorie]');

    const categorie = sectionCategorie?.dataset.categorie;


    function obtenirProduitsAffiches() {

        return categorie
            ? catalogue.filter(produit => produit.categorie === categorie)
            : catalogue.slice(0, 4);

    }


    function rendre() {

        const liste = obtenirProduitsAffiches();

        conteneur.innerHTML = liste.length
            ? liste.map(creerCarteProduit).join('')
            : '<p class="catalogue-vide">Aucun produit dans cette catégorie pour le moment.</p>';

    }


    rendre();

}


/* ==========================================
   6. INITIALISATION
========================================== */

document.addEventListener('DOMContentLoaded', afficherCatalogue);
