
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

const ecran = document.getElementById("ecran-acces");
const champ = document.getElementById("code-acces");
const bouton = document.getElementById("valider-acces");
const erreur = document.getElementById("message-erreur");

// ==========================================
// VÉRIFICATION DE LA SESSION
// ==========================================

if (sessionStorage.getItem("cali29_acces") === "autorise") {
    ecran.style.display = "none";
}

// ==========================================
// VÉRIFICATION DU CODE
// ==========================================

function verifierCode() {

    const codeSaisi = champ.value.trim();

    if (CODES_ACCES.includes(codeSaisi)) {

        // Enregistrer l'autorisation
        sessionStorage.setItem("cali29_acces", "autorise");

        // Masquer l'écran d'accès
        ecran.style.display = "none";

    } else {

        erreur.textContent = "Code incorrect.";
        champ.value = "";
        champ.focus();

    }

}

// ==========================================
// ÉVÉNEMENTS
// ==========================================

bouton.addEventListener("click", verifierCode);

champ.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        verifierCode();
    }

});
