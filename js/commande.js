
/* ==========================================
   COMMANDE CALI29 - TELEGRAM
========================================== */

// Identifiant Telegram
const TELEGRAM_USERNAME = "brestdrive";


/* ==========================================
   FORMATER LES PRIX
========================================== */

function formaterPrix(prix) {
    return prix.toFixed(2).replace(".", ",") + " €";
}


/* ==========================================
   CRÉER LE RÉCAPITULATIF
========================================== */

function genererRecapitulatifCommande() {

    if (typeof panier === "undefined" || panier.length === 0) {
        alert("Ton panier est vide.");
        return null;
    }

    let total = 0;

    let message = "Bonjour, je souhaite passer commande chez CALI29.\n\n";
    message += "🛒 MA COMMANDE\n\n";

 panier.forEach(article => {

    const prixLigne = article.prix * article.quantite;

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
    message += "TOTAL : " + formaterPrix(total) + "\n\n";
    message += "Merci de me confirmer la disponibilité et les modalités de commande.";

    return message;
}


/* ==========================================
   OUVRIR TELEGRAM
========================================== */

function ouvrirTelegram() {

    if (
        !TELEGRAM_USERNAME ||
        TELEGRAM_USERNAME === "TON_IDENTIFIANT_TELEGRAM"
    ) {
        alert("Configure d'abord ton identifiant Telegram dans commande.js.");
        return;
    }

    const message = genererRecapitulatifCommande();

    if (!message) return;

    const username = TELEGRAM_USERNAME.replace("@", "");

    const lienTelegram =
        "https://t.me/" + username +
        "?text=" + encodeURIComponent(message);

    window.open(lienTelegram, "_blank");

}


/* ==========================================
   INITIALISATION DES BOUTONS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Le bouton commander-panier est géré par order-popup.js.

    // Bouton de commande sur les autres pages
    const boutonCommande =
        document.getElementById("commander");

    if (boutonCommande) {
        boutonCommande.addEventListener("click", ouvrirTelegram);
    }

});
