if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
}

window.addEventListener("pageshow", () => {
    window.scrollTo(0, 0);
});

document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.replace(/\/+$/, "").split("/").pop().toLowerCase();
    if (!currentPage || currentPage === "index.html") return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "cali-back-button";
    button.setAttribute("aria-label", "Revenir à la page précédente");
    button.innerHTML = '<span class="cali-back-button__icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M19 12H5m0 0 7 7m-7-7 7-7" /></svg></span><span>Retour</span>';

    button.addEventListener("click", () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "index.html";
        }
    });

    const header = document.querySelector(".header");
    const spacer = document.createElement("div");
    spacer.className = "cali-back-spacer";
    spacer.setAttribute("aria-hidden", "true");

    const updatePosition = () => {
        const headerBottom = header?.getBoundingClientRect().bottom ?? 100;
        button.style.setProperty("--cali-back-top", `${Math.max(16, headerBottom + 10)}px`);
    };

    if (header) {
        header.after(spacer);
    }
    document.body.appendChild(button);
    updatePosition();
    window.addEventListener("resize", updatePosition, { passive: true });

    let scrollTimer;
    const scrollPosition = () => Math.max(
        window.scrollY,
        document.documentElement.scrollTop,
        document.body.scrollTop
    );

    const estomperPendantLeScroll = () => {
        if (scrollPosition() < 24) {
            button.classList.remove("is-scrolling");
            return;
        }

        button.classList.add("is-scrolling");
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => {
            button.classList.remove("is-scrolling");
        }, 1400);
    };

    window.addEventListener("scroll", estomperPendantLeScroll, { passive: true });
    document.addEventListener("scroll", estomperPendantLeScroll, { passive: true, capture: true });
    window.addEventListener("wheel", estomperPendantLeScroll, { passive: true });
    window.addEventListener("touchmove", estomperPendantLeScroll, { passive: true });
    window.addEventListener("keydown", (event) => {
        if (["ArrowDown", "PageDown", "Space", "End"].includes(event.code) && scrollPosition() >= 24) {
            estomperPendantLeScroll();
        }
    }, { passive: true });
});
