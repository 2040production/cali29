
/* ==========================================
   CALI29 V2 - AUTHENTIFICATION CLIENT
   Inscription / Connexion / Session / Profil
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

    function afficherMessage(texte, succes = false) {
        message.textContent = texte || "";
        message.classList.toggle("succes", succes);
    }

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

    async function chargerProfil(user) {
        const { data, error } = await supabaseClient
            .from("profiles")
            .select("id, pseudo, first_name, last_name, phone, delivery_address, postal_code, city")
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
            console.error("CALI29 Auth - lecture profil :", error.message);
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
    }

    async function appelerFonction(nom, donnees) {
        const { data, error } = await supabaseClient.functions.invoke(nom, {
            body: donnees
        });

        if (error) {
            let detail =
                error.message ||
                "Erreur de communication avec le serveur.";

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
            throw new Error(
                data?.error || "L'opération n'a pas abouti."
            );
        }

        return data;
    }

    async function connecter(pseudo, password) {
        const resultat = await appelerFonction(
            CONNEXION_FUNCTION,
            { pseudo, password }
        );

        const { access_token, refresh_token } = resultat.session || {};

        if (!access_token || !refresh_token) {
            throw new Error("La session reçue est incomplète.");
        }

        const { error } = await supabaseClient.auth.setSession({
            access_token,
            refresh_token
        });

        if (error) {
            throw error;
        }

        await actualiserEtatCompte();
    }

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

    document.querySelectorAll(".compte-onglet").forEach((button) => {
        button.addEventListener("click", () => {
            changerVue(button.dataset.vue);
        });
    });

    formLogin.addEventListener("submit", async (event) => {
        event.preventDefault();

        afficherMessage("");

        verrouillerFormulaire(
            formLogin,
            true,
            "Connexion..."
        );

        const pseudo = $("#connexion-pseudo").value.trim();
        const password = $("#connexion-motdepasse").value;

        try {
            await connecter(pseudo, password);

            afficherMessage("Connexion réussie.", true);

            formLogin.reset();

        } catch (error) {
            afficherMessage(
                error.message || "Connexion impossible."
            );

        } finally {
            verrouillerFormulaire(
                formLogin,
                false,
                "Se connecter"
            );
        }
    });

    formSignup.addEventListener("submit", async (event) => {
        event.preventDefault();

        afficherMessage("");

        const pseudo = $("#inscription-pseudo").value.trim();
        const password = $("#inscription-motdepasse").value;
        const confirmation = $("#inscription-confirmation").value;

        if (password !== confirmation) {
            afficherMessage(
                "Les deux mots de passe ne correspondent pas."
            );
            return;
        }

        verrouillerFormulaire(
            formSignup,
            true,
            "Création..."
        );

        try {
            await appelerFonction(
                INSCRIPTION_FUNCTION,
                { pseudo, password }
            );

            await connecter(pseudo, password);

            afficherMessage(
                "Compte créé et connexion réussie.",
                true
            );

            formSignup.reset();

        } catch (error) {
            afficherMessage(
                error.message || "Création du compte impossible."
            );

        } finally {
            verrouillerFormulaire(
                formSignup,
                false,
                "Créer mon compte"
            );
        }
    });

    $("#bouton-deconnexion").addEventListener("click", async () => {
        const bouton = $("#bouton-deconnexion");

        bouton.disabled = true;

        const { error } = await supabaseClient.auth.signOut();

        bouton.disabled = false;

        if (error) {
            afficherMessage(
                "Déconnexion impossible : " + error.message
            );
            return;
        }

        afficherMessage("Vous êtes déconnecté.", true);

        await actualiserEtatCompte();
    });

    supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            labelCompte.textContent = "Mon compte";
            authViews.hidden = false;
            connectedView.hidden = true;
        }
    });

    actualiserEtatCompte();

})();
