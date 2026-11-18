/* ==========================================
   AFFICHAGE DU CATALOGUE - CALI29
   Données :
   - localStorage si catalogue modifié
   - produits.js par défaut
========================================== */


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
   3. RÉCUPÉRER LE CATALOGUE
========================================== */

function obtenirCatalogue() {

    try {

        const donnees = localStorage.getItem('catalogueCali29');

        if (donnees !== null) {

            const catalogueSauvegarde = JSON.parse(donnees);

            if (Array.isArray(catalogueSauvegarde)) {
                return catalogueSauvegarde;
            }

        }

    } catch (erreur) {

        console.error(
            "Erreur de récupération du catalogue :",
            erreur
        );

    }

    return [...produits];

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

    // Récupérer les données actualisées
    const catalogue = obtenirCatalogue();

    const sectionCategorie = conteneur.closest('[data-categorie]');

    const categorie = sectionCategorie?.dataset.categorie;


    /* ======================================
       OBTENIR LES PRODUITS À AFFICHER
       Aucun tri : ordre défini dans produits.js
    ====================================== */

    function obtenirProduitsAffiches() {

        // Sur une page catégorie, afficher tous les produits de la catégorie.
        // Sur l'accueil, afficher les 4 premiers produits du catalogue.
        return categorie
            ? catalogue.filter(produit => produit.categorie === categorie)
            : catalogue.slice(0, 4);

    }


    /* ======================================
       GÉNÉRER L'AFFICHAGE
    ====================================== */

    function rendre() {

        const liste = obtenirProduitsAffiches();

        conteneur.innerHTML = liste.length

            ? liste.map(creerCarteProduit).join('')

            : '<p class="catalogue-vide">Aucun produit dans cette catégorie pour le moment.</p>';

    }


    // Affichage initial
    rendre();

}


/* ==========================================
   6. INITIALISATION
========================================== */

document.addEventListener('DOMContentLoaded', afficherCatalogue);