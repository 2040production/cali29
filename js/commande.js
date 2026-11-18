
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
   CALCULER LES FRAIS DE LIVRAISON
========================================== */

function calculerFraisLivraison(livraison) {

    if (!livraison || !livraison.ville) {
        return 0;
    }

    const ville = normaliserTexte(livraison.ville);

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

    // SOUS-TOTAL PRODUITS

    let sousTotal = 0;

    panier.forEach(article => {

        sousTotal +=
            Number(article.prix) * Number(article.quantite);

    });


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
                sousTotal,
                livraison.ville,
                panier
            );

            promoValide = resultatPromo.valide;
            messagePromo = resultatPromo.message;

            if (promoValide) {
                montantReduction = resultatPromo.montantReduction;
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
        sousTotal - montantReduction + fraisLivraison
    );

    return {
        sousTotal,
        codePromo,
        montantReduction,
        promoValide,
        messagePromo,
        fraisLivraison,
        total
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

    let message =
        "Bonjour, je souhaite passer commande chez CALI29.\n\n";

    message += "MA COMMANDE\n\n";


    // ARTICLES

    panier.forEach(article => {

        const prixLigne =
            Number(article.prix) * Number(article.quantite);

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


    // PROMOTION

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
