
/* ==========================================
   COMMANDE CALI29 V2
   CALCUL ET GÉNÉRATION DU MESSAGE
========================================== */

const TELEGRAM_USERNAME = "brestdrive";


/* ==========================================
   FORMATER LES PRIX
========================================== */

function formaterPrix(prix) {
    const montant = Number(prix);

    if (!Number.isFinite(montant)) {
        return "0,00 €";
    }

    return montant.toFixed(2).replace(".", ",") + " €";
}


/* ==========================================
   NORMALISER LE NOM DE LA VILLE
========================================== */

function normaliserVilleCommande(ville) {
    return String(ville || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


/* ==========================================
   OBTENIR LE PRIX D'UN ARTICLE
   TARIFS STANDARDS SUPABASE
========================================== */

function obtenirPrixArticleCommande(article) {
    const catalogue = Array.isArray(window.produits)
        ? window.produits
        : [];

    const produit = catalogue.find(
        p => String(p.id) === String(article.id)
    );

    if (!produit) {
        return Number(article.prix) || 0;
    }

    if (article.grammage !== null && article.grammage !== undefined) {
        const tarif = produit.tarifs?.find(
            t => Number(t.grammage) === Number(article.grammage)
        );

        if (tarif) {
            return Number(tarif.prix);
        }
    }

    return Number(produit.prix) || Number(article.prix) || 0;
}


/* ==========================================
   PRÉPARER LES ARTICLES DE COMMANDE
========================================== */

function obtenirArticlesCommande() {
    if (!Array.isArray(panier)) {
        return [];
    }

    return panier
        .filter(article =>
            article &&
            article.id !== undefined &&
            article.id !== null
        )
        .map(article => {
            const prix = obtenirPrixArticleCommande(article);
            const quantite = Math.floor(Number(article.quantite));

            if (
                !Number.isFinite(prix) ||
                prix < 0 ||
                !Number.isFinite(quantite) ||
                quantite <= 0
            ) {
                return null;
            }

            return {
                ...article,
                prix,
                quantite,
                sousTotal: prix * quantite
            };
        })
        .filter(Boolean);
}


/* ==========================================
   MINIMUM DE COMMANDE
========================================== */

function obtenirMinimumCommande(livraison) {
    if (!livraison || !livraison.ville) {
        return null;
    }

    const ville = normaliserVilleCommande(livraison.ville);

    if (ville === "brest") {
        return 30;
    }

    return null;
}


/* ==========================================
   VÉRIFIER LE MINIMUM
========================================== */

function verifierMinimumCommande(livraison, sousTotal) {
    const minimum = obtenirMinimumCommande(livraison);
    const montant = Number(sousTotal) || 0;

    if (minimum === null) {
        return {
            valide: true,
            minimum: null,
            sousTotal: montant,
            montantManquant: 0
        };
    }

    const montantManquant = Math.max(0, minimum - montant);

    return {
        valide: montant >= minimum,
        minimum,
        sousTotal: montant,
        montantManquant
    };
}


/* ==========================================
   FRAIS DE LIVRAISON
========================================== */

function calculerFraisLivraison(livraison) {
    if (!livraison || !livraison.ville) {
        return 0;
    }

    const ville = normaliserVilleCommande(livraison.ville);

    return ville === "brest" ? 0 : 10;
}


/* ==========================================
   CALCULER LES TOTAUX
========================================== */

function calculerDetailsCommande(livraison = null) {
    if (
        typeof panier === "undefined" ||
        !Array.isArray(panier) ||
        panier.length === 0
    ) {
        return null;
    }

    const articles = obtenirArticlesCommande();

    if (articles.length === 0) {
        return null;
    }

    const sousTotal = articles.reduce(
        (total, article) => total + article.sousTotal,
        0
    );

    /* MINIMUM DE COMMANDE */

    const verificationMinimum = livraison && livraison.ville
        ? verifierMinimumCommande(livraison, sousTotal)
        : null;


    /* OFFRES SPÉCIALES */

    const resultatOffres = (
        typeof calculerOffresSpeciales === "function" &&
        livraison &&
        livraison.ville
    )
        ? calculerOffresSpeciales(articles, livraison.ville)
        : {
            montantReduction: 0,
            offresAppliquees: [],
            detailsArticles: []
        };

    const montantReductionOffres = Math.min(
        sousTotal,
        Math.max(0, Number(resultatOffres.montantReduction) || 0)
    );


    /* ARTICLES APRÈS OFFRES */

    const detailsOffres = Array.isArray(resultatOffres.detailsArticles)
        ? resultatOffres.detailsArticles
        : [];

    const articlesApresOffres = articles.map(article => {
        const reductionsArticle = detailsOffres
            .filter(detail =>
                String(detail.produitId) === String(article.id) &&
                Number(detail.grammage) === Number(article.grammage)
            )
            .reduce(
                (total, detail) =>
                    total + Math.max(0, Number(detail.montantReduction) || 0),
                0
            );

        const reductionUnitaire = article.quantite > 0
            ? reductionsArticle / article.quantite
            : 0;

        const prixApresOffre = Math.max(
            0,
            article.prix - reductionUnitaire
        );

        return {
            ...article,
            prixInitial: article.prix,
            prix: prixApresOffre,
            sousTotal: prixApresOffre * article.quantite
        };
    });


    const sousTotalApresOffres = Math.max(
        0,
        sousTotal - montantReductionOffres
    );


    /* CODE PROMO */

    let codePromo = "";
    let montantReduction = 0;
    let messagePromo = "";
    let promoValide = false;

    if (
        typeof codePromoActif !== "undefined" &&
        codePromoActif
    ) {
        codePromo = String(codePromoActif).trim();

        if (
            typeof verifierCodePromo === "function" &&
            livraison &&
            livraison.ville
        ) {
            const resultatPromo = verifierCodePromo(
                codePromo,
                sousTotalApresOffres,
                livraison.ville,
                articlesApresOffres,
                resultatOffres.offresAppliquees || []
            );

            promoValide = Boolean(resultatPromo.valide);
            messagePromo = resultatPromo.message || "";

            if (promoValide) {
                montantReduction = Math.min(
                    sousTotalApresOffres,
                    Math.max(0, Number(resultatPromo.montantReduction) || 0)
                );
            }
        } else if (!livraison || !livraison.ville) {
            messagePromo = "Ville de livraison non renseignée.";
        }
    }


    /* LIVRAISON */

    const fraisLivraison = calculerFraisLivraison(livraison);


    /* TOTAL FINAL */

    const total = Math.max(
        0,
        sousTotal -
        montantReductionOffres -
        montantReduction +
        fraisLivraison
    );


    return {
        articles,
        articlesApresOffres,
        sousTotal,
        montantReductionOffres,
        offresAppliquees: Array.isArray(resultatOffres.offresAppliquees)
            ? resultatOffres.offresAppliquees
            : [],
        detailsOffres,
        sousTotalApresOffres,
        codePromo,
        montantReduction,
        promoValide,
        messagePromo,
        fraisLivraison,
        total,
        minimumCommande: verificationMinimum
            ? verificationMinimum.minimum
            : null,
        commandeMinimumAtteint: verificationMinimum
            ? verificationMinimum.valide
            : null,
        montantManquant: verificationMinimum
            ? verificationMinimum.montantManquant
            : 0
    };
}


/* ==========================================
   GÉNÉRER LE RÉCAPITULATIF
========================================== */

function genererRecapitulatifCommande(livraison = null) {
    const details = calculerDetailsCommande(livraison);

    if (!details) {
        alert("Ton panier est vide ou contient des articles invalides.");
        return null;
    }


    /* VÉRIFICATION DU MINIMUM */

    if (
        livraison &&
        livraison.ville &&
        details.commandeMinimumAtteint === false
    ) {
        alert(
            "Le minimum de commande pour cette ville est de " +
            formaterPrix(details.minimumCommande) +
            ". Il manque " +
            formaterPrix(details.montantManquant) +
            " à ton panier."
        );

        return null;
    }


    let message = "**MA COMMANDE**\n\n";


    /* ARTICLES */

    details.articles.forEach(article => {
        const nom = article.nom || "Produit";

        message += "• **" + nom + "**";

        if (
            article.grammage !== null &&
            article.grammage !== undefined
        ) {
            message += " — **" + article.grammage + " g**";
        }

        message +=
            " × " +
            article.quantite +
            " : " +
            formaterPrix(article.sousTotal) +
            "\n";
    });


    /* OFFRES SPÉCIALES */

    details.offresAppliquees.forEach(offre => {
        message +=
            "\nOffre spéciale (" +
            (offre.nom || "Promotion") +
            ") : -" +
            formaterPrix(offre.montantReduction);
    });


    /* CODE PROMO */

    if (details.codePromo && details.promoValide) {
        message +=
            "\nCode promo (" +
            details.codePromo +
            ") : -" +
            formaterPrix(details.montantReduction);
    }


    /* LIVRAISON */

    if (livraison) {
        message +=
            "\n\nLivraison : " +
            (
                details.fraisLivraison === 0
                    ? "Gratuite (Brest)"
                    : formaterPrix(details.fraisLivraison)
            );
    }


    /* ADRESSE */

    if (livraison) {
        message += "\n\n**ADRESSE DE LIVRAISON**\n\n";

        message += "Adresse : " + (livraison.adresse || "") + "\n";
        message += "Code postal : " + (livraison.codePostal || "") + "\n";
        message += "Ville : " + (livraison.ville || "");
    }


    /* TOTAL UNIQUE */

    message +=
        "\n\n**TOTAL : " +
        formaterPrix(details.total) +
        "**";

    return message;
}


/* ==========================================
   OUVRIR TELEGRAM
========================================== */

function ouvrirTelegram() {
    if (!TELEGRAM_USERNAME) {
        alert("Configure ton identifiant Telegram dans commande.js.");
        return;
    }

    const message = genererRecapitulatifCommande();

    if (!message) return;

    const lienTelegram =
        "https://t.me/" +
        TELEGRAM_USERNAME.replace("@", "") +
        "?text=" +
        encodeURIComponent(message);

    window.open(lienTelegram, "_blank");
}


/* ==========================================
   INITIALISATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Le bouton commander-panier est géré par order-popup.js.

    const boutonCommande = document.getElementById("commander");

    if (boutonCommande) {
        boutonCommande.addEventListener("click", ouvrirTelegram);
    }
});
