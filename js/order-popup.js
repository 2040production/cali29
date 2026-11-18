
/* ==========================================
   ORDER POPUP - CALI29
   LIVRAISON > RÉCAPITULATIF > CONTACT
========================================== */

// CONFIGURATION DES CONTACTS

const ORDER_CONTACTS = {
    // whatsapp: "33600000000", // TEMPORAIREMENT DÉSACTIVÉ
    telegram: "brestdrive",
    signal: "https://signal.me/#eu/dpNJ7xgqOCOTjJOCXEovuih4RfIbpdbn7ZjRtp_UrMw7yRYkV0xP8I5YRehpa5_E"
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
   AJOUTER UNE LIGNE AU RÉCAPITULATIF
========================================== */

function ajouterLigneRecapitulatif(label, valeur, classe = "") {

    const ligne = document.createElement("div");
    ligne.className = "order-popup-item";

    if (classe) {
        ligne.classList.add(classe);
    }

    const nom = document.createElement("span");
    nom.className = "order-popup-item-name";
    nom.textContent = label;

    const prix = document.createElement("strong");
    prix.className = "order-popup-item-price";
    prix.textContent = valeur;

    ligne.append(nom, prix);

    orderItems.appendChild(ligne);

}


/* ==========================================
   AJOUTER UN TITRE DE SECTION
========================================== */

function ajouterTitreRecapitulatif(texte) {

    const titre = document.createElement("div");

    titre.className = "order-popup-delivery";
    titre.textContent = texte;

    orderItems.appendChild(titre);

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

    if (typeof calculerDetailsCommande !== "function") {

        console.error("Fonction calculerDetailsCommande introuvable.");

        return false;

    }

    // CALCULS CENTRALISÉS

    const details = calculerDetailsCommande(coordonneesLivraison);

    if (!details) {
        return false;
    }

    orderItems.innerHTML = "";


    // ARTICLES

    panier.forEach(article => {

        const sousTotal =
            Number(article.prix) * Number(article.quantite);

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


    // RÉCAPITULATIF FINANCIER

    ajouterTitreRecapitulatif("RÉCAPITULATIF");

    // Sous-total

    ajouterLigneRecapitulatif(
        "Sous-total produits",
        formatOrderPrice(details.sousTotal)
    );


    // Code promo

    if (details.codePromo) {

        if (details.promoValide) {

            ajouterLigneRecapitulatif(
                "Code promo (" + details.codePromo + ")",
                "-" + formatOrderPrice(details.montantReduction),
                "order-popup-promo"
            );

        } else {

            ajouterLigneRecapitulatif(
                "Code promo non applicable",
                details.codePromo,
                "order-popup-promo"
            );

            const messagePromo = document.createElement("p");

            messagePromo.className = "order-popup-promo-message";
            messagePromo.textContent = details.messagePromo;

            orderItems.appendChild(messagePromo);

        }

    }


    // Livraison

    const texteLivraison =
        details.fraisLivraison === 0
            ? "Gratuite"
            : formatOrderPrice(details.fraisLivraison);

    ajouterLigneRecapitulatif(
        "Livraison",
        texteLivraison
    );


    // TOTAL FINAL

    orderTotal.textContent = formatOrderPrice(details.total);


    // COORDONNÉES DE LIVRAISON

    if (coordonneesLivraison) {

        ajouterTitreRecapitulatif("COORDONNÉES DE LIVRAISON");

        const informations = [
            ["Adresse", coordonneesLivraison.adresse],
            ["Code postal", coordonneesLivraison.codePostal],
            ["Ville", coordonneesLivraison.ville]
        ];

        informations.forEach(([label, valeur]) => {

            ajouterLigneRecapitulatif(label, valeur);

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


    // WHATSAPP - TEMPORAIREMENT DÉSACTIVÉ

    /*
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
    */


    // TELEGRAM

    if (platform === "telegram") {

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

        const lienSignal = ORDER_CONTACTS.signal;

        if (!lienSignal || !lienSignal.startsWith("https://signal.me/")) {

            alert("Configure ton lien Signal dans order-popup.js.");

            return;

        }

        try {

            await copierMessageCommande(message);

            window.open(
                lienSignal,
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
