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
    image: "assets/images/diamond.png",
    video: "assets/videos/diamondVid.mp4",
    description: "Découvrez la Diamond OG, une variété au caractère affirmé et à l'identité remarquable. Elle séduit par ses magnifiques nuances, ses arômes intenses et son profil aromatique complexe, où se mêlent des notes terreuses, boisées et légèrement citronnées.",
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
    image: "assets/images/purple.png",
    video: "assets/videos/purpleVid.mp4",
    description: "La Purple Majesty se distingue par son allure élégante et ses magnifiques nuances violacées. Son profil aromatique dévoile des notes douces et fruitées, accompagnées d'une légère touche florale.",
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
        { grammage: 100, prix: 250.00 }
    ],
    image: "assets/images/mousse.png",
    video: "assets/videos/royalVid.mp4",
    description: "Description de la résine à compléter.",
    popularite: 10
},

{
    id: "resine-002",
    nom: "RMF 73u",
    categorie: "resines",
    prix: 10.00,
    tarifs: [
        { grammage: 5, prix: 40.00 },
        { grammage: 10, prix: 70.00 },
        { grammage: 20, prix: 130.00 },
        { grammage: 50, prix: 230.00 }
    ],

    // TARIFS PARTICULIERS SELON LA VILLE
    tarifsSpeciaux: [
        {
            ville: "Brest",
            grammage: 10,
            prix: 60.00
        }
    ],

    image: "assets/images/filtre.png",
    video: "assets/videos/rmfVid.mp4",
    description: "Description de la résine à compléter.",
    popularite: 8
},

{
    id: "accessoire-001",
    nom: "Zip",
    categorie: "accessoires",
    prix: 35.00,
    tarifs: [
        { grammage: 0.5, prix: 30.00 },
        { grammage: 1, prix: 50.00 },
        { grammage: 5, prix: 200.00 },
        { grammage: 10, prix: 350.00 },
        { grammage: 20, prix: 630.00 }
    ],
    image: "assets/images/zip.png",
    video: "assets/videos/zipVid.mp4",
    description: "Description de l'accessoire à compléter.",
    popularite: 10
}

];