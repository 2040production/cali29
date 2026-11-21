
/* ==========================================
   ORDER POPUP - CALI29
   LIVRAISON > RÉCAPITULATIF > CONTACT
   Enregistrement Supabase pour clients connectés
========================================== */

const ORDER_CONTACTS = {
    telegram: "brestdrive",
    signal: "https://signal.me/#eu/dpNJ7xgqOCOTjJOCXEovuih4RfIbpdbn7ZjRtp_UrMw7yRYkV0xP8I5YRehpa5_E"
};

const ORDER_FUNCTION = "enregistrer-commande";

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
let commandeEnCours = false;
let commandeEnregistree = null;

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

    document.getElementById("delivery-address")?.focus();
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

    orderPopup.querySelector("[data-contact]")?.focus();
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

    const details = calculerDetailsCommande(coordonneesLivraison);

    if (!details) {
        return false;
    }

    orderItems.innerHTML = "";

    details.articles.forEach(article => {
        const ligne = document.createElement("div");
        ligne.className = "order-popup-item";

        const nom = document.createElement("span");
        nom.className = "order-popup-item-name";

        let texteNom = article.nom;

        if (
            article.grammage !== null &&
            article.grammage !== undefined
        ) {
            texteNom += " — " + article.grammage + " g";
        }

        texteNom += " × " + article.quantite;
        nom.textContent = texteNom;

        const prix = document.createElement("strong");
        prix.className = "order-popup-item-price";
        prix.textContent = formatOrderPrice(article.sousTotal);

        ligne.append(nom, prix);
        orderItems.appendChild(ligne);
    });

    ajouterTitreRecapitulatif("RÉCAPITULATIF");

    ajouterLigneRecapitulatif(
        "Sous-total produits",
        formatOrderPrice(details.sousTotal)
    );

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

    const texteLivraison =
        details.fraisLivraison === 0
            ? "Gratuite"
            : formatOrderPrice(details.fraisLivraison);

    ajouterLigneRecapitulatif("Livraison", texteLivraison);

    orderTotal.textContent = formatOrderPrice(details.total);

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

    coordonneesLivraison = null;
    commandeEnregistree = null;
    commandeEnCours = false;

    effacerErreurMinimum();
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
   GESTION DES ERREURS DU FORMULAIRE
========================================== */

function afficherErreurMinimum(message) {
    let erreur = document.getElementById("order-minimum-error");

    if (!erreur) {
        erreur = document.createElement("div");
        erreur.id = "order-minimum-error";
        erreur.className = "order-minimum-error";
        erreur.setAttribute("role", "alert");

        const bouton = deliveryForm.querySelector(".delivery-continue");
        deliveryForm.insertBefore(erreur, bouton);
    }

    erreur.textContent = message;
    erreur.hidden = false;
}

function effacerErreurMinimum() {
    document.getElementById("order-minimum-error")?.remove();
}

/* ==========================================
   VÉRIFIER LE MINIMUM DE COMMANDE
========================================== */

function verifierMinimumAvantCommande() {
    if (!coordonneesLivraison || !coordonneesLivraison.ville) {
        afficherErreurMinimum("Renseigne ta ville de livraison.");
        return false;
    }

    if (typeof calculerDetailsCommande !== "function") {
        console.error("Fonction calculerDetailsCommande introuvable.");
        return false;
    }

    const details = calculerDetailsCommande(coordonneesLivraison);

    if (!details) {
        afficherErreurMinimum("Impossible de récupérer le panier.");
        return false;
    }

    if (details.commandeMinimumAtteint === false) {
        afficherErreurMinimum(
            "Minimum de commande non atteint.\n\n" +
            "Minimum requis : " +
            formatOrderPrice(details.minimumCommande) +
            "\nSous-total actuel : " +
            formatOrderPrice(details.sousTotal) +
            "\nMontant manquant : " +
            formatOrderPrice(details.montantManquant)
        );

        return false;
    }

    effacerErreurMinimum();
    return true;
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

    if (!verifierMinimumAvantCommande()) {
        return;
    }

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
   RÉCUPÉRER LA SESSION CLIENT
========================================== */

async function recupererSessionClient() {
    if (typeof supabaseClient === "undefined") {
        return null;
    }

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        throw new Error("Impossible de vérifier la connexion client.");
    }

    return data?.session || null;
}

/* ==========================================
   ENREGISTRER LA COMMANDE CÔTÉ SERVEUR
========================================== */

