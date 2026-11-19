/* ==========================================
   PROMOTIONS - CALI29 V2
   CODES PROMO ET OFFRES SPÉCIALES
========================================== */


/* ==========================================
   1. CODES PROMO
========================================== */

const PROMOTIONS = [

    {
        code: "BIENVENUE10",

        actif: true,

        type: "pourcentage",

        valeur: 10,

        montantMinimum: 0,

        villesAutorisees: [],

        produitsAutorises: [],

        categoriesAutorisees: [],

        dateDebut: null,

        dateFin: null
    }

];


/* ==========================================
   2. OFFRES SPÉCIALES
========================================== */

// Aucune offre spéciale active pour le moment.

const OFFRES_SPECIALES = [];


/* ==========================================
   3. NORMALISER UN TEXTE
========================================== */

function normaliserTexte(texte) {

    return String(texte || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


/* ==========================================
   4. OBTENIR LA DATE DU JOUR
========================================== */

function obtenirDateLocale() {

    const maintenant = new Date();

    const annee = maintenant.getFullYear();

    const mois = String(maintenant.getMonth() + 1).padStart(2, "0");

    const jour = String(maintenant.getDate()).padStart(2, "0");

    return `${annee}-${mois}-${jour}`;

}


/* ==========================================
   5. VÉRIFIER LES DATES
========================================== */

function promotionDansPeriode(promotion) {

    const aujourdHui = obtenirDateLocale();

    if (promotion.dateDebut && aujourdHui < promotion.dateDebut) {
        return false;
    }

    if (promotion.dateFin && aujourdHui > promotion.dateFin) {
        return false;
    }

    return true;

}


/* ==========================================
   6. TROUVER UN CODE PROMO
========================================== */

function trouverPromotion(code) {

    const codeNormalise = String(code || "")
        .trim()
        .toUpperCase();

    return PROMOTIONS.find(promotion =>
        String(promotion.code || "").toUpperCase() === codeNormalise
    ) || null;

}


/* ==========================================
   7. CALCULER LE MONTANT ÉLIGIBLE
========================================== */

function calculerMontantEligible(
    promotion,
    sousTotal,
    articles = []
) {

    const produitsAutorises = promotion.produitsAutorises || [];

    const categoriesAutorisees = promotion.categoriesAutorisees || [];


    if (
        produitsAutorises.length === 0 &&
        categoriesAutorisees.length === 0
    ) {
        return Number(sousTotal) || 0;
    }

    if (!Array.isArray(articles)) {
        return 0;
    }

    let montantEligible = 0;

    articles.forEach(article => {

        const catalogue = Array.isArray(window.produits)
            ? window.produits
            : [];

        const produit = catalogue.find(
            p => String(p.id) === String(article.id)
        );

        const categorie = article.categorie || produit?.categorie || "";

        const produitAutorise =
            produitsAutorises.length === 0 ||
            produitsAutorises.includes(article.id);

        const categorieAutorisee =
            categoriesAutorisees.length === 0 ||
            categoriesAutorisees.some(cat =>
                normaliserTexte(cat) === normaliserTexte(categorie)
            );

        if (produitAutorise && categorieAutorisee) {

            const prix = Number(article.prix) || 0;

            const quantite = Number(article.quantite) || 0;

            montantEligible += prix * quantite;

        }

    });

    return montantEligible;

}


/* ==========================================
   8. CALCULER UNE RÉDUCTION
========================================== */

function calculerReductionPromo(
    promotion,
    sousTotal,
    articles = []
) {

    if (!promotion) return 0;

    const montantEligible = calculerMontantEligible(
        promotion,
        sousTotal,
        articles
    );

    let reduction = 0;

    if (promotion.type === "pourcentage") {

        reduction =
            montantEligible * (Number(promotion.valeur) / 100);

    } else if (promotion.type === "fixe") {

        reduction = Number(promotion.valeur);

    }

    reduction = Math.min(reduction, montantEligible);

    return Math.max(
        0,
        Math.round(reduction * 100) / 100
    );

}


/* ==========================================
   9. VÉRIFIER UN CODE PROMO
========================================== */

function verifierCodePromo(
    code,
    sousTotal,
    ville = "",
    articles = [],
    offresAppliquees = []
) {

    const promotion = trouverPromotion(code);

    if (!promotion) {

        return {
            valide: false,
            message: "Code promo invalide.",
            promotion: null,
            montantReduction: 0
        };

    }

    if (!promotion.actif) {

        return {
            valide: false,
            message: "Ce code promo n'est pas actif.",
            promotion: null,
            montantReduction: 0
        };

    }

    if (!promotionDansPeriode(promotion)) {

        return {
            valide: false,
            message: "Ce code promo n'est pas valable à cette date.",
            promotion: null,
            montantReduction: 0
        };

    }


    // MONTANT MINIMUM

    const total = Number(sousTotal) || 0;

    if (total < Number(promotion.montantMinimum || 0)) {

        return {
            valide: false,
            message: `Montant minimum requis : ${promotion.montantMinimum} €.`,
            promotion: null,
            montantReduction: 0
        };

    }


    // VILLE

    const villesAutorisees = promotion.villesAutorisees || [];

    if (villesAutorisees.length > 0) {

        const villeAutorisee = villesAutorisees.some(v =>
            normaliserTexte(v) === normaliserTexte(ville)
        );

        if (!villeAutorisee) {

            return {
                valide: false,
                message: "Ce code promo n'est pas valable dans cette ville.",
                promotion: null,
                montantReduction: 0
            };

        }

    }


    // CUMUL AVEC OFFRES SPÉCIALES

    const offreNonCumulable = offresAppliquees.find(
        offre => offre.cumulableCodePromo === false
    );

    if (offreNonCumulable) {

        return {
            valide: false,
            message: `L'offre "${offreNonCumulable.nom}" n'est pas cumulable avec un code promo.`,
            promotion: null,
            montantReduction: 0
        };

    }


    // CALCUL

    const montantReduction = calculerReductionPromo(
        promotion,
        total,
        articles
    );

    if (montantReduction <= 0) {

        return {
            valide: false,
            message: "Aucun produit de ce panier n'est éligible à cette promotion.",
            promotion: null,
            montantReduction: 0
        };

    }

    return {
        valide: true,
        message: "Code promo accepté.",
        promotion,
        montantReduction
    };

}


/* ==========================================
   10. VÉRIFIER LA ZONE D'UNE OFFRE
========================================== */

function offreAutoriseeDansVille(offre, ville) {

    if (offre.zone === "toutes") {
        return true;
    }

    if (offre.zone === "ville") {

        return normaliserTexte(offre.ville) === normaliserTexte(ville);

    }

    return false;

}


/* ==========================================
   11. CALCULER LES OFFRES SPÉCIALES
========================================== */

function calculerOffresSpeciales(articles = [], ville = "") {

    const resultat = {
        montantReduction: 0,
        offresAppliquees: [],
        detailsArticles: []
    };

    if (!Array.isArray(articles)) {
        return resultat;
    }

    // OFFRES_SPECIALES est actuellement vide.
    // Cette fonction reste disponible pour de futures offres.

    articles.forEach(article => {

        const quantite = Number(article.quantite) || 0;

        const prix = Number(article.prix) || 0;

        const grammage = Number(article.grammage) || 0;

        if (quantite <= 0 || prix <= 0) return;

        const offresEligibles = OFFRES_SPECIALES.filter(offre => {

            if (!offre.actif) return false;

            if (!promotionDansPeriode(offre)) return false;

            if (offre.produitId !== article.id) return false;

            if (Number(offre.grammage) !== grammage) return false;

            if (!offreAutoriseeDansVille(offre, ville)) return false;

            return true;

        });

        offresEligibles.forEach(offre => {

            let reductionUnitaire = 0;

            if (offre.type === "fixe") {

                reductionUnitaire = Number(offre.valeur) || 0;

            } else if (offre.type === "pourcentage") {

                reductionUnitaire = prix * (
                    Number(offre.valeur) / 100
                );

            }

            reductionUnitaire = Math.min(reductionUnitaire, prix);

            const reductionTotale = Math.round(
                reductionUnitaire * quantite * 100
            ) / 100;

            if (reductionTotale <= 0) return;

            resultat.montantReduction += reductionTotale;

            resultat.offresAppliquees.push({
                id: offre.id,
                nom: offre.nom,
                cumulableCodePromo: offre.cumulableCodePromo,
                montantReduction: reductionTotale
            });

            resultat.detailsArticles.push({
                produitId: article.id,
                grammage,
                quantite,
                nomOffre: offre.nom,
                montantReduction: reductionTotale
            });

        });

    });

    resultat.montantReduction = Math.round(
        resultat.montantReduction * 100
    ) / 100;

    return resultat;

}