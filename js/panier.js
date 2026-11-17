
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
   IDENTIFIER UNE LIGNE DU PANIER
========================================== */

function obtenirCleArticle(article) {
    return `${article.id}-${article.grammage ?? "unique"}`;
}


/* ==========================================
   SYNCHRONISER LES PRODUITS
========================================== */

function synchroniserPrixPanier() {

    panier = panier.map(article => {

        const produit = produits.find(p => p.id === article.id);

        if (!produit) return article;

        if (article.grammage == null) {

            return {
                ...article,
                nom: produit.nom,
                prix: produit.prix,
                image: produit.image
            };

        }

        const tarif = produit.tarifs?.find(
            t => t.grammage === Number(article.grammage)
        );

        if (!tarif) return article;

        return {
            ...article,
            nom: produit.nom,
            prix: tarif.prix,
            image: produit.image
        };

    });

    sauvegarderPanier();
}


/* ==========================================
   AJOUTER UN PRODUIT
========================================== */

function ajouterAuPanier(
    idProduit,
    quantite = 1,
    grammage = null,
    prixSelectionne = null
) {

    const produit = produits.find(p => p.id === idProduit);

    if (!produit) {
        console.error("Produit introuvable :", idProduit);
        return;
    }

    const quantiteValide = Math.max(
        1,
        parseInt(quantite, 10) || 1
    );

    let prix = produit.prix;

    if (grammage !== null && produit.tarifs) {

        const tarif = produit.tarifs.find(
            t => t.grammage === Number(grammage)
        );

        if (!tarif) {
            console.error("Grammage introuvable :", grammage);
            return;
        }

        prix = tarif.prix;

    } else if (prixSelectionne !== null) {

        prix = prixSelectionne;

    }

    const nouvelArticle = {
        id: produit.id,
        nom: produit.nom,
        image: produit.image,
        grammage: grammage,
        prix: prix,
        quantite: quantiteValide
    };

    const articleExistant = panier.find(
        article =>
            obtenirCleArticle(article) === obtenirCleArticle(nouvelArticle)
    );

    if (articleExistant) {

        articleExistant.quantite += quantiteValide;

    } else {

        panier.push(nouvelArticle);

    }

    sauvegarderPanier();
    actualiserPanier();
}


/* ==========================================
   MODIFIER LA QUANTITÉ
========================================== */

function modifierQuantite(cleArticle, changement) {

    const article = panier.find(
        p => obtenirCleArticle(p) === cleArticle
    );

    if (!article) return;

    article.quantite += changement;

    if (article.quantite <= 0) {

        panier = panier.filter(
            p => obtenirCleArticle(p) !== cleArticle
        );

    }

    sauvegarderPanier();
    actualiserPanier();
}


/* ==========================================
   SUPPRIMER UN ARTICLE
========================================== */

