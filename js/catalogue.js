/* ==========================================
   AFFICHAGE DU CATALOGUE - CALI29
   Les données viennent de js/produits.js
========================================== */

function formaterPrixCatalogue(prix) {
    return Number(prix).toFixed(2).replace('.', ',') + ' €';
}

function echapperHTML(valeur) {
    return String(valeur ?? '').replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere]);
}

function creerCarteProduit(produit) {
    return `
        <article class="carte-produit">
            <button class="bouton-favoris" type="button" aria-label="Ajouter ${echapperHTML(produit.nom)} aux favoris">
                ♡
            </button>

            <a href="produit.html?id=${encodeURIComponent(produit.id)}" class="lien-produit">
                <img src="${echapperHTML(produit.image)}" alt="${echapperHTML(produit.nom)}">
                <h3>${echapperHTML(produit.nom)}</h3>
                <p>${echapperHTML(produit.description)}</p>
                <div class="prix-produit">
                    ${formaterPrixCatalogue(produit.prix)}
                </div>
            </a>

            <button class="bouton-ajouter" type="button">
                AJOUTER AU PANIER +
            </button>
        </article>
    `;
}

function afficherCatalogue() {
    const conteneur = document.getElementById('catalogue-produits');
    if (!conteneur) return;

    const sectionCategorie = conteneur.closest('[data-categorie]');
    const categorie = sectionCategorie?.dataset.categorie;
    const selectTri = document.getElementById('tri-produits');

    function obtenirProduitsAffiches() {
        let liste = categorie
            ? produits.filter(produit => produit.categorie === categorie)
            : [...produits].sort((a, b) => (b.popularite || 0) - (a.popularite || 0)).slice(0, 4);

        if (selectTri) {
            switch (selectTri.value) {
                case 'prix-croissant':
                    liste.sort((a, b) => a.prix - b.prix);
                    break;
                case 'prix-decroissant':
                    liste.sort((a, b) => b.prix - a.prix);
                    break;
                case 'nom':
                    liste.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
                    break;
                case 'popularite':
                default:
                    liste.sort((a, b) => (b.popularite || 0) - (a.popularite || 0));
            }
        }

        return liste;
    }

    function rendre() {
        const liste = obtenirProduitsAffiches();
        conteneur.innerHTML = liste.length
            ? liste.map(creerCarteProduit).join('')
            : '<p class="catalogue-vide">Aucun produit dans cette catégorie pour le moment.</p>';
    }

    if (selectTri) {
        selectTri.addEventListener('change', rendre);
    }

    rendre();
}

document.addEventListener('DOMContentLoaded', afficherCatalogue);
