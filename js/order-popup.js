
/* ==========================================
   ORDER POPUP - CALI29 V2
   LIVRAISON > RÉCAPITULATIF > CONTACT
   ENREGISTREMENT SUPABASE
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

const orderSuccess = document.getElementById("order-popup-success");
const orderSuccessReference = document.getElementById("order-success-reference");
const orderSuccessMessage = document.getElementById("order-success-message");
const orderSuccessClose = document.getElementById("order-success-close");
const orderFooter = document.getElementById("order-popup-footer");

let coordonneesLivraison = null;
let commandeEnCours = false;
let commandeEnregistree = null;


/* ==========================================
   FORMATAGE
========================================== */

function formatOrderPrice(price) {
    const montant = Number(price);

    if (!Number.isFinite(montant)) {
        return "0,00 €";
    }

    return montant.toFixed(2).replace(".", ",") + " €";
}


/* ==========================================
   RÉCAPITULATIF VISUEL
========================================== */

function ajouterLigneRecapitulatif(label, valeur, classe = "") {
    if (!orderItems) return;

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


function ajouterTitreRecapitulatif(texte) {
    if (!orderItems) return;

    const titre = document.createElement("div");
    titre.className = "order-popup-delivery";
    titre.textContent = texte;

    orderItems.appendChild(titre);
}


/* ==========================================
   AFFICHER LES ÉTAPES
========================================== */

function afficherEtapeLivraison() {
    if (!deliveryForm || !orderSummary || !orderOptions || !orderSuccess) {
        return;
    }

    deliveryForm.hidden = false;
    orderSummary.hidden = true;
    orderOptions.hidden = true;
    orderSuccess.hidden = true;

    if (orderFooter) {
        orderFooter.hidden = false;
    }

    if (orderDescription) {
        orderDescription.textContent =
            "Renseignez votre adresse pour préparer votre commande.";
    }

    document.getElementById("delivery-address")?.focus();
}


function afficherEtapeFinale() {
    if (!deliveryForm || !orderSummary || !orderOptions || !orderSuccess) {
        return;
    }

    deliveryForm.hidden = true;
    orderSummary.hidden = false;
    orderOptions.hidden = false;
    orderSuccess.hidden = true;

    if (orderDescription) {
        orderDescription.textContent =
            "Vérifiez votre commande et choisissez votre moyen de communication.";
    }

    orderPopup?.querySelector("[data-contact]")?.focus();
}


function afficherConfirmation(reference, platform, commandeEnregistreeDansCompte) {
    if (!deliveryForm || !orderSummary || !orderOptions || !orderSuccess) {
        return;
    }

    deliveryForm.hidden = true;
    orderSummary.hidden = true;
    orderOptions.hidden = true;
    orderSuccess.hidden = false;

    if (orderFooter) {
        orderFooter.hidden = true;
    }

    if (orderDescription) {
        orderDescription.textContent = "";
    }

    if (orderSuccessReference) {
        orderSuccessReference.textContent = reference
            ? "Référence : " + reference
            : "Commande préparée";
    }

    let message = "";

    if (commandeEnregistreeDansCompte) {
        message = "Votre commande a été enregistrée dans votre compte CALI29. ";
    } else {
        message = "Votre commande est préparée, mais elle n'est pas enregistrée dans un compte client. ";
    }

    if (platform === "signal") {
        message +=
            "Le récapitulatif a été copié. Ouvrez Signal, collez le message dans la conversation et appuyez sur Envoyer.";
    } else {
        message +=
            "Telegram a été ouvert avec votre récapitulatif préparé. Vérifiez le message puis appuyez sur Envoyer dans Telegram.";
    }

    if (orderSuccessMessage) {
        orderSuccessMessage.textContent = message;
    }

    orderSuccessClose?.focus();
}


/* ==========================================
   RÉCAPITULATIF DU PANIER
========================================== */

function afficherRecapitulatifPopup() {
    if (!Array.isArray(panier) || panier.length === 0) {
        return false;
    }

    if (!orderItems || !orderTotal) {
        console.error("Éléments du récapitulatif introuvables.");
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

        if (article.grammage !== null && article.grammage !== undefined) {
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

    if (Number(details.montantReductionOffres) > 0) {
        ajouterLigneRecapitulatif(
            "Offres spéciales",
            "-" + formatOrderPrice(details.montantReductionOffres),
            "order-popup-promo"
        );
    }

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
            messagePromo.textContent = details.messagePromo || "";

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
   CHARGER L'ADRESSE DU CLIENT CONNECTÉ
========================================== */

async function chargerAdresseClientConnecte() {
    const champAdresse = document.getElementById("delivery-address");
    const champCodePostal = document.getElementById("delivery-postcode");
    const champVille = document.getElementById("delivery-city");

    if (!champAdresse || !champCodePostal || !champVille) {
        return;
    }

    if (typeof supabaseClient === "undefined" || !supabaseClient?.auth) {
        return;
    }

    try {
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError) {
            console.warn("CALI29 - Lecture de session impossible :", sessionError);
            return;
        }

        const user = sessionData?.session?.user;

        if (!user) return;

        const { data: profil, error } = await supabaseClient
            .from("profiles")
            .select("delivery_address, postal_code, city")
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
            console.warn("CALI29 - Lecture de l'adresse impossible :", error);
            return;
        }

        if (!profil) return;

        champAdresse.value = profil.delivery_address || "";
        champCodePostal.value = profil.postal_code || "";
        champVille.value = profil.city || "";

    } catch (error) {
        console.warn("CALI29 - Préremplissage adresse :", error);
    }
}


/* ==========================================
   OUVRIR LA POPUP
========================================== */

async function ouvrirOrderPopup() {
    if (!orderPopup) return;

    if (!Array.isArray(panier) || panier.length === 0) {
        alert("Ton panier est vide.");
        return;
    }

    coordonneesLivraison = null;
    commandeEnregistree = null;
    commandeEnCours = false;

    const champAdresse = document.getElementById("delivery-address");
    const champCodePostal = document.getElementById("delivery-postcode");
    const champVille = document.getElementById("delivery-city");

    if (champAdresse) champAdresse.value = "";
    if (champCodePostal) champCodePostal.value = "";
    if (champVille) champVille.value = "";

    effacerErreurMinimum();
    afficherEtapeLivraison();

    orderPopup.classList.add("active");
    orderPopup.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    await chargerAdresseClientConnecte();
}


/* ==========================================
   FERMER LA POPUP
========================================== */

function fermerOrderPopup() {
    if (!orderPopup) return;

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
    const adresse = document.getElementById("delivery-address");
    const codePostal = document.getElementById("delivery-postcode");
    const ville = document.getElementById("delivery-city");

    return {
        adresse: adresse?.value.trim() || "",
        codePostal: codePostal?.value.trim() || "",
        ville: ville?.value.trim() || ""
    };
}


/* ==========================================
   GESTION DES ERREURS
========================================== */

function afficherErreurMinimum(message) {
    if (!deliveryForm) return;

    let erreur = document.getElementById("order-minimum-error");

    if (!erreur) {
        erreur = document.createElement("div");
        erreur.id = "order-minimum-error";
        erreur.className = "order-minimum-error";
        erreur.setAttribute("role", "alert");

        const bouton = deliveryForm.querySelector(".delivery-continue");

        if (bouton) {
            deliveryForm.insertBefore(erreur, bouton);
        } else {
            deliveryForm.appendChild(erreur);
        }
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

    if (!deliveryForm || !deliveryForm.reportValidity()) {
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

    if (!session?.access_token) {
        throw new Error("Session client invalide. Reconnecte-toi.");
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
   VERROUILLER LES BOUTONS
========================================== */

function verrouillerBoutonsContact(verrouille) {
    if (!orderPopup) return;

    orderPopup.querySelectorAll("[data-contact]").forEach(button => {
        button.disabled = verrouille;
    });
}


/* ==========================================
   CHOIX DU MOYEN DE CONTACT
========================================== */

async function envoyerCommande(platform) {
    if (commandeEnCours) return;

    if (!verifierMinimumAvantCommande()) {
        afficherEtapeLivraison();
        return;
    }

    const messageInitial = genererRecapitulatifCommande(
        coordonneesLivraison
    );

    if (!messageInitial) return;

    let fenetreContact = null;

    if (platform === "telegram") {
        fenetreContact = window.open("about:blank", "_blank");

        if (!fenetreContact) {
            alert(
                "Le navigateur a bloqué l'ouverture de Telegram. Autorise les fenêtres surgissantes puis réessaie."
            );
            return;
        }
    }

    commandeEnCours = true;
    verrouillerBoutonsContact(true);

    try {
        const session = await recupererSessionClient();

        let message = messageInitial;
        let referenceCommande = null;
        let commandeEnregistreeDansCompte = false;

        if (session?.user) {
            const resultat = await enregistrerCommandeServeur(session);

            referenceCommande =
                resultat.order?.order_number ||
                resultat.order?.reference ||
                resultat.order?.id ||
                null;

            commandeEnregistreeDansCompte = true;

            if (referenceCommande) {
                message += "\n\nRÉFÉRENCE CALI29 : " + referenceCommande;
            }
        }

        if (platform === "telegram") {
            const username = ORDER_CONTACTS.telegram.replace("@", "");

            if (!username) {
                throw new Error(
                    "Configure ton identifiant Telegram dans order-popup.js."
                );
            }

            const encodedMessage = encodeURIComponent(message);

            fenetreContact.location.href =
                "https://t.me/" + username + "?text=" + encodedMessage;

        } else if (platform === "signal") {
            const lienSignal = ORDER_CONTACTS.signal;

            if (!lienSignal || !lienSignal.startsWith("https://signal.me/")) {
                throw new Error(
                    "Configure ton lien Signal dans order-popup.js."
                );
            }

            await copierMessageCommande(message);

            window.open(lienSignal, "_blank");

        } else {
            throw new Error("Moyen de contact inconnu.");
        }

        afficherConfirmation(
            referenceCommande,
            platform,
            commandeEnregistreeDansCompte
        );

    } catch (error) {
        if (fenetreContact && !fenetreContact.closed) {
            fenetreContact.close();
        }

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
            orderPopup.classList.contains("active") &&
            orderSuccess?.hidden
        ) {
            fermerOrderPopup();
        }
    });

    orderPopup.querySelectorAll("[data-contact]").forEach(button => {
        button.addEventListener("click", () => {
            envoyerCommande(button.dataset.contact);
        });
    });

    if (orderSuccessClose) {
        orderSuccessClose.addEventListener("click", fermerOrderPopup);
    }
});
