
/* ==========================================
   MENU CALI29
   Navigation ordinateur et mobile
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const boutonBurger = document.getElementById("menu-burger");
    const menuMobile = document.getElementById("menu-mobile");

    const boutiqueDropdown = document.getElementById("boutique-dropdown");
    const boutonBoutique = document.getElementById("boutique-toggle");

    /* MENU MOBILE */

    function fermerMenuMobile() {
        if (!boutonBurger || !menuMobile) return;

        menuMobile.hidden = true;
        boutonBurger.setAttribute("aria-expanded", "false");
        boutonBurger.setAttribute("aria-label", "Ouvrir le menu");

        const icone = boutonBurger.querySelector(".burger-icone");
        if (icone) icone.textContent = "☰";
    }

    function basculerMenuMobile() {
        if (!boutonBurger || !menuMobile) return;

        const ouverture = menuMobile.hidden;

        menuMobile.hidden = !ouverture;
        boutonBurger.setAttribute("aria-expanded", String(ouverture));
        boutonBurger.setAttribute(
            "aria-label",
            ouverture ? "Fermer le menu" : "Ouvrir le menu"
        );

        const icone = boutonBurger.querySelector(".burger-icone");
        if (icone) icone.textContent = ouverture ? "✕" : "☰";
    }

    if (boutonBurger && menuMobile) {
        boutonBurger.addEventListener("click", basculerMenuMobile);

        menuMobile.querySelectorAll("a").forEach(lien => {
            lien.addEventListener("click", fermerMenuMobile);
        });
    }

    /* SOUS-MENU BOUTIQUE SUR ORDINATEUR */

    function fermerBoutique() {
        if (!boutiqueDropdown || !boutonBoutique) return;

        boutiqueDropdown.classList.remove("ouvert");
        boutonBoutique.setAttribute("aria-expanded", "false");
    }

    if (boutiqueDropdown && boutonBoutique) {
        boutonBoutique.addEventListener("click", event => {
            event.stopPropagation();

            const ouverture = !boutiqueDropdown.classList.contains("ouvert");

            boutiqueDropdown.classList.toggle("ouvert", ouverture);
            boutonBoutique.setAttribute("aria-expanded", String(ouverture));
        });

        boutiqueDropdown.querySelectorAll(".boutique-sous-menu a").forEach(lien => {
            lien.addEventListener("click", fermerBoutique);
        });
    }

    /* FERMETURE EN CLIQUANT À L'EXTÉRIEUR */

    document.addEventListener("click", event => {

        if (
            boutiqueDropdown &&
            !boutiqueDropdown.contains(event.target)
        ) {
            fermerBoutique();
        }

        if (
            menuMobile &&
            boutonBurger &&
            !menuMobile.hidden &&
            !menuMobile.contains(event.target) &&
            !boutonBurger.contains(event.target)
        ) {
            fermerMenuMobile();
        }
    });

    /* FERMETURE AVEC ÉCHAP */

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            fermerMenuMobile();
            fermerBoutique();
        }
    });

    /* PASSAGE DE MOBILE À ORDINATEUR */

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            fermerMenuMobile();
        }
    });

});
