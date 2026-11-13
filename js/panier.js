
/* ==========================================
   PANIER CALI29
========================================== */

// Récupération du panier enregistré
let panier = JSON.parse(localStorage.getItem("panierCali29")) || [];


/* ==========================================
   SAUVEGARDE
========================================== */

function sauvegarderPanier() {
    localStorage.setItem("panierCali29", JSON.stringify(panier));
}


/* ==========================================
   SYNCHRONISER LES PRIX
========================================== */

function synchroniserPrixPanier() {

    panier = panier.map(article => {

        const produit = produits.find(p => p.id === article.id);

        if (!produit) {
            return article;
        }

        return {
            ...article,
            nom: produit.nom,
            prix: produit.prix,
            image: produit.image
        };

    });

    sauvegarderPanier();
}


/* ==========================================
   AJOUTER UN PRODUIT
========================================== */

function ajouterAuPanier(idProduit, quantite = 1) {

    const produit = produits.find(p => p.id === idProduit);

    if (!produit) {
        console.error("Produit introuvable :", idProduit);
        return;
    }

    const quantiteValide = Math.max(1, parseInt(quantite, 10) || 1);

    const articleExistant = panier.find(p => p.id === idProduit);

    if (articleExistant) {

        articleExistant.quantite += quantiteValide;

        // Mise à jour du prix depuis produits.js
        articleExistant.prix = produit.prix;
        articleExistant.nom = produit.nom;
        articleExistant.image = produit.image;

    } else {

        panier.push({
            id: produit.id,
            nom: produit.nom,
            prix: produit.prix,
            image: produit.image,
            quantite: quantiteValide
        });

    }

    sauvegarderPanier();
    actualiserPanier();
}


/* ==========================================
   MODIFIER LA QUANTITÉ
========================================== */

function modifierQuantite(idProduit, changement) {

    const article = panier.find(p => p.id === idProduit);

    if (!article) return;

    article.quantite += changement;

    if (article.quantite <= 0) {
        panier = panier.filter(p => p.id !== idProduit);
    }

    sauvegarderPanier();
    actualiserPanier();
}


/* ==========================================
   SUPPRIMER UN ARTICLE
========================================== */

function supprimerDuPanier(idProduit) {

    panier = panier.filter(p => p.id !== idProduit);

    sauvegarderPanier();
    actualiserPanier();
}


/* ==========================================
   VIDER LE PANIER
========================================== */

function viderPanier() {

    panier = [];

    sauvegarderPanier();
    actualiserPanier();
}


/* ==========================================
   CALCULS
========================================== */

function calculerNombreArticles() {

    return panier.reduce(
        (total, article) => total + article.quantite,
        0
    );
}


function calculerTotalPanier() {

    return panier.reduce(
        (total, article) => total + article.prix * article.quantite,
        0
    );
}


/* ==========================================
   AFFICHER LE PANIER
========================================== */

