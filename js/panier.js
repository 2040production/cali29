
/* ==========================================
   PANIER CALI29 V2
   Catalogue synchronisé avec Supabase
========================================== */

let panier = [];

function nettoyerPanier(donnees) {
    if (!Array.isArray(donnees)) return [];

    return donnees
        .filter(article =>
            article &&
            article.id !== undefined &&
            article.id !== null &&
            String(article.id).trim() !== ""
        )
        .map(article => {
            const quantite = Math.floor(Number(article.quantite));
            const prix = Number(article.prix);

            return {
                id: article.id,
                nom: String(article.nom || "Produit"),
                image: String(article.image || ""),
                grammage:
                    article.grammage === null ||
                    article.grammage === undefined
                        ? null
                        : Number(article.grammage),
                prix: Number.isFinite(prix) && prix >= 0 ? prix : 0,
                quantite:
                    Number.isFinite(quantite) && quantite > 0
                        ? quantite
                        : 1
            };
        });
}

try {
    panier = nettoyerPanier(
        JSON.parse(localStorage.getItem("panierCali29") || "[]")
    );
} catch (erreur) {
    panier = [];
}

let codePromoActif = "";
let montantReductionActive = 0;
let messagePromoActuel = "";
let statutPromoActuel = "";


/* ==========================================
   SAUVEGARDE
========================================== */

function sauvegarderPanier() {
    try {
        localStorage.setItem("panierCali29", JSON.stringify(panier));
    } catch (erreur) {
        console.error("Impossible de sauvegarder le panier :", erreur);
    }
}


/* ==========================================
   IDENTIFIER UNE LIGNE DU PANIER
========================================== */

function obtenirCleArticle(article) {
    return `${article.id}-${article.grammage ?? "unique"}`;
}


/* ==========================================
   RECHERCHER UN PRODUIT
========================================== */

function obtenirProduitPanier(idProduit) {
    if (!Array.isArray(window.produits)) return null;

    return window.produits.find(
        produit => String(produit.id) === String(idProduit)
    ) || null;
}


/* ==========================================
   SYNCHRONISER LES PRODUITS
========================================== */

