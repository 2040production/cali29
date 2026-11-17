
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

    const selectTri = document.getElementById('tri-produits');


    /* ======================================
       OBTENIR LES PRODUITS À AFFICHER
    ====================================== */

    function obtenirProduitsAffiches() {

        let liste = categorie

            ? catalogue.filter(produit => produit.categorie === categorie)

            : [...catalogue]
                .sort((a, b) =>
                    (b.popularite || 0) - (a.popularite || 0)
                )
                .slice(0, 4);


        /* ==================================
           TRI DES PRODUITS
        ================================== */

        if (selectTri) {

            switch (selectTri.value) {

                case 'prix-croissant':

                    liste.sort((a, b) => a.prix - b.prix);

                    break;


                case 'prix-decroissant':

                    liste.sort((a, b) => b.prix - a.prix);

                    break;


                case 'nom':

                    liste.sort((a, b) =>
                        a.nom.localeCompare(b.nom, 'fr')
                    );

                    break;


                case 'popularite':

                default:

                    liste.sort((a, b) =>
                        (b.popularite || 0) - (a.popularite || 0)
                    );

            }

        }

        return liste;

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


    /* ======================================
       ÉVÉNEMENT DE TRI
    ====================================== */

    if (selectTri) {

        selectTri.addEventListener('change', rendre);

    }


    // Affichage initial
    rendre();

}


/* ==========================================
   6. INITIALISATION
========================================== */

document.addEventListener('DOMContentLoaded', afficherCatalogue);
