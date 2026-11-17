
/* ==========================================
   COMMANDE CALI29
   GÉNÉRATION DU MESSAGE
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
   CRÉER LE RÉCAPITULATIF
========================================== */

function genererRecapitulatifCommande(livraison = null) {

    if (typeof panier === "undefined" || !Array.isArray(panier) || panier.length === 0) {
        alert("Ton panier est vide.");
        return null;
    }

    let total = 0;

    let message = "Bonjour, je souhaite passer commande chez CALI29.\n\n";
    message += "MA COMMANDE\n\n";

    panier.forEach(article => {

        const prixLigne = Number(article.prix) * Number(article.quantite);

        total += prixLigne;

        message += "• " + article.nom + "\n";

        if (article.grammage !== null && article.grammage !== undefined) {
            message += "  Grammage : " + article.grammage + " g\n";
        }

        message +=
            "  Quantité : " + article.quantite + "\n" +
            "  Prix unitaire : " + formaterPrix(article.prix) + "\n" +
            "  Sous-total : " + formaterPrix(prixLigne) + "\n\n";

    });

    message += "--------------------------\n";
    message += "TOTAL : " + formaterPrix(total) + "\n";


    // COORDONNÉES DE LIVRAISON

    if (livraison) {

        message += "\nADRESSE DE LIVRAISON\n\n";

        message += "Adresse : " + livraison.adresse + "\n";
        message += "Code postal : " + livraison.codePostal + "\n";
        message += "Ville : " + livraison.ville + "\n";

    }

    message += "\nMerci de me confirmer la disponibilité et les modalités de commande.";

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