function synchroniserPrixPanier() {
    panier = panier.map(article => {
        const produit = obtenirProduitPanier(article.id);

        if (!produit) return article;

        if (article.grammage === null) {
            return {
                ...article,
                nom: produit.nom,
                prix: Number(produit.prix),
                image: produit.image || ""
            };
        }

        const tarif = produit.tarifs?.find(
            t => Number(t.grammage) === Number(article.grammage)
        );

        if (!tarif) return article;

        return {
            ...article,
            nom: produit.nom,
            prix: Number(tarif.prix),
            image: produit.image || ""
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
    const produit = obtenirProduitPanier(idProduit);

    if (!produit) {
        console.error("Produit introuvable :", idProduit);
        return;
    }

    const quantiteValide = Math.max(
        1,
        Math.floor(Number(quantite) || 1)
    );

    let prix = Number(produit.prix);

    if (grammage !== null && produit.tarifs) {
        const tarif = produit.tarifs.find(
            t => Number(t.grammage) === Number(grammage)
        );

        if (!tarif) {
            console.error("Grammage introuvable :", grammage);
            return;
        }

        prix = Number(tarif.prix);
    } else if (prixSelectionne !== null) {
        prix = Number(prixSelectionne);
    }

    if (!Number.isFinite(prix) || prix < 0) {
        console.error("Prix invalide :", prix);
        return;
    }

    const nouvelArticle = {
        id: produit.id,
        nom: produit.nom,
        image: produit.image || "",
        grammage: grammage,
        prix,
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

    const variation = Number(changement);

    if (!Number.isFinite(variation)) return;

    article.quantite = Math.floor(Number(article.quantite) + variation);

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

    codePromoActif = "";
    montantReductionActive = 0;
    messagePromoActuel = "";
    statutPromoActuel = "";

    const champCodePromo = document.getElementById("code-promo");

    if (champCodePromo) {
        champCodePromo.value = "";
    }

    sauvegarderPanier();
    actualiserPanier();
}


/* ==========================================
   CALCULS
========================================== */

function calculerNombreArticles() {
    return panier.reduce(
        (total, article) => total + Number(article.quantite || 0),
        0
    );
}

function calculerTotalPanier() {
    return panier.reduce(
        (total, article) =>
            total + Number(article.prix || 0) * Number(article.quantite || 0),
        0
    );
}


/* ==========================================
   GESTION DU CODE PROMO
========================================== */

function afficherMessagePromo(message, statut = "") {
    const element = document.getElementById("message-code-promo");

    messagePromoActuel = message;
    statutPromoActuel = statut;

    if (!element) return;

    element.textContent = message;
    element.classList.remove("succes", "erreur");

    if (statut) {
        element.classList.add(statut);
    }
}


function recalculerPromotionActive() {
    const sousTotal = calculerTotalPanier();

    if (!codePromoActif) {
        montantReductionActive = 0;
        return 0;
    }

    if (typeof verifierCodePromo !== "function") {
        return 0;
    }

    const resultat = verifierCodePromo(
        codePromoActif,
        sousTotal,
        "",
        panier
    );

    if (!resultat.valide) {
        codePromoActif = "";
        montantReductionActive = 0;

        afficherMessagePromo(resultat.message, "erreur");

        return 0;
    }

    montantReductionActive = Number(resultat.montantReduction) || 0;

    afficherMessagePromo(
        `Code ${codePromoActif} appliqué : -${montantReductionActive.toFixed(2).replace(".", ",")} €.`,
        "succes"
    );

    return montantReductionActive;
}


function appliquerCodePromo() {
    const champ = document.getElementById("code-promo");

    if (!champ) return;

    if (typeof verifierCodePromo !== "function") {
        afficherMessagePromo(
            "Le système de promotion n'est pas disponible.",
            "erreur"
        );
        return;
    }

    const code = champ.value.trim();

    if (!code) {
        codePromoActif = "";
        montantReductionActive = 0;

        afficherMessagePromo("Saisis un code promo.", "erreur");

        actualiserPanier();
        return;
    }

    const resultat = verifierCodePromo(
        code,
        calculerTotalPanier(),
        "",
        panier
    );

    if (!resultat.valide) {
        codePromoActif = "";
        montantReductionActive = 0;

        afficherMessagePromo(resultat.message, "erreur");

        actualiserPanier();
        return;
    }

    codePromoActif = resultat.promotion.code;
    montantReductionActive = Number(resultat.montantReduction) || 0;

    afficherMessagePromo(
        `Code ${codePromoActif} appliqué : -${montantReductionActive.toFixed(2).replace(".", ",")} €.`,
        "succes"
    );

    actualiserPanier();
}


/* ==========================================
   AFFICHER LES ARTICLES DU PANIER
========================================== */

function afficherArticlesPanier() {
    const liste = document.getElementById("liste-panier");

    if (!liste) return;

    liste.innerHTML = "";

    panier.forEach(article => {
        const cleArticle = obtenirCleArticle(article);

        const ligne = document.createElement("article");
        ligne.className = "article-panier";

        const urlProduit =
            `produit.html?id=${encodeURIComponent(article.id)}`;

        const lienImage = document.createElement("a");
        lienImage.href = urlProduit;
        lienImage.className = "article-panier-lien-image";
        lienImage.setAttribute("aria-label", `Voir ${article.nom}`);

        const image = document.createElement("img");
        image.src = article.image || "";
        image.alt = article.nom || "";

        lienImage.appendChild(image);

        const informations = document.createElement("div");
        informations.className = "article-panier-informations";

        const titre = document.createElement("h3");
        const lienTitre = document.createElement("a");

        lienTitre.href = urlProduit;
        lienTitre.textContent = article.nom;
        lienTitre.className = "article-panier-lien-titre";

        titre.appendChild(lienTitre);

        const prixUnitaire = document.createElement("p");
        prixUnitaire.textContent =
            Number(article.prix).toFixed(2) + " € / unité";

        if (article.grammage !== null && article.grammage !== undefined) {
            const grammage = document.createElement("p");
            grammage.textContent = article.grammage + " g";

            informations.append(titre, grammage, prixUnitaire);
        } else {
            informations.append(titre, prixUnitaire);
        }

        const quantite = document.createElement("div");
        quantite.className = "article-panier-quantite";

        const boutonMoins = document.createElement("button");
        boutonMoins.type = "button";
        boutonMoins.textContent = "−";
        boutonMoins.setAttribute("aria-label", "Diminuer la quantité");

        boutonMoins.addEventListener("click", () => {
            modifierQuantite(cleArticle, -1);
        });

        const nombre = document.createElement("span");
        nombre.textContent = article.quantite;

        const boutonPlus = document.createElement("button");
        boutonPlus.type = "button";
        boutonPlus.textContent = "+";
        boutonPlus.setAttribute("aria-label", "Augmenter la quantité");

        boutonPlus.addEventListener("click", () => {
            modifierQuantite(cleArticle, 1);
        });

        quantite.append(boutonMoins, nombre, boutonPlus);
        informations.append(quantite);

        const actions = document.createElement("div");

        const prixTotal = document.createElement("div");
        prixTotal.className = "article-panier-prix";
        prixTotal.textContent =
            (Number(article.prix) * Number(article.quantite)).toFixed(2) + " €";

        const supprimer = document.createElement("button");
        supprimer.type = "button";
        supprimer.className = "article-panier-supprimer";
        supprimer.textContent = "Supprimer";

        supprimer.addEventListener("click", () => {
            supprimerDuPanier(cleArticle);
        });

        actions.append(prixTotal, supprimer);
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

    const reduction = recalculerPromotionActive();
    const totalApresReduction = Math.max(0, total - reduction);

    const compteur = document.getElementById("nombre-articles");
    const nombreTotal = document.getElementById("panier-nombre-total");
    const sousTotal = document.getElementById("panier-sous-total");
    const reductionElement = document.getElementById("panier-reduction");
    const totalElements = document.querySelectorAll("#panier-total");

    if (compteur) {
        compteur.textContent = nombreArticles;
    }

    if (nombreTotal) {
        nombreTotal.textContent = nombreArticles;
    }

    if (sousTotal) {
        sousTotal.textContent = total.toFixed(2) + " €";
    }

    if (reductionElement) {
        reductionElement.textContent =
            reduction > 0
                ? "- " + reduction.toFixed(2) + " €"
                : "0,00 €";
    }

    totalElements.forEach(element => {
        element.textContent = totalApresReduction.toFixed(2) + " €";
    });

    const champCodePromo = document.getElementById("code-promo");

    if (champCodePromo && !champCodePromo.value && codePromoActif) {
        champCodePromo.value = codePromoActif;
    }

    const messagePromo = document.getElementById("message-code-promo");

    if (messagePromo && messagePromoActuel) {
        messagePromo.textContent = messagePromoActuel;

        messagePromo.classList.remove("succes", "erreur");

        if (statutPromoActuel) {
            messagePromo.classList.add(statutPromoActuel);
        }
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
   BRANCHER LES BOUTONS DU CATALOGUE
========================================== */

function connecterBoutonsCatalogue() {
    const boutonsCatalogue = document.querySelectorAll(
        ".carte-produit .bouton-ajouter"
    );

    boutonsCatalogue.forEach(bouton => {
        if (bouton.dataset.panierConnecte === "true") return;

        bouton.dataset.panierConnecte = "true";

        bouton.addEventListener("click", () => {
            const carte = bouton.closest(".carte-produit");
            const lienProduit = carte?.querySelector(".lien-produit");

            if (!lienProduit) return;

            const url = new URL(lienProduit.href);
            const idProduit = url.searchParams.get("id");

            if (!idProduit) return;

            const produit = obtenirProduitPanier(idProduit);

            if (!produit) return;

            const tarifs = Array.isArray(produit.tarifs)
                ? [...produit.tarifs].sort(
                    (a, b) => Number(a.grammage) - Number(b.grammage)
                )
                : [];

            if (tarifs.length > 0) {
                const premierTarif = tarifs[0];

                ajouterAuPanier(
                    idProduit,
                    1,
                    Number(premierTarif.grammage),
                    Number(premierTarif.prix)
                );
            } else {
                ajouterAuPanier(idProduit, 1);
            }
        });
    });
}


/* ==========================================
   BRANCHER LE BOUTON DE LA FICHE PRODUIT
========================================== */

function connecterBoutonFicheProduit() {
    const boutonFiche = document.getElementById("ajouter-produit-panier");

    if (!boutonFiche || boutonFiche.dataset.panierConnecte === "true") {
        return;
    }

    boutonFiche.dataset.panierConnecte = "true";

    boutonFiche.addEventListener("click", () => {
        const parametres = new URLSearchParams(window.location.search);
        const idProduit = parametres.get("id");

        const champQuantite = document.getElementById("quantite-produit");

        const quantite = champQuantite
            ? Math.max(1, Math.floor(Number(champQuantite.value) || 1))
            : 1;

        if (!idProduit) return;

        const selectGrammage = document.getElementById("grammage-produit");

        let grammage = null;
        let prix = null;

        if (selectGrammage && !selectGrammage.closest("[hidden]")) {
            grammage = Number(selectGrammage.value);

            const produit = obtenirProduitPanier(idProduit);

            const tarif = produit?.tarifs?.find(
                t => Number(t.grammage) === grammage
            );

            if (!tarif) return;

            prix = Number(tarif.prix);
        }

        ajouterAuPanier(idProduit, quantite, grammage, prix);
    });
}


/* ==========================================
   INITIALISATION
========================================== */

document.addEventListener("DOMContentLoaded", async () => {
    try {
        if (window.cataloguePret) {
            await window.cataloguePret;
        }

        synchroniserPrixPanier();
        actualiserPanier();

        connecterBoutonsCatalogue();
        connecterBoutonFicheProduit();

    } catch (erreur) {
        console.error("Initialisation du panier impossible :", erreur);
        actualiserPanier();
    }

    const boutonVider = document.getElementById("vider-panier");

    if (boutonVider) {
        boutonVider.addEventListener("click", viderPanier);
    }

    const boutonPromo = document.getElementById("appliquer-code-promo");
    const champCodePromo = document.getElementById("code-promo");

    if (boutonPromo) {
        boutonPromo.addEventListener("click", appliquerCodePromo);
    }

    if (champCodePromo) {
        champCodePromo.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                appliquerCodePromo();
            }
        });
    }
});