async function enregistrerCommandeServeur(session) {
    if (commandeEnregistree) {
        return commandeEnregistree;
    }

    const articles = panier.map(article => ({
        id: article.id,
        grammage: article.grammage ?? null,
        quantite: Number(article.quantite)
    }));

    const { data, error } = await supabaseClient.functions.invoke(
        ORDER_FUNCTION,
        {
            body: {
                items: articles,
                livraison: coordonneesLivraison,
                codePromo:
                    typeof codePromoActif !== "undefined"
                        ? codePromoActif
                        : ""
            },
            headers: {
                Authorization: "Bearer " + session.access_token
            }
        }
    );

    if (error) {
        let message = error.message || "Erreur lors de l'enregistrement.";

        if (error.context && typeof error.context.json === "function") {
            try {
                const body = await error.context.json();

                if (body?.error) {
                    message = body.error;
                }
            } catch (_) {}
        }

        throw new Error(message);
    }

    if (!data?.success) {
        throw new Error(
            data?.error || "L'enregistrement de la commande a échoué."
        );
    }

    commandeEnregistree = data;
    return data;
}

/* ==========================================
   VERROUILLER LES BOUTONS DE CONTACT
========================================== */

function verrouillerBoutonsContact(verrouille) {
    orderPopup.querySelectorAll("[data-contact]").forEach(button => {
        button.disabled = verrouille;
    });
}

/* ==========================================
   CHOIX DU MOYEN DE CONTACT
========================================== */

async function envoyerCommande(platform) {
    if (commandeEnCours) {
        return;
    }

    if (!verifierMinimumAvantCommande()) {
        afficherEtapeLivraison();
        return;
    }

    const messageInitial = genererRecapitulatifCommande(
        coordonneesLivraison
    );

    if (!messageInitial) {
        return;
    }

    let fenetreContact = null;

    // Ouvrir immédiatement une fenêtre pour éviter le blocage navigateur.
    fenetreContact = window.open("about:blank", "_blank");

    if (!fenetreContact) {
        alert("Le navigateur a bloqué l'ouverture de la fenêtre. Autorise les fenêtres surgissantes puis réessaie.");
        return;
    }

    commandeEnCours = true;
    verrouillerBoutonsContact(true);

    try {
        const session = await recupererSessionClient();
        let message = messageInitial;

        // Une commande n'est enregistrée que pour un client connecté.
        if (session?.user) {
            const resultat = await enregistrerCommandeServeur(session);

            const numeroCommande = resultat.order?.order_number;

            if (numeroCommande) {
                message += "\n\nRÉFÉRENCE CALI29 : " + numeroCommande;
            }
        }

        const encodedMessage = encodeURIComponent(message);

        if (platform === "telegram") {
            const username = ORDER_CONTACTS.telegram.replace("@", "");

            if (!username) {
                throw new Error("Configure ton identifiant Telegram dans order-popup.js.");
            }

            fenetreContact.location.href =
                "https://t.me/" + username + "?text=" + encodedMessage;

        } else if (platform === "signal") {
            const lienSignal = ORDER_CONTACTS.signal;

            if (!lienSignal || !lienSignal.startsWith("https://signal.me/")) {
                throw new Error("Configure ton lien Signal dans order-popup.js.");
            }

            await copierMessageCommande(message);
            fenetreContact.location.href = lienSignal;

            alert("Commande copiée. Colle le message dans Signal.");

        } else {
            throw new Error("Moyen de contact inconnu.");
        }

    } catch (error) {
        fenetreContact.close();

        console.error("CALI29 - Envoi commande :", error);

        alert(
            error.message ||
            "Impossible de préparer la commande. Réessaie."
        );

    } finally {
        commandeEnCours = false;
        verrouillerBoutonsContact(false);
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

    if (orderButton) {
        orderButton.addEventListener("click", ouvrirOrderPopup);
    }

    if (deliveryForm) {
        deliveryForm.addEventListener("submit", validerLivraison);
    }

    if (deliveryBack) {
        deliveryBack.addEventListener("click", retournerLivraison);
    }

    orderPopup.querySelectorAll("[data-close-popup]").forEach(element => {
        element.addEventListener("click", fermerOrderPopup);
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            orderPopup.classList.contains("active")
        ) {
            fermerOrderPopup();
        }
    });

    orderPopup.querySelectorAll("[data-contact]").forEach(button => {
        button.addEventListener("click", () => {
            envoyerCommande(button.dataset.contact);
        });
    });
});
