
/* ==========================================
   CATALOGUE PRODUITS - CALI29
========================================== */

const produits = [


{
    id: "fleur-001",
    nom: "Diamond OG",
    categorie: "fleurs",
    prix: 15.00,
    tarifs: [
        { grammage: 2, prix: 30.00 },
        { grammage: 5, prix: 50.00 },
        { grammage: 10, prix: 80.00 },
        { grammage: 20, prix: 150.00 },
        { grammage: 50, prix: 350.00 }
    ],
    image: "assets/images/diamond.jpg",
    video: "assets/videos/diamondVid.MP4",
    description: "Description de la fleur à compléter.",
    popularite: 10
},

{
    id: "fleur-002",
    nom: "Purple Majesty",
    categorie: "fleurs",
    prix: 15.00,
    tarifs: [
        { grammage: 2, prix: 30.00 },
        { grammage: 5, prix: 60.00 },
        { grammage: 10, prix: 90.00 },
        { grammage: 20, prix: 160.00 },
        { grammage: 50, prix: 360.00 }
    ],
    image: "assets/images/majesty.jpg",
    video: "assets/videos/purpleVid.MP4",
    description: "Une variété au profil aromatique intense",
    popularite: 8
},


{
    id: "resine-001",
    nom: "Royal mousse",
    categorie: "resines",
    prix: 4.00,
    tarifs: [
        { grammage: 10, prix: 40.00 },
        { grammage: 20, prix: 80.00 },
        { grammage: 50, prix: 150.00 },
        { grammage: 100, prix: 250.00 },
    ],
    image: "assets/images/resine-1.png",
    video: "assets/videos/royalVid.MP4",
    description: "Description de la résine à compléter.",
    popularite: 10
},

{
    id: "resine-002",
    nom: "Filtré 73u",
    categorie: "resines",
    prix: 10.00,
    tarifs: [
        { grammage: 5, prix: 50.00 },
        { grammage: 10, prix: 80.00 },
        { grammage: 20, prix: 150.00 }
    ],
    image: "assets/images/resine-2.png",
    description: "Description de la résine à compléter.",
    popularite: 8
},


    {
        id: "accessoire-001",
        nom: "Accessoire Premium",
        categorie: "accessoires",
        prix: 15.00,
        image: "assets/images/a-remplacer-1.png",
        description: "Description de l'accessoire à compléter.",
        popularite: 10
    },

    {
        id: "accessoire-002",
        nom: "Accessoire Selection",
        categorie: "accessoires",
        prix: 18.00,
        image: "assets/images/a-remplacer-2.png",
        description: "Description de l'accessoire à compléter.",
        popularite: 8
    },

    {
        id: "accessoire-003",
        nom: "Accessoire Classic",
        categorie: "accessoires",
        prix: 12.00,
        image: "assets/images/a-remplacer-3.png",
        description: "Description de l'accessoire à compléter.",
        popularite: 6
    }

];