function supprimerDuPanier(cleArticle) {

    panier = panier.filter(
        article => obtenirCleArticle(article) !== cleArticle
    );

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

        const cleArticle = obtenirCleArticle(article);

        const ligne = document.createElement("article");
        ligne.className = "article-panier";

        // URL de la fiche produit correspondante
        const urlProduit = `produit.html?id=${encodeURIComponent(article.id)}`;

        // ==========================================
        // IMAGE CLIQUABLE
        // ==========================================

        const lienImage = document.createElement("a");
        lienImage.href = urlProduit;
        lienImage.className = "article-panier-lien-image";
        lienImage.setAttribute("aria-label", `Voir ${article.nom}`);

        const image = document.createElement("img");
        image.src = article.image;
        image.alt = article.nom;

        lienImage.appendChild(image);

        // ==========================================
        // INFORMATIONS PRODUIT
        // ==========================================

        const informations = document.createElement("div");
        informations.className = "article-panier-informations";

        // Nom cliquable
        const titre = document.createElement("h3");

        const lienTitre = document.createElement("a");
        lienTitre.href = urlProduit;
        lienTitre.textContent = article.nom;
        lienTitre.className = "article-panier-lien-titre";

        titre.appendChild(lienTitre);

        const prixUnitaire = document.createElement("p");

        prixUnitaire.textContent =
            article.prix.toFixed(2) + " € / unité";

        // Afficher le grammage si présent
        if (article.grammage !== null) {

            const grammage = document.createElement("p");
            grammage.textContent = article.grammage + " g";

            informations.append(titre, grammage, prixUnitaire);

        } else {

            informations.append(titre, prixUnitaire);

        }

        // ==========================================
        // QUANTITÉ
        // ==========================================

        const quantite = document.createElement("div");
        quantite.className = "article-panier-quantite";

        const boutonMoins = document.createElement("button");
        boutonMoins.type = "button";
        boutonMoins.textContent = "−";

        boutonMoins.addEventListener("click", () => {
            modifierQuantite(cleArticle, -1);
        });

        const nombre = document.createElement("span");
        nombre.textContent = article.quantite;

        const boutonPlus = document.createElement("button");
        boutonPlus.type = "button";
        boutonPlus.textContent = "+";

        boutonPlus.addEventListener("click", () => {
            modifierQuantite(cleArticle, 1);
        });

        quantite.append(boutonMoins, nombre, boutonPlus);

        informations.append(quantite);

        // ==========================================
        // ACTIONS ET PRIX TOTAL
        // ==========================================

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
            supprimerDuPanier(cleArticle);
        });

        actions.append(prixTotal, supprimer);

        // ==========================================
        // ASSEMBLAGE DE LA LIGNE
        // ==========================================

        ligne.append(lienImage, informations, actions);

        liste.appendChild(ligne);

    });
}


/* ==========================================
   ACTUALISER LES TOTAUX
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

    if (compteur) compteur.textContent = nombreArticles;

    if (nombreTotal) nombreTotal.textContent = nombreArticles;

    if (sousTotal) sousTotal.textContent = total.toFixed(2) + " €";

    if (totalElement) totalElement.textContent = total.toFixed(2) + " €";

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

    synchroniserPrixPanier();
    actualiserPanier();

    const boutonVider = document.getElementById("vider-panier");

    if (boutonVider) {
        boutonVider.addEventListener("click", viderPanier);
    }


    // AJOUT DEPUIS LE CATALOGUE

    const boutonsCatalogue = document.querySelectorAll(
        ".carte-produit .bouton-ajouter"
    );

    boutonsCatalogue.forEach(bouton => {

        bouton.addEventListener("click", () => {

            const carte = bouton.closest(".carte-produit");
            const lienProduit = carte.querySelector(".lien-produit");

            if (!lienProduit) return;

            const url = new URL(lienProduit.href);
            const idProduit = url.searchParams.get("id");

            if (idProduit) {
                ajouterAuPanier(idProduit, 1);
            }

        });

    });


    // AJOUT DEPUIS LA FICHE PRODUIT

    const boutonFiche = document.getElementById("ajouter-produit-panier");

    if (boutonFiche) {

        boutonFiche.addEventListener("click", () => {

            const parametres = new URLSearchParams(window.location.search);
            const idProduit = parametres.get("id");

            const champQuantite = document.getElementById("quantite-produit");

            const quantite = champQuantite
                ? Math.max(1, parseInt(champQuantite.value, 10) || 1)
                : 1;

            if (!idProduit) return;

            // Récupérer le grammage sélectionné
            const selectGrammage = document.getElementById("grammage-produit");

            let grammage = null;
            let prix = null;

            if (selectGrammage && !selectGrammage.closest("[hidden]")) {

                grammage = Number(selectGrammage.value);

                const produit = produits.find(p => p.id === idProduit);

                const tarif = produit?.tarifs?.find(
                    t => t.grammage === grammage
                );

                if (!tarif) return;

                prix = tarif.prix;

            }

            ajouterAuPanier(idProduit, quantite, grammage, prix);

        });

    }

});
