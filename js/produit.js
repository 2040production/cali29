
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
const imageProduit = document.getElementById("image-produit-principale");
const titreProduit = document.querySelector(".fiche-produit-titre");
const prixProduit = document.querySelector(".fiche-produit-prix");
const categorieProduit = document.querySelector(".fiche-produit-categorie");
const descriptionProduit = document.querySelector(".fiche-produit-description p");

// Afficher les informations
if (produitSelectionne) {

    document.title = produitSelectionne.nom + " | CALI29";

    imageProduit.src = produitSelectionne.image;
    imageProduit.alt = produitSelectionne.nom;

    titreProduit.textContent = produitSelectionne.nom;

    prixProduit.textContent = produitSelectionne.prix.toFixed(2) + " €";

    categorieProduit.textContent = produitSelectionne.categorie;

    descriptionProduit.textContent = produitSelectionne.description;

} else {

    document.querySelector(".fiche-produit-container").innerHTML =
        "<p>Produit introuvable. Retournez au catalogue.</p>";

}

