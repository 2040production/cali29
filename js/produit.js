
/* ==========================================
   FICHE PRODUIT DYNAMIQUE - CALI29
========================================== */

// Récupérer l'identifiant dans l'URL
const parametres = new URLSearchParams(window.location.search);
const idProduit = parametres.get("id");

// Rechercher le produit dans le catalogue
const produitSelectionne = produits.find(
    produit => produit.id === idProduit
);

// Récupérer les éléments HTML
const videoProduit = document.getElementById("video-produit");

const titreProduit = document.querySelector(".fiche-produit-titre");
const prixProduit = document.querySelector(".fiche-produit-prix");
const categorieProduit = document.querySelector(".fiche-produit-categorie");
const descriptionProduit = document.querySelector(".fiche-produit-description p");

const blocGrammage = document.getElementById("bloc-grammage");
const selectGrammage = document.getElementById("grammage-produit");

// Formater les prix en euros
const formaterPrixFicheProduit = prix => {
    return Number(prix).toFixed(2).replace(".", ",") + " €";
};

// Afficher les informations du produit
if (produitSelectionne) {

    document.title = produitSelectionne.nom + " | CALI29";

    // ==========================================
    // AFFICHAGE DE LA VIDÉO
    // ==========================================

    if (videoProduit && produitSelectionne.video) {

        videoProduit.src = produitSelectionne.video;
        videoProduit.hidden = false;
        videoProduit.load();

    } else if (videoProduit) {

        videoProduit.pause();
        videoProduit.removeAttribute("src");
        videoProduit.hidden = true;

    }

    // ==========================================
    // INFORMATIONS TEXTUELLES
    // ==========================================

    titreProduit.textContent = produitSelectionne.nom;
    categorieProduit.textContent = produitSelectionne.categorie;
    descriptionProduit.textContent = produitSelectionne.description;

    // ==========================================
    // PRIX DÉGRESSIFS
    // ==========================================

    if (produitSelectionne.tarifs && produitSelectionne.tarifs.length > 0) {

        // Afficher le sélecteur de grammage
        blocGrammage.hidden = false;

        // Réinitialiser les options
        selectGrammage.innerHTML = "";

        // Générer les options automatiquement
        produitSelectionne.tarifs.forEach(tarif => {

            const option = document.createElement("option");

            option.value = tarif.grammage;

            option.textContent =
                tarif.grammage + " g — " +
                formaterPrixFicheProduit(tarif.prix);

            selectGrammage.appendChild(option);

        });

        // Afficher le prix du premier grammage
        prixProduit.textContent = formaterPrixFicheProduit(
            produitSelectionne.tarifs[0].prix
        );

        // Actualiser le prix lorsque le grammage change
        selectGrammage.addEventListener("change", () => {

            const tarifSelectionne = produitSelectionne.tarifs.find(
                tarif => tarif.grammage === Number(selectGrammage.value)
            );

            if (tarifSelectionne) {

                prixProduit.textContent =
                    formaterPrixFicheProduit(tarifSelectionne.prix);

            }

        });

    } else {

        // Produit sans tarif dégressif
        blocGrammage.hidden = true;

        prixProduit.textContent =
            formaterPrixFicheProduit(produitSelectionne.prix);

    }

} else {

    document.querySelector(".fiche-produit-container").innerHTML =
        "<p>Produit introuvable. Retournez au catalogue.</p>";

}
