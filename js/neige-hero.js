
/* =========================================
   CALI29 - ANIMATION COMPLETE
   NEIGE + BRILLANCE NEON DU LOGO
========================================= */

(() => {
    "use strict";

    // =========================================
    // ELEMENTS
    // =========================================

    const hero = document.querySelector("#hero");
    const logo = document.querySelector(".header .logo");

    if (!hero) {
        console.warn("CALI29 : section #hero introuvable.");
        return;
    }

    // =========================================
    // CONFIGURATION
    // =========================================

    const CONFIG = {
        // Neige
        densite: 5500,
        minimumFlocons: 45,
        maximumFlocons: 160,

        tailleMin: 0.6,
        tailleMax: 2.1,

        vitesseMin: 20,
        vitesseMax: 65,

        opaciteMin: 0.25,
        opaciteMax: 0.8,

        deriveHorizontale: 14,

        // Logo
        brillanceMin: 1,
        brillanceMax: 2.1,

        dureeBrillanceMin: 180,
        dureeBrillanceMax: 500,

        intervalleBrillanceMin: 1200,
        intervalleBrillanceMax: 3500
    };

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // =========================================
    // PREPARATION DU HERO
    // =========================================

    hero.style.position = "relative";
    hero.style.isolation = "isolate";

    const contenu = hero.querySelector(".hero-contenu");
    const image = hero.querySelector(".hero-image");

    if (image) {
        image.style.position = "relative";
        image.style.zIndex = "1";
    }

    if (contenu) {
        contenu.style.position = "relative";
        contenu.style.zIndex = "3";
    }

    // =========================================
    // CANVAS DE NEIGE
    // =========================================

    const canvas = document.createElement("canvas");

    canvas.setAttribute("aria-hidden", "true");

    Object.assign(canvas.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        zIndex: "2",
        pointerEvents: "none",
        display: "block"
    });

    hero.prepend(canvas);

    const ctx = canvas.getContext("2d", {
        alpha: true
    });

    if (!ctx) {
        canvas.remove();
        return;
    }

    // =========================================
    // VARIABLES
    // =========================================

    let largeur = 0;
    let hauteur = 0;
    let ratio = 1;

    let flocons = [];

    let animationId = null;
    let dernierTemps = 0;

    // Animation du logo
    let prochaineBrillance = 0;
    let finBrillance = 0;
    let intensiteBrillance = 1;

    // =========================================
    // ALEATOIRE
    // =========================================

    function aleatoire(min, max) {
        return Math.random() * (max - min) + min;
    }

    // =========================================
    // CREATION DES FLOCONS
    // =========================================

    function creerFlocon(positionAleatoire = true) {
        return {
            x: positionAleatoire
                ? aleatoire(0, largeur)
                : aleatoire(-20, largeur + 20),

            y: positionAleatoire
                ? aleatoire(0, hauteur)
                : aleatoire(-30, -5),

            taille: aleatoire(
                CONFIG.tailleMin,
                CONFIG.tailleMax
            ),

            vitesse: aleatoire(
                CONFIG.vitesseMin,
                CONFIG.vitesseMax
            ),

            derive: aleatoire(
                -CONFIG.deriveHorizontale,
                CONFIG.deriveHorizontale
            ),

            opacite: aleatoire(
                CONFIG.opaciteMin,
                CONFIG.opaciteMax
            ),

            phase: aleatoire(0, Math.PI * 2),

            oscillation: aleatoire(0.3, 1.2)
        };
    }

    // =========================================
    // REDIMENSIONNEMENT
    // =========================================

    function redimensionner() {
        const rect = hero.getBoundingClientRect();

        largeur = rect.width;
        hauteur = rect.height;

        if (largeur <= 0 || hauteur <= 0) {
            return;
        }

        ratio = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvas.width = Math.round(largeur * ratio);
        canvas.height = Math.round(hauteur * ratio);

        ctx.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );

        const nombreFlocons = Math.max(
            CONFIG.minimumFlocons,
            Math.min(
                CONFIG.maximumFlocons,
                Math.floor(
                    (largeur * hauteur) / CONFIG.densite
                )
            )
        );

        flocons = [];

        for (let i = 0; i < nombreFlocons; i++) {
            flocons.push(creerFlocon(true));
        }

        dessinerNeige();
    }

    // =========================================
    // DESSIN DE LA NEIGE
    // =========================================

    function dessinerNeige() {
        ctx.clearRect(0, 0, largeur, hauteur);

        for (const flocon of flocons) {
            ctx.beginPath();

            ctx.arc(
                flocon.x,
                flocon.y,
                flocon.taille,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                `rgba(255,255,255,${flocon.opacite})`;

            ctx.fill();
        }
    }

    // =========================================
    // ANIMATION DE LA NEIGE
    // =========================================

    function animerNeige(delta) {
        for (const flocon of flocons) {
            flocon.phase += delta * flocon.oscillation;

            // Chute verticale
            flocon.y += flocon.vitesse * delta;

            // Mouvement horizontal léger
            flocon.x +=
                flocon.derive * delta +
                Math.sin(flocon.phase) * 8 * delta;

            // Le flocon repart du haut
            if (flocon.y > hauteur + 10) {
                flocon.y = aleatoire(-30, -5);
                flocon.x = aleatoire(0, largeur);
            }

            // Limites horizontales
            if (flocon.x > largeur + 10) {
                flocon.x = -10;
            }

            if (flocon.x < -10) {
                flocon.x = largeur + 10;
            }
        }

        dessinerNeige();
    }

    // =========================================
    // BRILLANCE NEON DU LOGO
    // =========================================

    function programmerBrillance(temps) {
        prochaineBrillance =
            temps +
            aleatoire(
                CONFIG.intervalleBrillanceMin,
                CONFIG.intervalleBrillanceMax
            );

        finBrillance = 0;
        intensiteBrillance = 1;
    }

    function animerLogo(temps) {
        if (!logo) {
            return;
        }

        if (reducedMotion) {
            logo.style.textShadow = "none";
            logo.style.filter = "none";
            return;
        }

        // Première programmation
        if (!prochaineBrillance) {
            programmerBrillance(temps);
        }

        // Déclenchement aléatoire
        if (
            temps >= prochaineBrillance &&
            !finBrillance
        ) {
            finBrillance =
                temps +
                aleatoire(
                    CONFIG.dureeBrillanceMin,
                    CONFIG.dureeBrillanceMax
                );

            intensiteBrillance = aleatoire(
                CONFIG.brillanceMin,
                CONFIG.brillanceMax
            );
        }

        // Pendant la brillance
        if (finBrillance && temps < finBrillance) {
            const progression =
                (finBrillance - temps) /
                CONFIG.dureeBrillanceMax;

            const intensite =
                1 + (intensiteBrillance - 1) *
                Math.min(1, progression + 0.25);

            logo.style.filter =
                `brightness(${intensite.toFixed(2)})`;

            logo.style.textShadow = `
                0 0 3px rgba(255,255,255,0.9),
                0 0 8px rgba(255,255,255,0.75),
                0 0 16px rgba(255,255,255,0.35)
            `;

        } else if (finBrillance) {
            // Retour à la lumière normale
            logo.style.filter = "brightness(1)";
            logo.style.textShadow =
                "0 0 2px rgba(255,255,255,0.2)";

            programmerBrillance(temps);
        }
    }

    // =========================================
    // BOUCLE PRINCIPALE
    // =========================================

    function animation(temps) {
        animationId = null;

        if (!largeur || !hauteur) {
            return;
        }

        if (!dernierTemps) {
            dernierTemps = temps;
        }

        let delta = (temps - dernierTemps) / 1000;

        dernierTemps = temps;

        // Evite les sauts après une pause
        delta = Math.min(delta, 0.05);

        animerNeige(delta);
        animerLogo(temps);

        animationId = requestAnimationFrame(animation);
    }

    // =========================================
    // DEMARRAGE ET ARRET
    // =========================================

    function demarrer() {
        if (animationId !== null) {
            return;
        }

        dernierTemps = 0;

        if (reducedMotion) {
            dessinerNeige();

            if (logo) {
                logo.style.filter = "none";
                logo.style.textShadow = "none";
            }

            return;
        }

        animationId = requestAnimationFrame(animation);
    }

    function arreter() {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    // =========================================
    // INITIALISATION
    // =========================================

    redimensionner();
    demarrer();

    // Adaptation aux dimensions du hero
    if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(() => {
            redimensionner();
        });

        observer.observe(hero);
    } else {
        window.addEventListener(
            "resize",
            redimensionner
        );
    }

    // Pause quand l'onglet est masqué
    document.addEventListener(
        "visibilitychange",
        () => {
            if (document.hidden) {
                arreter();
            } else {
                demarrer();
            }
        }
    );

})();
