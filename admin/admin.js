
/* ==========================================
   ADMIN CALI29
   GESTION DU CATALOGUE - CRUD
========================================== */


/* ==========================================
   1. RÉCUPÉRATION DES DONNÉES
========================================== */

const CLE_CATALOGUE = "catalogueCali29";
const VERSION_CATALOGUE = 4;

function chargerCatalogue() {

    try {

        const donnees = localStorage.getItem(CLE_CATALOGUE);

        if (donnees === null) {

            localStorage.setItem(
                CLE_CATALOGUE,
                JSON.stringify(produits)
            );

            localStorage.setItem(
                "catalogueCali29Version",
                VERSION_CATALOGUE
            );

            return [...produits];

        }

        const catalogueSauvegarde = JSON.parse(donnees);

        if (!Array.isArray(catalogueSauvegarde)) {
            throw new Error("Catalogue invalide.");
        }

        const versionStockee = Number(
            localStorage.getItem("catalogueCali29Version") || 0
        );

        if (versionStockee < VERSION_CATALOGUE) {

            const catalogueFusionne = new Map();

            produits.forEach(produit => {
                catalogueFusionne.set(produit.id, { ...produit });
            });

            catalogueSauvegarde.forEach(produit => {

                if (!produit.id) return;

                catalogueFusionne.set(produit.id, {
                    ...(catalogueFusionne.get(produit.id) || {}),
                    ...produit
                });

            });

            const nouveauCatalogue = [
                ...catalogueFusionne.values()
            ];

            localStorage.setItem(
                CLE_CATALOGUE,
                JSON.stringify(nouveauCatalogue)
            );

            localStorage.setItem(
                "catalogueCali29Version",
                VERSION_CATALOGUE
            );

            return nouveauCatalogue;

        }

        return catalogueSauvegarde;

    } catch (erreur) {

        console.error("Erreur de lecture :", erreur);

        return [...produits];

    }

}

let catalogue = chargerCatalogue();


/* ==========================================
   2. SAUVEGARDE DU CATALOGUE
========================================== */

function sauvegarderCatalogue() {

    try {

        if (!Array.isArray(catalogue)) {
            throw new Error("Le catalogue à sauvegarder est invalide.");
        }

        localStorage.setItem(
            CLE_CATALOGUE,
            JSON.stringify(catalogue)
        );

        localStorage.setItem(
            "catalogueCali29Version",
            String(VERSION_CATALOGUE)
        );

        return true;

    } catch (erreur) {

        console.error("Erreur de sauvegarde du catalogue :", erreur);

        alert(
            "Impossible d'enregistrer le catalogue. " +
            "Vérifie les paramètres de stockage de ton navigateur."
        );

        return false;

    }

}


/* ==========================================
   3. AFFICHAGE DES PRODUITS
========================================== */

