
/* ==========================================
   FICHE PRODUIT DYNAMIQUE - CALI29 V2
   Source des données : Supabase
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const catalogue = await window.cataloguePret;

        const parametres = new URLSearchParams(window.location.search);

        const idProduit = parametres.get("id");

        const produitSelectionne = catalogue.find(
            produit => String(produit.id) === String(idProduit)
        );


        /* ======================================
           ÉLÉMENTS HTML
        ====================================== */

        const videoProduit = document.getElementById("video-produit");

        const titreProduit = document.querySelector(".fiche-produit-titre");

        const prixProduit = document.querySelector(".fiche-produit-prix");

        const categorieProduit = document.querySelector(".fiche-produit-categorie");

        const descriptionProduit = document.querySelector(
            ".fiche-produit-description p"
        );

        const blocGrammage = document.getElementById("bloc-grammage");

        const selectGrammage = document.getElementById("grammage-produit");

        const infosTarifs = document.getElementById("infos-tarifs");

        const prixAuGramme = document.getElementById("prix-au-gramme");

        const prixTotalTarif = document.getElementById("prix-total-tarif");

        // Bloc économies supprimé de l'affichage


        /* ======================================
           PRODUIT INTROUVABLE
        ====================================== */

        if (!produitSelectionne) {

            const conteneur = document.querySelector(
                ".fiche-produit-container"
            );

            if (conteneur) {
                conteneur.innerHTML = `
                    <p>
                        Produit introuvable.
                        <a href="index.html">Retour à la boutique</a>
                    </p>
                `;
            }

            return;

        }


        /* ======================================
           INFORMATIONS PRODUIT
        ====================================== */

        document.title = produitSelectionne.nom + " | CALI29";

        if (titreProduit) {
            titreProduit.textContent = produitSelectionne.nom;
        }

        if (categorieProduit) {
            categorieProduit.textContent = produitSelectionne.categorie;
        }

        if (descriptionProduit) {
            descriptionProduit.textContent = produitSelectionne.description;
        }


        /* ======================================
           VIDÉO PRODUIT
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
           PRIX DÉGRESSIFS
        ====================================== */

        const tarifs = Array.isArray(produitSelectionne.tarifs)
            ? [...produitSelectionne.tarifs].sort(
                (a, b) => a.grammage - b.grammage
            )
            : [];

        const formaterPrix = prix =>
            Number(prix).toFixed(2).replace(".", ",") + " €";


        if (tarifs.length > 0 && selectGrammage) {

            if (blocGrammage) {
                blocGrammage.hidden = false;
            }

            if (infosTarifs) {
                infosTarifs.hidden = false;
            }

            selectGrammage.innerHTML = "";

            tarifs.forEach(tarif => {

                const option = document.createElement("option");

                option.value = tarif.grammage;

                option.textContent =
                    tarif.grammage + " g — " +
                    formaterPrix(tarif.prix);

                selectGrammage.appendChild(option);

            });


            /* ==================================
               ACTUALISER LE PRIX
            ================================== */

            function actualiserTarifs() {

                const tarifSelectionne = tarifs.find(
                    tarif =>
                        Number(tarif.grammage) ===
                        Number(selectGrammage.value)
                );

                if (!tarifSelectionne) return;

                const grammage = Number(tarifSelectionne.grammage);

                const prixTotal = Number(tarifSelectionne.prix);

                if (
                    !Number.isFinite(grammage) ||
                    !Number.isFinite(prixTotal) ||
                    grammage <= 0
                ) {
                    return;
                }

                const prixGramme = prixTotal / grammage;


                /* ==================================
                   AFFICHAGE DES PRIX
                ================================== */

                if (prixProduit) {
                    prixProduit.textContent = formaterPrix(prixTotal);
                }

                if (prixAuGramme) {
                    prixAuGramme.textContent =
                        formaterPrix(prixGramme) + "/g";
                }

                if (prixTotalTarif) {
                    prixTotalTarif.textContent = formaterPrix(prixTotal);
                }

            }


            actualiserTarifs();

            selectGrammage.addEventListener(
                "change",
                actualiserTarifs
            );

        } else {

            if (blocGrammage) {
                blocGrammage.hidden = true;
            }

            if (infosTarifs) {
                infosTarifs.hidden = true;
            }

            if (prixProduit) {
                prixProduit.textContent = formaterPrix(produitSelectionne.prix);
            }

        }

    } catch (erreur) {

        console.error("Erreur fiche produit :", erreur);

        const conteneur = document.querySelector(
            ".fiche-produit-container"
        );

        if (conteneur) {
            conteneur.innerHTML = `
                <p>
                    Impossible de charger ce produit.
                    Veuillez réessayer.
                </p>
            `;
        }

    }

});
