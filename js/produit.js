
/* ==========================================
   FICHE PRODUIT DYNAMIQUE - CALI29
   Catalogue synchronisé avec localStorage
========================================== */


/* ==========================================
   1. RÉCUPÉRER LE CATALOGUE
========================================== */

function recupererCatalogueFiche() {

    try {

        const donnees = localStorage.getItem("catalogueCali29");

        if (donnees !== null) {

            const catalogueSauvegarde = JSON.parse(donnees);

            if (Array.isArray(catalogueSauvegarde)) {
                return catalogueSauvegarde;
            }

        }

    } catch (erreur) {

        console.error("Erreur de récupération du catalogue :", erreur);

    }

    return [...produits];

}


/* ==========================================
   2. RÉCUPÉRER LE PRODUIT
========================================== */

// Récupérer l'identifiant dans l'URL

const parametres = new URLSearchParams(window.location.search);

const idProduit = parametres.get("id");

// Charger le catalogue actualisé

const catalogueFiche = recupererCatalogueFiche();

// Rechercher le produit

const produitSelectionne = catalogueFiche.find(
    produit => produit.id === idProduit
);


/* ==========================================
   3. RÉCUPÉRER LES ÉLÉMENTS HTML
========================================== */

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


/* ==========================================
   4. FORMATER LES PRIX
========================================== */

const formaterPrixFicheProduit = prix => {

    return Number(prix).toFixed(2).replace(".", ",") + " €";

};


/* ==========================================
   5. AFFICHER LE PRODUIT
========================================== */

if (produitSelectionne) {

    document.title = produitSelectionne.nom + " | CALI29";


    /* ======================================
       INFORMATIONS TEXTUELLES
    ====================================== */

    if (titreProduit) {
        titreProduit.textContent = produitSelectionne.nom;
    }

    if (categorieProduit) {
        categorieProduit.textContent = produitSelectionne.categorie;
    }

    if (descriptionProduit) {
        descriptionProduit.textContent = produitSelectionne.description || "";
    }


    /* ======================================
       AFFICHAGE DE LA VIDÉO
    ====================================== */

    if (videoProduit) {

        if (produitSelectionne.video) {

            videoProduit.src = produitSelectionne.video;

            videoProduit.hidden = false;

            videoProduit.load();

        } else {

            videoProduit.pause();

            videoProduit.removeAttribute("src");

            videoProduit.hidden = true;

        }

    }


    /* ======================================
       6. PRIX DÉGRESSIFS
    ====================================== */

    const tarifs = Array.isArray(produitSelectionne.tarifs)
        ? [...produitSelectionne.tarifs].sort(
            (a, b) => a.grammage - b.grammage
        )
        : [];


    if (tarifs.length > 0 && selectGrammage) {

        // Afficher les blocs tarifaires

        if (blocGrammage) {
            blocGrammage.hidden = false;
        }

        if (infosTarifs) {
            infosTarifs.hidden = false;
        }

        // Réinitialiser les options

        selectGrammage.innerHTML = "";


        /* ==================================
           GÉNÉRER LES OPTIONS
        ================================== */

        tarifs.forEach(tarif => {

            const option = document.createElement("option");

            option.value = tarif.grammage;

            option.textContent =
                tarif.grammage + " g — " +
                formaterPrixFicheProduit(tarif.prix);

            selectGrammage.appendChild(option);

        });


        /* ==================================
           7. ACTUALISER LES TARIFS
        ================================== */

        const actualiserTarifs = () => {

            const tarifSelectionne = tarifs.find(
                tarif =>
                    Number(tarif.grammage) === Number(selectGrammage.value)
            );

            if (!tarifSelectionne) return;

            const grammage = Number(tarifSelectionne.grammage);

            const prixTotal = Number(tarifSelectionne.prix);

            if (
                !Number.isFinite(grammage) ||
                !Number.isFinite(prixTotal) ||
                grammage <= 0 ||
                prixTotal < 0
            ) {
                return;
            }


            // Prix au gramme

            const prixGramme = prixTotal / grammage;


            // Prix de référence

            const prixReference =
                Number(produitSelectionne.prix) * grammage;


            // Économie réalisée

            const economie = prixReference - prixTotal;


            // Pourcentage de réduction

            const pourcentage = prixReference > 0
                ? (economie / prixReference) * 100
                : 0;


            /* ==================================
               AFFICHAGE DES PRIX
            ================================== */

            if (prixProduit) {

                prixProduit.textContent =
                    formaterPrixFicheProduit(prixTotal);

            }

            if (prixAuGramme) {

                prixAuGramme.textContent =
                    formaterPrixFicheProduit(prixGramme) + "/g";

            }

            if (prixTotalTarif) {

                prixTotalTarif.textContent =
                    formaterPrixFicheProduit(prixTotal);

            }


            /* ==================================
               AFFICHAGE DES ÉCONOMIES
            ================================== */

            if (economie > 0.005 && pourcentage > 0) {

                if (blocEconomie) {
                    blocEconomie.hidden = false;
                }

                if (economieRealisee) {

                    economieRealisee.textContent =
                        formaterPrixFicheProduit(economie);

                }

                if (pourcentageEconomie) {

                    pourcentageEconomie.textContent =
                        "-" + pourcentage.toFixed(1).replace(".", ",") + " %";

                }

            } else {

                if (blocEconomie) {
                    blocEconomie.hidden = true;
                }

            }

        };


        // Affichage initial

        actualiserTarifs();


        // Changement de grammage

        selectGrammage.addEventListener(
            "change",
            actualiserTarifs
        );

    } else {


        /* ==================================
           8. PRODUIT SANS TARIF DÉGRESSIF
        ================================== */

        if (blocGrammage) {
            blocGrammage.hidden = true;
        }

        if (infosTarifs) {
            infosTarifs.hidden = true;
        }

        if (blocEconomie) {
            blocEconomie.hidden = true;
        }

        if (prixProduit) {

            prixProduit.textContent =
                formaterPrixFicheProduit(produitSelectionne.prix);

        }

    }


} else {


    /* ==========================================
       9. PRODUIT INTROUVABLE
    ========================================== */

    const conteneur = document.querySelector(
        ".fiche-produit-container"
    );

    if (conteneur) {

        conteneur.innerHTML =
            "<p>Produit introuvable. Retournez au catalogue.</p>";

    }

}
