
/* ==========================================
   COMMANDE CALI29
   CALCUL ET GÉNÉRATION DU MESSAGE
========================================== */

// Identifiant Telegram
const TELEGRAM_USERNAME = "brestdrive";


/* ==========================================
   FORMATER LES PRIX
========================================== */

function formaterPrix(prix) {
    return Number(prix).toFixed(2).replace(".", ",") + " €";
}


/* ==========================================
   NORMALISER LE NOM DE LA VILLE
========================================== */

function normaliserVilleCommande(ville) {

    return String(ville || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


/* ==========================================
   OBTENIR LE PRIX D'UN ARTICLE
   SELON LA VILLE DE LIVRAISON
========================================== */

function obtenirPrixArticleCommande(article, livraison = null) {

    const produit = typeof produits !== "undefined"
        ? produits.find(p => p.id === article.id)
        : null;

    // Produit introuvable : conserver le prix du panier
    if (!produit) {
        return Number(article.prix) || 0;
    }

    // Prix standard
    let prix = Number(article.prix) || 0;

    // Retrouver le tarif standard du grammage
    if (article.grammage !== null && article.grammage !== undefined) {

        const tarifStandard = produit.tarifs?.find(
            tarif =>
                Number(tarif.grammage) === Number(article.grammage)
        );

        if (tarifStandard) {
            prix = Number(tarifStandard.prix);
        }

    } else {

        prix = Number(produit.prix) || prix;

    }

    // Aucun tarif spécial sans ville renseignée
    if (!livraison || !livraison.ville) {
        return prix;
    }

    const ville = normaliserVilleCommande(livraison.ville);

    // Rechercher un tarif spécial correspondant
    const tarifSpecial = Array.isArray(produit.tarifsSpeciaux)
        ? produit.tarifsSpeciaux.find(tarif => {

            const villeTarif = normaliserVilleCommande(tarif.ville);

            const memeVille =
                villeTarif === ville ||
                villeTarif === "toutes" ||
                villeTarif === "toutes les villes";

            const memeGrammage =
                Number(tarif.grammage) === Number(article.grammage);

            return memeVille && memeGrammage;

        })
        : null;

    if (tarifSpecial && Number.isFinite(Number(tarifSpecial.prix))) {
        prix = Number(tarifSpecial.prix);
    }

    return prix;

}


/* ==========================================
   PRÉPARER LES ARTICLES DE COMMANDE
========================================== */

function obtenirArticlesCommande(livraison = null) {

    if (!Array.isArray(panier)) {
        return [];
    }

    return panier.map(article => {

        const prix = obtenirPrixArticleCommande(
            article,
            livraison
        );

        return {
            ...article,
            prix: prix,
            sousTotal: prix * Number(article.quantite)
        };

    });

}


/* ==========================================
   MINIMUM DE COMMANDE
========================================== */

function obtenirMinimumCommande(livraison) {

    if (!livraison || !livraison.ville) {
        return null;
    }

    const ville = normaliserVilleCommande(livraison.ville);

    // Minimum de 30 € uniquement à Brest
    if (ville === "brest") {
        return 30;
    }

    // Aucun minimum dans les autres villes
    return null;

}


/* ==========================================
   VÉRIFIER LE MINIMUM DE COMMANDE
========================================== */

function verifierMinimumCommande(livraison, sousTotal) {

    const minimum = obtenirMinimumCommande(livraison);

    const montant = Number(sousTotal) || 0;

    // Aucune restriction hors Brest
    if (minimum === null) {

        return {
            valide: true,
            minimum: null,
            sousTotal: montant,
            montantManquant: 0
        };

    }

    const montantManquant = Math.max(0, minimum - montant);

    return {
        valide: montant >= minimum,
        minimum,
        sousTotal: montant,
        montantManquant
    };

}


/* ==========================================
   CALCULER LES FRAIS DE LIVRAISON
========================================== */

function calculerFraisLivraison(livraison) {

    if (!livraison || !livraison.ville) {
        return 0;
    }

    const ville = normaliserVilleCommande(livraison.ville);

    // Livraison gratuite à Brest
    if (ville === "brest") {
        return 0;
    }

    // Toutes les autres villes : 10 €
    return 10;

}


/* ==========================================
   CALCULER LES TOTAUX DE COMMANDE
========================================== */

function calculerDetailsCommande(livraison = null) {

    if (
        typeof panier === "undefined" ||
        !Array.isArray(panier) ||
        panier.length === 0
    ) {
        return null;
    }

    // ARTICLES AVEC LEURS PRIX APPLIQUÉS SELON LA VILLE
    const articles = obtenirArticlesCommande(livraison);

    // SOUS-TOTAL AVANT RÉDUCTIONS
    const sousTotal = articles.reduce(
        (total, article) => total + article.sousTotal,
        0
    );

    // MINIMUM DE COMMANDE : calculé sur le sous-total produits
    const verificationMinimum = livraison && livraison.ville
        ? verifierMinimumCommande(livraison, sousTotal)
        : null;

    // OFFRES SPÉCIALES
    const resultatOffres = (
        typeof calculerOffresSpeciales === "function" && livraison && livraison.ville
    )
        ? calculerOffresSpeciales(articles, livraison.ville)
        : {
            montantReduction: 0,
            offresAppliquees: [],
            detailsArticles: []
        };

    const montantReductionOffres = Number(resultatOffres.montantReduction) || 0;

    // Préparer les montants après offres pour calculer un éventuel code promo cumulable.
    // La réduction fixe de l'offre est répartie sur les unités de l'article.
    const articlesApresOffres = articles.map(article => {

        const reductionsArticle = (resultatOffres.detailsArticles || [])
            .filter(detail =>
                detail.produitId === article.id &&
                Number(detail.grammage) === Number(article.grammage)
            )
            .reduce(
                (total, detail) => total + Number(detail.montantReduction || 0),
                0
            );

        const reductionUnitaire = article.quantite > 0
            ? reductionsArticle / Number(article.quantite)
            : 0;

        const prixApresOffre = Math.max(
            0,
            Number(article.prix) - reductionUnitaire
        );

        return {
            ...article,
            prix: prixApresOffre,
            sousTotal: prixApresOffre * Number(article.quantite)
        };

    });

    const sousTotalApresOffres = Math.max(
        0,
        sousTotal - montantReductionOffres
    );

    // CODE PROMO
    let codePromo = "";
    let montantReduction = 0;
    let messagePromo = "";
    let promoValide = false;

    if (
        typeof codePromoActif !== "undefined" &&
        codePromoActif
    ) {

        codePromo = String(codePromoActif).trim();

        if (
            typeof verifierCodePromo === "function" &&
            livraison &&
            livraison.ville
        ) {

            const resultatPromo = verifierCodePromo(
                codePromo,
                sousTotalApresOffres,
                livraison.ville,
                articlesApresOffres,
                resultatOffres.offresAppliquees || []
            );

            promoValide = resultatPromo.valide;
            messagePromo = resultatPromo.message;

            if (promoValide) {
                montantReduction = Number(resultatPromo.montantReduction) || 0;
            }

        } else if (!livraison || !livraison.ville) {

            messagePromo = "Ville de livraison non renseignée.";

        }

    }

    // LIVRAISON
    const fraisLivraison = calculerFraisLivraison(livraison);

    // TOTAL FINAL
    const total = Math.max(
        0,
        sousTotal - montantReductionOffres - montantReduction + fraisLivraison
    );

    return {

        articles,
        sousTotal,

        montantReductionOffres,
        offresAppliquees: resultatOffres.offresAppliquees || [],
        detailsOffres: resultatOffres.detailsArticles || [],

        sousTotalApresOffres,

        codePromo,
        montantReduction,
        promoValide,
        messagePromo,

        fraisLivraison,
        total,

        // Informations sur le minimum de commande
        minimumCommande: verificationMinimum
            ? verificationMinimum.minimum
            : null,

        commandeMinimumAtteint: verificationMinimum
            ? verificationMinimum.valide
            : null,

        montantManquant: verificationMinimum
            ? verificationMinimum.montantManquant
            : 0

    };

}


/* ==========================================
   GÉNÉRER LE RÉCAPITULATIF
========================================== */

function genererRecapitulatifCommande(livraison = null) {

    const details = calculerDetailsCommande(livraison);

    if (!details) {
        alert("Ton panier est vide.");
        return null;
    }

    // VÉRIFICATION DU MINIMUM
    if (
        livraison &&
        livraison.ville &&
        details.commandeMinimumAtteint === false
    ) {

        alert(
            "Le minimum de commande pour cette ville est de " +
            formaterPrix(details.minimumCommande) +
            ". Il manque " +
            formaterPrix(details.montantManquant) +
            " à ton panier."
        );

        return null;

    }

    let message =
        "Bonjour, je souhaite passer commande chez CALI29.\n\n";

    message += "MA COMMANDE\n\n";

    // ARTICLES
    details.articles.forEach(article => {

        const prixLigne = article.sousTotal;

        message += "• " + article.nom + "\n";

        if (
            article.grammage !== null &&
            article.grammage !== undefined
        ) {

            message +=
                "  Grammage : " + article.grammage + " g\n";

        }

        message +=
            "  Quantité : " + article.quantite + "\n" +
            "  Prix unitaire : " + formaterPrix(article.prix) + "\n" +
            "  Sous-total : " + formaterPrix(prixLigne) + "\n\n";

    });

    // RÉCAPITULATIF FINANCIER
    message += "--------------------------\n";

    message +=
        "SOUS-TOTAL PRODUITS : " +
        formaterPrix(details.sousTotal) + "\n";

    // OFFRES SPÉCIALES
    if (details.offresAppliquees && details.offresAppliquees.length > 0) {

        details.offresAppliquees.forEach(offre => {

            message +=
                "OFFRE SPÉCIALE (" + offre.nom + ") : -" +
                formaterPrix(offre.montantReduction) + "\n";

        });

    }

    // CODE PROMO
    if (details.codePromo) {

        if (details.promoValide) {

            message +=
                "CODE PROMO (" + details.codePromo + ") : -" +
                formaterPrix(details.montantReduction) + "\n";

        } else {

            message +=
                "CODE PROMO NON APPLIQUÉ (" +
                details.codePromo + ")\n";

            message +=
                "Motif : " + details.messagePromo + "\n";

        }

    }

    // LIVRAISON
    if (livraison) {

        message +=
            "LIVRAISON : " +
            (
                details.fraisLivraison === 0
                    ? "Gratuite (Brest)"
                    : formaterPrix(details.fraisLivraison)
            ) + "\n";

    } else {

        message += "LIVRAISON : À confirmer\n";

    }

    // TOTAL
    message += "--------------------------\n";

    message +=
        "TOTAL : " + formaterPrix(details.total) + "\n";

    // COORDONNÉES DE LIVRAISON
    if (livraison) {

        message += "\nADRESSE DE LIVRAISON\n\n";

        message += "Adresse : " + livraison.adresse + "\n";
        message += "Code postal : " + livraison.codePostal + "\n";
        message += "Ville : " + livraison.ville + "\n";

    }

    message +=
        "\nMerci de me confirmer la disponibilité et les modalités de commande.";

    return message;

}


/* ==========================================
   OUVRIR TELEGRAM
   AUTRES PAGES DU SITE
========================================== */

function ouvrirTelegram() {

    if (!TELEGRAM_USERNAME) {

        alert("Configure ton identifiant Telegram dans commande.js.");

        return;

    }

    const message = genererRecapitulatifCommande();

    if (!message) return;

    const lienTelegram =
        "https://t.me/" +
        TELEGRAM_USERNAME.replace("@", "") +
        "?text=" + encodeURIComponent(message);

    window.open(lienTelegram, "_blank");

}


/* ==========================================
   INITIALISATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Le bouton commander-panier est géré par order-popup.js.

    // On conserve le bouton de commande éventuel des autres pages.
    const boutonCommande = document.getElementById("commander");

    if (boutonCommande) {
        boutonCommande.addEventListener("click", ouvrirTelegram);
    }

});
