
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

// Éléments tarifaires
const infosTarifs = document.getElementById("infos-tarifs");
const prixAuGramme = document.getElementById("prix-au-gramme");
const prixTotalTarif = document.getElementById("prix-total-tarif");

const blocEconomie = document.getElementById("bloc-economie");
const economieRealisee = document.getElementById("economie-realisee");
const pourcentageEconomie = document.getElementById("pourcentage-economie");

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

        // Afficher le sélecteur et les informations tarifaires
        blocGrammage.hidden = false;
        infosTarifs.hidden = false;

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

        // ==========================================
        // ACTUALISER LES INFORMATIONS TARIFAIRES
        // ==========================================

        const actualiserTarifs = () => {

            const tarifSelectionne = produitSelectionne.tarifs.find(
                tarif => tarif.grammage === Number(selectGrammage.value)
            );

            if (!tarifSelectionne) return;

            const grammage = Number(tarifSelectionne.grammage);
            const prixTotal = Number(tarifSelectionne.prix);

            // Éviter les divisions invalides
            if (grammage <= 0 || prixTotal < 0) return;

            // Prix au gramme
            const prixGramme = prixTotal / grammage;

            // Prix de référence sans dégressivité
            const prixReference = Number(produitSelectionne.prix) * grammage;

            // Économie réalisée
            const economie = prixReference - prixTotal;

            // Pourcentage de réduction
            const pourcentage = prixReference > 0
                ? (economie / prixReference) * 100
                : 0;

            // ==========================================
            // AFFICHAGE DES PRIX
            // ==========================================

            prixProduit.textContent =
                formaterPrixFicheProduit(prixTotal);

            prixAuGramme.textContent =
                formaterPrixFicheProduit(prixGramme) + "/g";

            prixTotalTarif.textContent =
                formaterPrixFicheProduit(prixTotal);

            // ==========================================
            // AFFICHAGE DE L'ÉCONOMIE
            // ==========================================

            if (economie > 0.005 && pourcentage > 0) {

                blocEconomie.hidden = false;

                economieRealisee.textContent =
                    formaterPrixFicheProduit(economie);

                pourcentageEconomie.textContent =
                    "-" + pourcentage.toFixed(1).replace(".", ",") + " %";

            } else {

                blocEconomie.hidden = true;

            }

        };

        // Afficher les tarifs initiaux
        actualiserTarifs();

        // Actualiser lors du changement de grammage
        selectGrammage.addEventListener("change", actualiserTarifs);

    } else {

        // ==========================================
        // PRODUIT SANS TARIF DÉGRESSIF
        // ==========================================

        blocGrammage.hidden = true;
        infosTarifs.hidden = true;

        prixProduit.textContent =
            formaterPrixFicheProduit(produitSelectionne.prix);

    }

} else {

    // ==========================================
    // PRODUIT INTROUVABLE
    // ==========================================

    document.querySelector(".fiche-produit-container").innerHTML =
        "<p>Produit introuvable. Retournez au catalogue.</p>";

}