function afficherProduits(listeProduits = catalogue) {

    const liste = document.getElementById("liste-produits");

    if (!liste) return;

    liste.innerHTML = "";

    if (listeProduits.length === 0) {

        const ligne = document.createElement("tr");
        const cellule = document.createElement("td");

        cellule.colSpan = 5;
        cellule.textContent = "Aucun produit trouvé.";

        ligne.appendChild(cellule);
        liste.appendChild(ligne);

        return;

    }

    listeProduits.forEach(produit => {

        const ligne = document.createElement("tr");

        // Nom
        const celluleNom = document.createElement("td");
        celluleNom.textContent = produit.nom;

        // Catégorie
        const celluleCategorie = document.createElement("td");
        celluleCategorie.textContent = produit.categorie;

        // Prix
        const cellulePrix = document.createElement("td");
        cellulePrix.textContent =
            Number(produit.prix).toFixed(2) + " €";

        // Tarifs
        const celluleTarifs = document.createElement("td");

        celluleTarifs.textContent =
            produit.tarifs && produit.tarifs.length
                ? produit.tarifs.length + " tarifs"
                : "Prix unique";

        // Actions
        const celluleActions = document.createElement("td");

        const boutonModifier = document.createElement("button");

        boutonModifier.type = "button";
        boutonModifier.textContent = "Modifier";
        boutonModifier.className = "btn-modifier";
        boutonModifier.dataset.id = produit.id;

        const boutonSupprimer = document.createElement("button");

        boutonSupprimer.type = "button";
        boutonSupprimer.textContent = "Supprimer";
        boutonSupprimer.className = "btn-supprimer";
        boutonSupprimer.dataset.id = produit.id;

        celluleActions.append(
            boutonModifier,
            boutonSupprimer
        );

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
   4. STATISTIQUES
========================================== */

function actualiserStatistiques() {

    const nombreProduits =
        document.getElementById("nombre-produits");

    const nombreCategories =
        document.getElementById("nombre-categories");

    const categories = new Set(
        catalogue.map(produit => produit.categorie)
    );

    if (nombreProduits) {
        nombreProduits.textContent = catalogue.length;
    }

    if (nombreCategories) {
        nombreCategories.textContent = categories.size;
    }

}


/* ==========================================
   5. RECHERCHE
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
   6. GESTION DU FORMULAIRE
========================================== */

function ouvrirFormulaire() {

    const formulaire =
        document.getElementById("formulaire-produit");

    const form = document.getElementById("form-produit");

    form.reset();

    document.getElementById("produit-id").value = "";

    document.getElementById("titre-formulaire").textContent =
        "Ajouter un produit";

    // Réinitialiser les tarifs
    document.getElementById("lignes-tarifs").innerHTML = "";

    document.getElementById("liste-tarifs").hidden = true;

    formulaire.hidden = false;

    formulaire.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


function fermerFormulaire() {

    const formulaire =
        document.getElementById("formulaire-produit");

    formulaire.hidden = true;

    document.getElementById("form-produit").reset();

    document.getElementById("produit-id").value = "";

    document.getElementById("lignes-tarifs").innerHTML = "";

    document.getElementById("liste-tarifs").hidden = true;

}


/* ==========================================
   7. GESTION DES TARIFS DÉGRESSIFS
========================================== */

// Ajouter une ligne de tarif

function ajouterLigneTarif(grammage = "", prix = "") {

    const conteneur =
        document.getElementById("lignes-tarifs");

    const ligne = document.createElement("div");

    ligne.className = "ligne-tarif";

    const champGrammage = document.createElement("input");

    champGrammage.type = "number";
    champGrammage.className = "tarif-grammage";
    champGrammage.placeholder = "Grammage";
    champGrammage.min = "0.01";
    champGrammage.step = "any";
    champGrammage.value = grammage;
    champGrammage.required = true;

    const champPrix = document.createElement("input");

    champPrix.type = "number";
    champPrix.className = "tarif-prix";
    champPrix.placeholder = "Prix (€)";
    champPrix.min = "0.01";
    champPrix.step = "0.01";
    champPrix.value = prix;
    champPrix.required = true;

    const boutonSupprimer = document.createElement("button");

    boutonSupprimer.type = "button";
    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.className = "supprimer-tarif";

    boutonSupprimer.addEventListener("click", () => {

        ligne.remove();

    });

    ligne.append(
        champGrammage,
        champPrix,
        boutonSupprimer
    );

    conteneur.appendChild(ligne);

}


// Afficher ou masquer les tarifs

function gererAffichageTarifs() {

    const checkbox =
        document.getElementById("activer-tarifs");

    const liste =
        document.getElementById("liste-tarifs");

    liste.hidden = !checkbox.checked;

}


// Récupérer les tarifs du formulaire

function recupererTarifs() {

    const checkbox =
        document.getElementById("activer-tarifs");

    if (!checkbox.checked) {
        return [];
    }

    const lignes = document.querySelectorAll(".ligne-tarif");

    if (lignes.length === 0) {

        alert("Ajoute au moins un tarif dégressif.");

        return null;

    }

    const tarifs = [];

    for (const ligne of lignes) {

        const grammage = Number(
            ligne.querySelector(".tarif-grammage").value
        );

        const prix = Number(
            ligne.querySelector(".tarif-prix").value
        );

        if (
            !Number.isFinite(grammage) ||
            grammage <= 0 ||
            !Number.isFinite(prix) ||
            prix <= 0
        ) {

            alert("Vérifie les grammages et les prix.");

            return null;

        }

        tarifs.push({
            grammage: grammage,
            prix: prix
        });

    }

    tarifs.sort((a, b) => a.grammage - b.grammage);

    return tarifs;

}


/* ==========================================
   8. RÉCUPÉRATION DU FORMULAIRE
========================================== */

function recupererDonneesFormulaire() {

    return {

        nom: document
            .getElementById("nom-produit")
            .value
            .trim(),

        categorie: document
            .getElementById("categorie-produit")
            .value,

        prix: Number(
            document.getElementById("prix-produit").value
        ),

        image: document
            .getElementById("image-produit")
            .value
            .trim(),

        description: document
            .getElementById("description-produit")
            .value
            .trim(),

        tarifs: recupererTarifs()

    };

}


/* ==========================================
   9. VALIDATION
========================================== */

function produitValide(produit) {

    if (!produit.nom) {

        alert("Le nom du produit est obligatoire.");

        return false;

    }

    if (!produit.categorie) {

        alert("Choisis une catégorie.");

        return false;

    }

    if (!Number.isFinite(produit.prix) || produit.prix <= 0) {

        alert("Le prix doit être supérieur à zéro.");

        return false;

    }

    if (produit.tarifs === null) {
        return false;
    }

    return true;

}


/* ==========================================
   10. CRÉER UN PRODUIT
========================================== */

function ajouterProduit() {

    const donnees = recupererDonneesFormulaire();

    if (!produitValide(donnees)) return;

    const prefixes = {
        fleurs: "fleur",
        resines: "resine",
        accessoires: "accessoire"
    };

    const prefixe = prefixes[donnees.categorie] || "produit";

    const id = prefixe + "-" + Date.now();

    const nouveauProduit = {

        id: id,

        nom: donnees.nom,

        categorie: donnees.categorie,

        prix: donnees.prix,

        tarifs: donnees.tarifs,

        image: donnees.image,

        video: "",

        description: donnees.description,

        popularite: 0

    };

    catalogue.push(nouveauProduit);

    if (!sauvegarderCatalogue()) {

        catalogue.pop();

        return;

    }

    actualiserAffichage();

    fermerFormulaire();

    alert("Produit ajouté au catalogue.");

}


/* ==========================================
   11. MODIFIER UN PRODUIT
========================================== */

function modifierProduit(id) {

    const produit = catalogue.find(
        item => item.id === id
    );

    if (!produit) {

        alert("Produit introuvable.");

        return;

    }

    const formulaire =
        document.getElementById("formulaire-produit");

    formulaire.hidden = false;

    document.getElementById("titre-formulaire").textContent =
        "Modifier un produit";

    document.getElementById("produit-id").value = produit.id;

    document.getElementById("nom-produit").value =
        produit.nom;

    document.getElementById("categorie-produit").value =
        produit.categorie;

    document.getElementById("prix-produit").value =
        produit.prix;

    document.getElementById("image-produit").value =
        produit.image || "";

    document.getElementById("description-produit").value =
        produit.description || "";

    // Restaurer les tarifs
    const tarifs = produit.tarifs || [];

    const checkbox =
        document.getElementById("activer-tarifs");

    const liste =
        document.getElementById("liste-tarifs");

    const conteneur =
        document.getElementById("lignes-tarifs");

    conteneur.innerHTML = "";

    checkbox.checked = tarifs.length > 0;

    liste.hidden = tarifs.length === 0;

    tarifs.forEach(tarif => {

        ajouterLigneTarif(
            tarif.grammage,
            tarif.prix
        );

    });

    formulaire.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* ==========================================
   12. ENREGISTRER UNE MODIFICATION
========================================== */

function enregistrerModification(id) {

    const index = catalogue.findIndex(
        produit => produit.id === id
    );

    if (index === -1) {

        alert("Produit introuvable.");

        return;

    }

    const donnees = recupererDonneesFormulaire();

    if (!produitValide(donnees)) return;

    const ancienProduit = catalogue[index];

    const produitModifie = {

        ...ancienProduit,

        nom: donnees.nom,

        categorie: donnees.categorie,

        prix: donnees.prix,

        tarifs: donnees.tarifs,

        image: donnees.image,

        description: donnees.description

    };

    catalogue[index] = produitModifie;

    if (!sauvegarderCatalogue()) {

        catalogue[index] = ancienProduit;

        return;

    }

    actualiserAffichage();

    fermerFormulaire();

    alert("Produit modifié avec succès.");

}


/* ==========================================
   13. SUPPRIMER UN PRODUIT
========================================== */

function supprimerProduit(id) {

    const index = catalogue.findIndex(
        produit => produit.id === id
    );

    if (index === -1) {

        alert("Produit introuvable.");

        return;

    }

    const produit = catalogue[index];

    const confirmation = confirm(
        `Voulez-vous vraiment supprimer "${produit.nom}" ?`
    );

    if (!confirmation) return;

    catalogue.splice(index, 1);

    if (!sauvegarderCatalogue()) {

        catalogue.splice(index, 0, produit);

        return;

    }

    actualiserAffichage();

    alert("Produit supprimé.");

}


/* ==========================================
   14. ACTUALISER L'AFFICHAGE
========================================== */

function actualiserAffichage() {

    afficherProduits();

    actualiserStatistiques();

}


/* ==========================================
   15. INITIALISATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Affichage initial
    actualiserAffichage();

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

    // Annuler
    document
        .getElementById("annuler-formulaire")
        .addEventListener("click", fermerFormulaire);

    // Activer les tarifs
    document
        .getElementById("activer-tarifs")
        .addEventListener("change", gererAffichageTarifs);

    // Ajouter un grammage
    document
        .getElementById("ajouter-tarif")
        .addEventListener("click", () => {

            ajouterLigneTarif();

        });

    // Soumission du formulaire
    document
        .getElementById("form-produit")
        .addEventListener("submit", event => {

            event.preventDefault();

            const id =
                document.getElementById("produit-id").value;

            if (id) {

                enregistrerModification(id);

            } else {

                ajouterProduit();

            }

        });

    // Actions sur les produits
    document
        .getElementById("liste-produits")
        .addEventListener("click", event => {

            const bouton = event.target.closest("button");

            if (!bouton) return;

            const id = bouton.dataset.id;

            if (bouton.classList.contains("btn-modifier")) {

                modifierProduit(id);

            }

            if (bouton.classList.contains("btn-supprimer")) {

                supprimerProduit(id);

            }

        });

});
