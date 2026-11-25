
/* ==========================================
   ACCÈS BOUTIQUE - CALI29 V2
   CONTRÔLE D'ACCÈS TEMPORAIRE
========================================== */

(() => {
    "use strict";

    /* ==========================================
       1. CODES AUTORISÉS
    ========================================== */

    const CODES_ACCES = [
        "nemesis777",
        "ZZ2.0TSI",
        "cali29-002",
        "cali29-003",
        "cali29-004",
        "cali29-005",
        "cali29-006",
        "cali29-007",
        "cali29-008",
        "cali29-009"
    ];

    const CLE_SESSION = "cali29_acces";
    const ACCES_AUTORISE = "autorise";

    /* ==========================================
       2. ÉLÉMENTS HTML
    ========================================== */

    const ecran = document.getElementById("ecran-acces");
    const champ = document.getElementById("code-acces");
    const bouton = document.getElementById("valider-acces");
    const erreur = document.getElementById("message-erreur");

    /* ==========================================
       3. VÉRIFIER LA SESSION
    ========================================== */

    function sessionAutorisee() {
        try {
            return sessionStorage.getItem(CLE_SESSION) === ACCES_AUTORISE;
        } catch (error) {
            console.error(
                "CALI29 - Impossible de vérifier la session :",
                error
            );

            return false;
        }
    }

    /* ==========================================
       4. ENREGISTRER LA SESSION
    ========================================== */

    function enregistrerSession() {
        try {
            sessionStorage.setItem(CLE_SESSION, ACCES_AUTORISE);
            return true;

        } catch (error) {
            console.error(
                "CALI29 - Impossible d'enregistrer la session :",
                error
            );

            return false;
        }
    }

    /* ==========================================
       5. GESTION DE L'ACCÈS AUX PAGES
    ========================================== */

    const autorise = sessionAutorisee();

    if (!autorise) {

        // Une page protégée sans écran de connexion
        // renvoie vers la page d'accueil.

        if (!ecran) {
            window.location.replace("index.html");
            return;
        }

    } else if (ecran) {

        // Une session déjà autorisée masque l'écran d'accès.

        ecran.style.display = "none";

    }

    /* ==========================================
       6. VÉRIFICATION DU CODE
    ========================================== */

    if (!ecran || !champ || !bouton || !erreur) {
        return;
    }

    function verifierCode() {

        const codeSaisi = champ.value.trim();

        erreur.textContent = "";

        if (!codeSaisi) {
            erreur.textContent = "Veuillez saisir votre code d'accès.";
            champ.focus();
            return;
        }

        if (CODES_ACCES.includes(codeSaisi)) {

            if (!enregistrerSession()) {

                erreur.textContent =
                    "Impossible d'enregistrer l'accès. Vérifiez les paramètres du navigateur.";

                return;
            }

            ecran.style.display = "none";

            return;
        }

        erreur.textContent = "Code incorrect.";

        champ.value = "";
        champ.focus();
    }

    /* ==========================================
       7. ÉVÉNEMENTS
    ========================================== */

    bouton.addEventListener("click", verifierCode);

    champ.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {
            event.preventDefault();
            verifierCode();
        }

    });

})();
