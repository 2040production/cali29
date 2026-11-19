
/* ==========================================
   ACCÈS BOUTIQUE - CALI29
========================================== */

// Liste des codes autorisés
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

const ecran = document.getElementById("ecran-acces");
const champ = document.getElementById("code-acces");
const bouton = document.getElementById("valider-acces");
const erreur = document.getElementById("message-erreur");

function sessionAutorisee() {
    try {
        return sessionStorage.getItem(CLE_SESSION) === ACCES_AUTORISE;
    } catch (erreurSession) {
        console.error("Impossible de vérifier la session :", erreurSession);
        return false;
    }
}

function enregistrerSession() {
    try {
        sessionStorage.setItem(CLE_SESSION, ACCES_AUTORISE);
        return true;
    } catch (erreurSession) {
        console.error("Impossible d'enregistrer la session :", erreurSession);
        return false;
    }
}

// Sans session autorisée, les autres pages redirigent vers l'accueil.
if (!sessionAutorisee()) {
    if (!ecran) {
        window.location.replace("index.html");
    }
} else if (ecran) {
    ecran.style.display = "none";
}

// L'écran de saisie existe uniquement sur l'accueil.
if (ecran && champ && bouton && erreur) {

    function verifierCode() {

        const codeSaisi = champ.value.trim();

        if (CODES_ACCES.includes(codeSaisi)) {

            if (!enregistrerSession()) {
                erreur.textContent =
                    "Impossible d'enregistrer l'accès. Vérifie les paramètres du navigateur.";
                return;
            }

            ecran.style.display = "none";

        } else {

            erreur.textContent = "Code incorrect.";
            champ.value = "";
            champ.focus();

        }

    }

    bouton.addEventListener("click", verifierCode);

    champ.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            event.preventDefault();
            verifierCode();
        }

    });

}
