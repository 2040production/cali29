
/* ==========================================
   ADMIN CALI29
========================================== */


/* ==========================================
   RECUPERATION DES DONNEES
========================================== */

// Récupérer les produits enregistrés dans le navigateur
let catalogue = JSON.parse(
    localStorage.getItem("catalogueCali29")
) || [...produits];


/* ==========================================
   SAUVEGARDE
========================================== */

function sauvegarderCatalogue() {

    localStorage.setItem(
        "catalogueCali29",
        JSON.stringify(catalogue)
    );

}


/* ==========================================
   AFFICHER LES PRODUITS
========================================== */

function afficherProduits(listeProduits = catalogue) {

    const liste = document.getElementById("liste-produits");

    liste.innerHTML = "";

    listeProduits.forEach(produit => {

        const ligne = document.createElement("tr");

        const celluleNom = document.createElement("td");
        celluleNom.textContent = produit.nom;

        const celluleCategorie = document.createElement("td");
        celluleCategorie.textContent = produit.categorie;

        const cellulePrix = document.createElement("td");
        cellulePrix.textContent = produit.prix.toFixed(2) + " €";

        const celluleTarifs = document.createElement("td");

        celluleTarifs.textContent =
            produit.tarifs && produit.tarifs.length > 0
                ? produit.tarifs.length + " tarifs"
                : "Prix unique";

        const celluleActions = document.createElement("td");

        celluleActions.textContent = "Actions";

        ligne.append(
            celluleNom,
            celluleCategorie,
            cellulePrix,
            celluleTarifs,
            celluleActions
        );

        liste.appendChild(ligne);

    });

}


/* ==========================================
   STATISTIQUES
========================================== */

function actualiserStatistiques() {

    const nombreProduits = document.getElementById("nombre-produits");
    const nombreCategories = document.getElementById("nombre-categories");

    const categories = new Set(
        catalogue.map(produit => produit.categorie)
    );

    nombreProduits.textContent = catalogue.length;
    nombreCategories.textContent = categories.size;

}


/* ==========================================
   RECHERCHE
========================================== */

function rechercherProduit() {

    const recherche = document
        .getElementById("recherche-produit")
        .value
        .toLowerCase()
        .trim();

    const resultats = catalogue.filter(produit => {

        return (
            produit.nom.toLowerCase().includes(recherche) ||
            produit.categorie.toLowerCase().includes(recherche)
        );

    });

    afficherProduits(resultats);

}


/* ==========================================
   GESTION DU FORMULAIRE
========================================== */

function ouvrirFormulaire() {

    const formulaire = document.getElementById("formulaire-produit");

    formulaire.hidden = false;

    document.getElementById("titre-formulaire").textContent =
        "Ajouter un produit";

    document.getElementById("form-produit").reset();

    document.getElementById("produit-id").value = "";

    formulaire.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


function fermerFormulaire() {

    const formulaire = document.getElementById("formulaire-produit");

    formulaire.hidden = true;

    document.getElementById("form-produit").reset();

}


/* ==========================================
   AJOUTER UN PRODUIT
========================================== */

function ajouterProduit() {

    const nom = document.getElementById("nom-produit").value.trim();
    const categorie = document.getElementById("categorie-produit").value;
    const prix = Number(document.getElementById("prix-produit").value);
    const image = document.getElementById("image-produit").value.trim();
    const description = document.getElementById("description-produit").value.trim();

    // Vérification des informations
    if (!nom || !Number.isFinite(prix) || prix <= 0) {
        alert("Vérifie le nom et le prix du produit.");
        return;
    }

    // Création de l'identifiant
    const id = categorie.slice(0, -1) + "-" + Date.now();

    // Création du nouvel objet produit
    const nouveauProduit = {
        id: id,
        nom: nom,
        categorie: categorie,
        prix: prix,
        image: image,
        description: description,
        popularite: 0
    };

    // Ajouter le produit au catalogue
    catalogue.push(nouveauProduit);

    // Sauvegarder
    sauvegarderCatalogue();

    // Actualiser l'affichage
    afficherProduits();
    actualiserStatistiques();

    // Fermer le formulaire
    fermerFormulaire();

    alert("Produit ajouté au catalogue.");

}



/* ==========================================
   INITIALISATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Affichage initial
    afficherProduits();
    actualiserStatistiques();

    // Recherche
    document
        .getElementById("recherche-produit")
        .addEventListener("input", rechercherProduit);

    // Ouvrir le formulaire
    document
        .getElementById("bouton-ajouter")
        .addEventListener("click", ouvrirFormulaire);

    // Fermer le formulaire
    document
        .getElementById("bouton-fermer")
        .addEventListener("click", fermerFormulaire);

    document
        .getElementById("annuler-formulaire")
        .addEventListener("click", fermerFormulaire);

    // Enregistrer le produit
    document
        .getElementById("form-produit")
        .addEventListener("submit", event => {

            event.preventDefault();

            ajouterProduit();

        });

});