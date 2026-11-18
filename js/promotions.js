
/* ==========================================
   PROMOTIONS - CALI29
   CONFIGURATION DES CODES PROMO
========================================== */

const PROMOTIONS = [

    {
        code: "BIENVENUE10",
        actif: true,

        // Type : "pourcentage" ou "fixe"
        type: "pourcentage",

        // Valeur de la réduction
        valeur: 10,

        // Montant minimum du panier en euros
        montantMinimum: 0,

        // Villes autorisées
        // [] = toutes les villes
        villesAutorisees: [],

        // Identifiants des produits autorisés
        // [] = tous les produits
        produitsAutorises: [],

        // Catégories autorisées
        // [] = toutes les catégories
        categoriesAutorisees: [],

        // Dates de validité (format AAAA-MM-JJ)
        // null = aucune limite
        dateDebut: null,
        dateFin: null
    }

];


/* ==========================================
   NORMALISER UN TEXTE
========================================== */

function normaliserTexte(texte) {
    return String(texte || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


/* ==========================================
   TROUVER UN CODE PROMO
========================================== */

function trouverPromotion(code) {

    const codeNormalise = String(code || "")
        .trim()
        .toUpperCase();

    return PROMOTIONS.find(promotion =>
        promotion.code.toUpperCase() === codeNormalise
    ) || null;
}


/* ==========================================
   OBTENIR LA DATE DU JOUR
========================================== */

function obtenirDateLocale() {

    const maintenant = new Date();

    const annee = maintenant.getFullYear();
    const mois = String(maintenant.getMonth() + 1).padStart(2, "0");
    const jour = String(maintenant.getDate()).padStart(2, "0");

    return `${annee}-${mois}-${jour}`;
}


/* ==========================================
   CALCULER LE MONTANT ÉLIGIBLE
========================================== */

function calculerMontantEligible(promotion, sousTotal, articles = []) {

    const produitsAutorises = promotion.produitsAutorises || [];
    const categoriesAutorisees = promotion.categoriesAutorisees || [];

    // Aucun filtre produit : tout le panier est éligible
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

        const produit = typeof produits !== "undefined"
            ? produits.find(p => p.id === article.id)
            : null;

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
   CALCULER LA RÉDUCTION
========================================== */

function calculerReductionPromo(promotion, sousTotal, articles = []) {

    if (!promotion) return 0;

    const montantEligible = calculerMontantEligible(
        promotion,
        sousTotal,
        articles
    );

    let reduction = 0;

    if (promotion.type === "pourcentage") {

        reduction = montantEligible * (Number(promotion.valeur) / 100);

    } else if (promotion.type === "fixe") {

        reduction = Number(promotion.valeur);

    }

    // La réduction ne peut pas dépasser le montant éligible
    reduction = Math.min(reduction, montantEligible);

    return Math.max(0, Math.round(reduction * 100) / 100);
}


/* ==========================================
   VÉRIFIER UN CODE PROMO
========================================== */

function verifierCodePromo(code, sousTotal, ville = "", articles = []) {

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

    const total = Number(sousTotal) || 0;

    // Vérifier le montant minimum
    if (total < Number(promotion.montantMinimum || 0)) {
        return {
            valide: false,
            message: `Montant minimum requis : ${promotion.montantMinimum} €.`,
            promotion: null,
            montantReduction: 0
        };
    }

    // Vérifier la ville
    if (promotion.villesAutorisees.length > 0) {

        const villeAutorisee = promotion.villesAutorisees.some(v =>
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

    // Vérifier la date de début
    const aujourdHui = obtenirDateLocale();

    if (promotion.dateDebut && aujourdHui < promotion.dateDebut) {
        return {
            valide: false,
            message: "Ce code promo n'est pas encore valable.",
            promotion: null,
            montantReduction: 0
        };
    }

    // Vérifier la date de fin
    if (promotion.dateFin && aujourdHui > promotion.dateFin) {
        return {
            valide: false,
            message: "Ce code promo a expiré.",
            promotion: null,
            montantReduction: 0
        };
    }

    // Calculer la réduction
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
        promotion: promotion,
        montantReduction: montantReduction
    };
}