function afficherArticlesPanier() {

    const liste = document.getElementById("liste-panier");

    if (!liste) return;

    liste.innerHTML = "";

    panier.forEach(article => {

        const ligne = document.createElement("article");
        ligne.className = "article-panier";

        const image = document.createElement("img");
        image.src = article.image;
        image.alt = article.nom;

        const informations = document.createElement("div");
        informations.className = "article-panier-informations";

        const titre = document.createElement("h3");
        titre.textContent = article.nom;

        const prixUnitaire = document.createElement("p");
        prixUnitaire.textContent =
            article.prix.toFixed(2) + " € / unité";

        const quantite = document.createElement("div");
        quantite.className = "article-panier-quantite";

        const boutonMoins = document.createElement("button");
        boutonMoins.type = "button";
        boutonMoins.textContent = "−";
        boutonMoins.setAttribute("aria-label", "Diminuer la quantité");

        boutonMoins.addEventListener("click", () => {
            modifierQuantite(article.id, -1);
        });

        const nombre = document.createElement("span");
        nombre.textContent = article.quantite;

        const boutonPlus = document.createElement("button");
        boutonPlus.type = "button";
        boutonPlus.textContent = "+";
        boutonPlus.setAttribute("aria-label", "Augmenter la quantité");

        boutonPlus.addEventListener("click", () => {
            modifierQuantite(article.id, 1);
        });

        quantite.append(boutonMoins, nombre, boutonPlus);

        informations.append(titre, prixUnitaire, quantite);

        const actions = document.createElement("div");

        const prixTotal = document.createElement("div");
        prixTotal.className = "article-panier-prix";
        prixTotal.textContent =
            (article.prix * article.quantite).toFixed(2) + " €";

        const supprimer = document.createElement("button");
        supprimer.type = "button";
        supprimer.className = "article-panier-supprimer";
        supprimer.textContent = "Supprimer";

        supprimer.addEventListener("click", () => {
            supprimerDuPanier(article.id);
        });

        actions.append(prixTotal, supprimer);

        ligne.append(image, informations, actions);

        liste.appendChild(ligne);

    });
}


/* ==========================================
   ACTUALISER LES TOTAUX ET L'AFFICHAGE
========================================== */

function actualiserPanier() {

    const panierVide = document.getElementById("panier-vide");
    const panierRempli = document.getElementById("panier-rempli");

    const nombreArticles = calculerNombreArticles();
    const total = calculerTotalPanier();

    const compteur = document.getElementById("nombre-articles");
    const nombreTotal = document.getElementById("panier-nombre-total");
    const sousTotal = document.getElementById("panier-sous-total");
    const totalElement = document.getElementById("panier-total");

    if (compteur) {
        compteur.textContent = nombreArticles;
    }

    if (nombreTotal) {
        nombreTotal.textContent = nombreArticles;
    }

    if (sousTotal) {
        sousTotal.textContent = total.toFixed(2) + " €";
    }

    if (totalElement) {
        totalElement.textContent = total.toFixed(2) + " €";
    }

    if (panierVide && panierRempli) {

        if (panier.length === 0) {
            panierVide.style.display = "block";
            panierRempli.style.display = "none";
        } else {
            panierVide.style.display = "none";
            panierRempli.style.display = "grid";
        }

    }

    afficherArticlesPanier();
}


/* ==========================================
   INITIALISATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Corriger les anciens prix enregistrés
    synchroniserPrixPanier();

    // Actualiser le panier
    actualiserPanier();


    // VIDER LE PANIER
    const boutonVider = document.getElementById("vider-panier");

    if (boutonVider) {
        boutonVider.addEventListener("click", viderPanier);
    }


    // BOUTONS AJOUTER AU PANIER DES CATALOGUES
    const boutonsCatalogue = document.querySelectorAll(
        ".carte-produit .bouton-ajouter"
    );

    boutonsCatalogue.forEach(bouton => {

        bouton.addEventListener("click", () => {

            const carte = bouton.closest(".carte-produit");
            const lienProduit = carte.querySelector(".lien-produit");

            if (!lienProduit) {
                console.error("Lien produit introuvable.");
                return;
            }

            const url = new URL(lienProduit.href);
            const idProduit = url.searchParams.get("id");

            if (idProduit) {
                ajouterAuPanier(idProduit, 1);
            }

        });

    });


    // BOUTON AJOUTER AU PANIER DE LA FICHE PRODUIT
    const boutonFiche = document.getElementById("ajouter-produit-panier");

    if (boutonFiche) {

        boutonFiche.addEventListener("click", () => {

            const parametres = new URLSearchParams(window.location.search);
            const idProduit = parametres.get("id");

            const champQuantite = document.getElementById("quantite-produit");

            const quantite = champQuantite
                ? Math.max(1, parseInt(champQuantite.value, 10) || 1)
                : 1;

            if (idProduit) {
                ajouterAuPanier(idProduit, quantite);
            }

        });

    }

});
