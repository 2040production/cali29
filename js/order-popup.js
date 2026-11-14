
/* ==========================================
   ORDER POPUP - CALI29
========================================== */

// CONFIGURATION DES CONTACTS
const ORDER_CONTACTS = {
    whatsapp: "33600000000",
    telegram: "brestdrive",
    signal: "+33600000000"
};


/* ==========================================
   ÉLÉMENTS HTML
========================================== */

const orderPopup = document.getElementById("order-popup");

const orderItems = document.getElementById("order-popup-items");

const orderTotal = document.getElementById("order-popup-total");

const orderButton = document.getElementById("commander-panier");


/* ==========================================
   FORMATER LES PRIX
========================================== */

function formatOrderPrice(price) {

    return Number(price).toFixed(2).replace(".", ",") + " €";

}


/* ==========================================
   GÉNÉRER LE RÉCAPITULATIF VISUEL
========================================== */

function afficherRecapitulatifPopup() {

    if (!Array.isArray(panier) || panier.length === 0) {
        return false;
    }

    orderItems.innerHTML = "";

    let total = 0;

    panier.forEach(article => {

        const sousTotal = article.prix * article.quantite;

        total += sousTotal;

        const ligne = document.createElement("div");

        ligne.className = "order-popup-item";

        const nom = document.createElement("span");

        nom.className = "order-popup-item-name";

        nom.textContent = article.nom + " × " + article.quantite;

        const prix = document.createElement("strong");

        prix.className = "order-popup-item-price";

        prix.textContent = formatOrderPrice(sousTotal);

        ligne.append(nom, prix);

        orderItems.appendChild(ligne);

    });

    orderTotal.textContent = formatOrderPrice(total);

    return true;

}


/* ==========================================
   OUVRIR LA POPUP
========================================== */

function ouvrirOrderPopup() {

    if (!afficherRecapitulatifPopup()) {

        alert("Ton panier est vide.");

        return;

    }

    orderPopup.classList.add("active");

    orderPopup.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    orderPopup.querySelector(".order-popup-close").focus();

}


/* ==========================================
   FERMER LA POPUP
========================================== */

function fermerOrderPopup() {

    orderPopup.classList.remove("active");

    orderPopup.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    if (orderButton) {
        orderButton.focus();
    }

}


/* ==========================================
   COPIER LE MESSAGE
========================================== */

async function copierMessageCommande(message) {

    if (navigator.clipboard && window.isSecureContext) {

        await navigator.clipboard.writeText(message);

        return true;

    }

    const textarea = document.createElement("textarea");

    textarea.value = message;

    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    const resultat = document.execCommand("copy");

    textarea.remove();

    if (!resultat) {
        throw new Error("Copie impossible");
    }

    return true;

}


/* ==========================================
   CHOIX DU MOYEN DE CONTACT
========================================== */

async function envoyerCommande(platform) {

    // Utilise le générateur existant dans commande.js
    const message = genererRecapitulatifCommande();

    if (!message) return;

    const encodedMessage = encodeURIComponent(message);

    if (platform === "whatsapp") {

        const numero = ORDER_CONTACTS.whatsapp;

        if (!/^\d+$/.test(numero) || numero === "33600000000") {
            alert("Configure ton numéro WhatsApp dans order-popup.js.");
            return;
        }

        window.open(
            "https://wa.me/" + numero + "?text=" + encodedMessage,
            "_blank"
        );

    }

    else if (platform === "telegram") {

        const username = ORDER_CONTACTS.telegram.replace("@", "");

        window.open(
            "https://t.me/" + username + "?text=" + encodedMessage,
            "_blank"
        );

    }

    else if (platform === "signal") {

        const numero = ORDER_CONTACTS.signal;

        if (!/^\+\d{8,15}$/.test(numero) || numero === "+33600000000") {
            alert("Configure ton numéro Signal dans order-popup.js.");
            return;
        }

        try {

            await copierMessageCommande(message);

            window.open(
                "https://signal.me/#p/" + encodeURIComponent(numero),
                "_blank"
            );

            alert("Commande copiée. Colle le message dans Signal.");

        } catch (error) {

            alert("Impossible de copier le message. Vérifie les autorisations du navigateur.");

        }

    }

}


/* ==========================================
   INITIALISATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // OUVERTURE
    if (orderButton) {

        orderButton.addEventListener("click", ouvrirOrderPopup);

    }

    // FERMETURE
    orderPopup.querySelectorAll("[data-close-popup]").forEach(element => {

        element.addEventListener("click", fermerOrderPopup);

    });

    // TOUCHE ÉCHAP
    document.addEventListener("keydown", event => {

        if (event.key === "Escape" && orderPopup.classList.contains("active")) {

            fermerOrderPopup();

        }

    });

    // CONTACTS
    orderPopup.querySelectorAll("[data-contact]").forEach(button => {

        button.addEventListener("click", () => {

            envoyerCommande(button.dataset.contact);

        });

    });

});
