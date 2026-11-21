
/* ==========================================
   CALI29 V2 - AUTHENTIFICATION CLIENT
   Inscription / Connexion / Session / Profil
   Historique des commandes
========================================== */

(() => {
    "use strict";

    const INSCRIPTION_FUNCTION = "auth-pseudo";
    const CONNEXION_FUNCTION = "connexion-pseudo";

    const $ = (selector) => document.querySelector(selector);

    const modal = $("#compte-modal");
    const openDesktop = $("#ouvrir-compte");
    const openMobile = $("#ouvrir-compte-mobile");
    const labelCompte = $("#libelle-compte");
    const authViews = $("#compte-auth-vues");
    const connectedView = $("#compte-connecte");
    const formLogin = $("#form-connexion");
    const formSignup = $("#form-inscription");
    const message = $("#compte-message");
    const title = $("#compte-titre");
    const description = $("#compte-description");

    if (!modal || !window.supabase || typeof supabaseClient === "undefined") {
        console.error("CALI29 Auth : éléments ou client Supabase introuvables.");
        return;
    }

    /* ==========================================
       MESSAGES
    ========================================== */

    function afficherMessage(texte, succes = false) {
        message.textContent = texte || "";
        message.classList.toggle("succes", succes);
    }

    /* ==========================================
       MODALE
    ========================================== */

    function ouvrirModal() {
        modal.hidden = false;
        document.body.classList.add("compte-modal-ouvert");
        afficherMessage("");
    }

    function fermerModal() {
        modal.hidden = true;
        document.body.classList.remove("compte-modal-ouvert");
    }

    function changerVue(vue) {
        const inscription = vue === "inscription";

        formLogin.hidden = inscription;
        formSignup.hidden = !inscription;

        document.querySelectorAll(".compte-onglet").forEach((button) => {
            button.classList.toggle("actif", button.dataset.vue === vue);
        });

        title.textContent = inscription ? "Créer mon compte" : "Mon compte";

        description.textContent = inscription
            ? "Choisissez un pseudo et un mot de passe."
            : "Connectez-vous avec votre pseudo et votre mot de passe.";

        afficherMessage("");
    }

    function verrouillerFormulaire(form, verrouille, texteBouton) {
        const bouton = form.querySelector('button[type="submit"]');

        bouton.disabled = verrouille;

        if (texteBouton) {
            bouton.textContent = texteBouton;
        }
    }

    /* ==========================================
       PROFIL CLIENT
    ========================================== */

    async function chargerProfil(user) {
        const { data, error } = await supabaseClient
            .from("profiles")
            .select("id, pseudo, first_name, last_name, phone, delivery_address, postal_code, city")
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
            console.error("CALI29 Auth - lecture profil :", error);
            return null;
        }

        return data;
    }

    function afficherProfil(profil, user) {
        const pseudo =
            profil?.pseudo ||
            user?.user_metadata?.pseudo ||
            "Client";

        labelCompte.textContent = pseudo;

        $("#compte-pseudo-connecte").textContent = pseudo;
        $("#compte-prenom").textContent = profil?.first_name || "Non renseigné";
        $("#compte-nom").textContent = profil?.last_name || "Non renseigné";
        $("#compte-telephone").textContent = profil?.phone || "Non renseigné";
        $("#compte-ville").textContent = profil?.city || "Non renseignée";

        authViews.hidden = true;
        connectedView.hidden = false;

        title.textContent = "Mon espace client";
        description.textContent = "Votre session est active.";
    }

    /* ==========================================
       HISTORIQUE DES COMMANDES
    ========================================== */

    function preparerHistorique() {
        let historique = $("#historique-commandes");

        if (historique) {
            return historique;
        }

        historique = document.createElement("section");
        historique.id = "historique-commandes";
        historique.className = "historique-commandes";

        historique.innerHTML = `
            <div class="historique-entete">
                <div>
                    <span class="historique-surtitre">VOTRE ACTIVITÉ</span>
                    <h3>Mes commandes</h3>
                </div>
                <span id="historique-compteur">0</span>
            </div>

            <div id="historique-liste">
                <p class="historique-chargement">
                    Chargement de vos commandes...
                </p>
            </div>
        `;

        const boutonDeconnexion = $("#bouton-deconnexion");

        connectedView.insertBefore(historique, boutonDeconnexion);

        return historique;
    }

    function formaterPrix(montant) {
        return Number(montant || 0).toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR"
        });
    }

    function formaterDate(date) {
        if (!date) return "Date inconnue";

        return new Date(date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    function traduireStatut(statut) {
        const statuts = {
            pending: "En attente",
            confirmed: "Confirmée",
            preparing: "En préparation",
            ready: "Prête",
            delivering: "En livraison",
            completed: "Terminée",
            cancelled: "Annulée"
        };

        return statuts[statut] || statut || "Inconnue";
    }

    function afficherCommandes(commandes) {
        const liste = $("#historique-liste");
        const compteur = $("#historique-compteur");

        compteur.textContent = commandes.length;

        if (!commandes.length) {
            liste.innerHTML = `
                <div class="historique-vide">
                    <span>—</span>
                    <p>Vous n'avez pas encore de commande.</p>
                    <a href="index.html">Découvrir la boutique</a>
                </div>
            `;
            return;
        }

        liste.innerHTML = "";

        commandes.forEach((commande) => {
            const carte = document.createElement("article");
            carte.className = "historique-carte";

            const entete = document.createElement("div");
            entete.className = "historique-carte-entete";

            const numero = document.createElement("strong");
            numero.textContent = commande.order_number || "Commande CALI29";

            const statut = document.createElement("span");
            statut.className = "historique-statut";
            statut.textContent = traduireStatut(commande.status);

            entete.append(numero, statut);

            const details = document.createElement("div");
            details.className = "historique-carte-details";

            const date = document.createElement("span");
            date.textContent = formaterDate(commande.created_at);

            const total = document.createElement("strong");
            total.textContent = formaterPrix(commande.total);

            details.append(date, total);

            carte.append(entete, details);
            liste.appendChild(carte);
        });
    }

    async function chargerHistorique(user) {
        const historique = preparerHistorique();
        const liste = historique.querySelector("#historique-liste");

        liste.innerHTML = `
            <p class="historique-chargement">
                Chargement de vos commandes...
            </p>
        `;

        const { data, error } = await supabaseClient
            .from("orders")
            .select("id, order_number, status, total, created_at")
            .eq("customer_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("CALI29 - Erreur historique :", error);

            liste.innerHTML = `
                <p class="historique-erreur">
                    Impossible de charger vos commandes.
                </p>
            `;

            return;
        }

        afficherCommandes(data || []);
    }

    /* ==========================================
       ACTUALISATION DU COMPTE
    ========================================== */

    async function actualiserEtatCompte() {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
            console.error("CALI29 Auth - session :", error.message);
        }

        const session = data?.session;

        if (!session?.user) {
            labelCompte.textContent = "Mon compte";

            authViews.hidden = false;
            connectedView.hidden = true;

            changerVue("connexion");

            return;
        }

        const profil = await chargerProfil(session.user);

        afficherProfil(profil, session.user);

        await chargerHistorique(session.user);
    }

    /* ==========================================
       APPELS EDGE FUNCTIONS
    ========================================== */

    async function appelerFonction(nom, donnees) {
        const { data, error } = await supabaseClient.functions.invoke(nom, {
            body: donnees
        });

        if (error) {
            let detail = error.message || "Erreur de communication avec le serveur.";

            if (error.context && typeof error.context.json === "function") {
                try {
                    const body = await error.context.json();

                    if (body?.error) {
                        detail = body.error;
                    }
                } catch (_) {}
            }

            throw new Error(detail);
        }

        if (!data?.success) {
            throw new Error(data?.error || "L'opération n'a pas abouti.");
        }

        return data;
    }

    /* ==========================================
       CONNEXION
    ========================================== */

    async function connecter(pseudo, password) {
        const resultat = await appelerFonction(CONNEXION_FUNCTION, {
            pseudo,
            password
        });

        const { access_token, refresh_token } = resultat.session || {};

        if (!access_token || !refresh_token) {
            throw new Error("La session reçue est incomplète.");
        }

        const { error } = await supabaseClient.auth.setSession({
            access_token,
            refresh_token
        });

        if (error) throw error;

        await actualiserEtatCompte();
    }

    /* ==========================================
       OUVERTURE DU COMPTE
    ========================================== */

    openDesktop?.addEventListener("click", async () => {
        await actualiserEtatCompte();
        ouvrirModal();
    });

    openMobile?.addEventListener("click", async () => {
        const menu = $("#menu-mobile");

        if (menu) {
            menu.hidden = true;
        }

        const burger = $("#menu-burger");

        burger?.setAttribute("aria-expanded", "false");

        await actualiserEtatCompte();
        ouvrirModal();
    });

    modal.querySelectorAll("[data-fermer-compte]").forEach((element) => {
        element.addEventListener("click", fermerModal);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) {
            fermerModal();
        }
    });

    /* ==========================================
       ONGLETS
    ========================================== */

    document.querySelectorAll(".compte-onglet").forEach((button) => {
        button.addEventListener("click", () => {
            changerVue(button.dataset.vue);
        });
    });

    /* ==========================================
       FORMULAIRE CONNEXION
    ========================================== */

    formLogin.addEventListener("submit", async (event) => {
        event.preventDefault();

        afficherMessage("");

        verrouillerFormulaire(formLogin, true, "Connexion...");

        const pseudo = $("#connexion-pseudo").value.trim();
        const password = $("#connexion-motdepasse").value;

        try {
            await connecter(pseudo, password);

            afficherMessage("Connexion réussie.", true);

            formLogin.reset();

        } catch (error) {
            afficherMessage(error.message || "Connexion impossible.");

        } finally {
            verrouillerFormulaire(formLogin, false, "Se connecter");
        }
    });

    /* ==========================================
       FORMULAIRE INSCRIPTION
    ========================================== */

    formSignup.addEventListener("submit", async (event) => {
        event.preventDefault();

        afficherMessage("");

        const pseudo = $("#inscription-pseudo").value.trim();
        const password = $("#inscription-motdepasse").value;
        const confirmation = $("#inscription-confirmation").value;

        if (password !== confirmation) {
            afficherMessage("Les deux mots de passe ne correspondent pas.");
            return;
        }

        verrouillerFormulaire(formSignup, true, "Création...");

        try {
            await appelerFonction(INSCRIPTION_FUNCTION, {
                pseudo,
                password
            });

            await connecter(pseudo, password);

            afficherMessage("Compte créé et connexion réussie.", true);

            formSignup.reset();

        } catch (error) {
            afficherMessage(error.message || "Création du compte impossible.");

        } finally {
            verrouillerFormulaire(formSignup, false, "Créer mon compte");
        }
    });

    /* ==========================================
       DÉCONNEXION
    ========================================== */

    $("#bouton-deconnexion").addEventListener("click", async () => {
        const bouton = $("#bouton-deconnexion");

        bouton.disabled = true;

        const { error } = await supabaseClient.auth.signOut();

        bouton.disabled = false;

        if (error) {
            afficherMessage("Déconnexion impossible : " + error.message);
            return;
        }

        afficherMessage("Vous êtes déconnecté.", true);

        await actualiserEtatCompte();
    });

    /* ==========================================
       ÉCOUTE DE LA SESSION
    ========================================== */

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            labelCompte.textContent = "Mon compte";
            authViews.hidden = false;
            connectedView.hidden = true;
        }
    });

    /* ==========================================
       INITIALISATION
    ========================================== */

    actualiserEtatCompte();

})();
