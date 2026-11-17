
const CODE_ACCES = "anneso";

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

    if (champ.value === CODE_ACCES) {

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
