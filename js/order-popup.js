
/* ==========================================
   ORDER POPUP - CALI29
   LIVRAISON > RÉCAPITULATIF > CONTACT
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

const deliveryForm = document.getElementById("delivery-form");
const deliveryBack = document.getElementById("delivery-back");

const orderSummary = document.getElementById("order-popup-summary");
const orderOptions = document.getElementById("order-popup-options");

const orderDescription = document.getElementById("order-popup-description");

let coordonneesLivraison = null;


/* ==========================================
   FORMATER LES PRIX
========================================== */

function formatOrderPrice(price) {
    return Number(price).toFixed(2).replace(".", ",") + " €";
}


/* ==========================================
   AFFICHER L'ÉTAPE LIVRAISON
========================================== */

function afficherEtapeLivraison() {

    deliveryForm.hidden = false;
    orderSummary.hidden = true;
    orderOptions.hidden = true;

    orderDescription.textContent =
        "Renseignez votre adresse pour préparer votre commande.";

    const premierChamp = document.getElementById("delivery-address");

    if (premierChamp) {
        premierChamp.focus();
    }

}


/* ==========================================
   AFFICHER L'ÉTAPE FINALE
========================================== */

function afficherEtapeFinale() {

    deliveryForm.hidden = true;
    orderSummary.hidden = false;
    orderOptions.hidden = false;

    orderDescription.textContent =
        "Vérifiez votre commande et choisissez votre moyen de communication.";

    const premierContact = orderPopup.querySelector("[data-contact]");

    if (premierContact) {
        premierContact.focus();
    }

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

        const sousTotal = Number(article.prix) * Number(article.quantite);

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


    // ADRESSE DE LIVRAISON

    if (coordonneesLivraison) {

        const titreLivraison = document.createElement("div");

        titreLivraison.className = "order-popup-delivery";
        titreLivraison.textContent = "COORDONNÉES DE LIVRAISON";

        orderItems.appendChild(titreLivraison);

        const informations = [
            ["Adresse", coordonneesLivraison.adresse],
            ["Code postal", coordonneesLivraison.codePostal],
            ["Ville", coordonneesLivraison.ville]
        ];

        informations.forEach(([label, valeur]) => {

            const ligne = document.createElement("div");

            ligne.className = "order-popup-item";

            const nom = document.createElement("span");

            nom.className = "order-popup-item-name";
            nom.textContent = label;

            const contenu = document.createElement("strong");

            contenu.className = "order-popup-item-price";
            contenu.textContent = valeur;

            ligne.append(nom, contenu);

            orderItems.appendChild(ligne);

        });

    }

    return true;

}


/* ==========================================
   OUVRIR LA POPUP
========================================== */

function ouvrirOrderPopup() {

    if (!Array.isArray(panier) || panier.length === 0) {

        alert("Ton panier est vide.");
        return;

    }

    afficherEtapeLivraison();

    orderPopup.classList.add("active");

    orderPopup.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

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
   RÉCUPÉRER L'ADRESSE
========================================== */

function recupererCoordonneesLivraison() {

    return {

        adresse: document.getElementById("delivery-address").value.trim(),

        codePostal: document.getElementById("delivery-postcode").value.trim(),

        ville: document.getElementById("delivery-city").value.trim()

    };

}


/* ==========================================
   VALIDER LA LIVRAISON
========================================== */

function validerLivraison(event) {

    event.preventDefault();

    if (!deliveryForm.reportValidity()) {
        return;
    }

    coordonneesLivraison = recupererCoordonneesLivraison();

    if (!afficherRecapitulatifPopup()) {

        alert("Impossible de récupérer le panier. Vérifie son contenu.");

        return;

    }

    afficherEtapeFinale();

}


/* ==========================================
   RETOUR AUX COORDONNÉES
========================================== */

function retournerLivraison() {

    afficherEtapeLivraison();

}


/* ==========================================
   COPIER LE MESSAGE POUR SIGNAL
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

    const message = genererRecapitulatifCommande(
        coordonneesLivraison
    );

    if (!message) {
        return;
    }

    const encodedMessage = encodeURIComponent(message);


    // WHATSAPP

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


    // TELEGRAM

    else if (platform === "telegram") {

        const username = ORDER_CONTACTS.telegram.replace("@", "");

        if (!username) {

            alert("Configure ton identifiant Telegram dans order-popup.js.");

            return;

        }

        window.open(
            "https://t.me/" + username + "?text=" + encodedMessage,
            "_blank"
        );

    }


    // SIGNAL

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

    if (!orderPopup) {

        console.error("Popup de commande introuvable dans panier.html.");

        return;

    }


    // OUVERTURE

    if (orderButton) {

        orderButton.addEventListener("click", ouvrirOrderPopup);

    }


    // VALIDATION LIVRAISON

    if (deliveryForm) {

        deliveryForm.addEventListener("submit", validerLivraison);

    }


    // RETOUR

    if (deliveryBack) {

        deliveryBack.addEventListener("click", retournerLivraison);

    }


    // FERMETURE

    orderPopup.querySelectorAll("[data-close-popup]").forEach(element => {

        element.addEventListener("click", fermerOrderPopup);

    });


    // TOUCHE ÉCHAP

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            orderPopup.classList.contains("active")
        ) {

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
