
/* ==========================================
   CALI29 — DASHBOARD ESPACE CLIENT
   Interface visuelle uniquement
   Les données réelles restent dans Supabase
========================================== */

(() => {
    "use strict";

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    function initialiserDashboard() {
        const modal = $("#compte-modal");
        const fenetre = $(".compte-fenetre", modal);
        const espace = $("#compte-connecte", modal);

        if (!modal || !fenetre || !espace) return;

        if ($("#dashboard-client", espace)) return;

        const bienvenue = $(".compte-bienvenue", espace);
        const adresse = $(".adresse-client", espace);
        const deconnexion = $("#bouton-deconnexion", espace);

        if (!bienvenue || !adresse || !deconnexion) return;

        const historique = $("#historique-commandes", espace);

        const dashboard = document.createElement("div");
        dashboard.id = "dashboard-client";
        dashboard.className = "dashboard-client";

        dashboard.innerHTML = `
            <aside class="dashboard-sidebar">
                <div class="dashboard-brand">
                    <span class="dashboard-brand-point"></span>
                    CALI29
                </div>

                <div class="dashboard-menu-label">ESPACE CLIENT</div>

                <nav class="dashboard-navigation">
                    <button class="dashboard-nav active" data-section="accueil">
                        <span>▦</span>
                        Tableau de bord
                    </button>

                    <button class="dashboard-nav" data-section="commandes">
                        <span>▤</span>
                        Mes commandes
                    </button>

                    <button class="dashboard-nav" data-section="adresse">
                        <span>⌖</span>
                        Mon adresse
                    </button>

                    <button class="dashboard-nav" data-section="profil">
                        <span>♙</span>
                        Mon profil
                    </button>
                </nav>

                <div class="dashboard-sidebar-bottom">
                    <div class="dashboard-sidebar-status">
                        <span></span>
                        Compte actif
                    </div>

                    <button type="button" class="dashboard-sidebar-logout">
                        Déconnexion
                    </button>
                </div>
            </aside>

            <main class="dashboard-main">
                <header class="dashboard-topbar">
                    <div>
                        <span class="dashboard-breadcrumb">CALI29 / CLIENT</span>
                        <h2>Tableau de bord</h2>
                    </div>

                    <div class="dashboard-top-actions">
                        <span class="dashboard-online">
                            <i></i> En ligne
                        </span>
                        <div class="dashboard-user-avatar">C</div>
                    </div>
                </header>

                <section class="dashboard-content">
                    <div class="dashboard-welcome-slot"></div>

                    <div class="dashboard-section-title">
                        <div>
                            <span class="dashboard-eyebrow">VOTRE ACTIVITÉ</span>
                            <h3>Vue d'ensemble</h3>
                        </div>
                        <span class="dashboard-demo-label">APERÇU VISUEL</span>
                    </div>

                    <div class="dashboard-stats">
                        <article class="dashboard-stat">
                            <div class="dashboard-stat-top">
                                <span>Commandes</span>
                                <span class="dashboard-stat-icon">▤</span>
                            </div>
                            <strong data-stat="orders">--</strong>
                            <small>Vos commandes réelles</small>
                        </article>

                        <article class="dashboard-stat">
                            <div class="dashboard-stat-top">
                                <span>En cours</span>
                                <span class="dashboard-stat-icon">◷</span>
                            </div>
                            <strong data-stat="pending">--</strong>
                            <small>Commandes à traiter</small>
                        </article>

                        <article class="dashboard-stat">
                            <div class="dashboard-stat-top">
                                <span>Dernière commande</span>
                                <span class="dashboard-stat-icon">⌁</span>
                            </div>
                            <strong data-stat="last">--</strong>
                            <small>Date de votre dernière commande</small>
                        </article>

                        <article class="dashboard-stat dashboard-stat-highlight">
                            <div class="dashboard-stat-top">
                                <span>Statut du compte</span>
                                <span class="dashboard-stat-icon">✦</span>
                            </div>
                            <strong>ACTIF</strong>
                            <small>Votre espace est opérationnel</small>
                        </article>
                    </div>

                    <div class="dashboard-grid">
                        <section class="dashboard-panel dashboard-activity">
                            <div class="dashboard-panel-heading">
                                <div>
                                    <span class="dashboard-eyebrow">SUIVI</span>
                                    <h3>Activité récente</h3>
                                </div>
                                <span class="dashboard-panel-symbol">⌁</span>
                            </div>

                            <div class="dashboard-activity-list">
                                <div class="dashboard-activity-item">
                                    <span class="dashboard-activity-dot purple"></span>
                                    <div>
                                        <strong>Espace client créé</strong>
                                        <small>Votre compte CALI29 est prêt</small>
                                    </div>
                                    <span class="dashboard-activity-tag">Compte</span>
                                </div>

                                <div class="dashboard-activity-item">
                                    <span class="dashboard-activity-dot blue"></span>
                                    <div>
                                        <strong>Adresse de livraison</strong>
                                        <small>Enregistrez votre adresse habituelle</small>
                                    </div>
                                    <span class="dashboard-activity-tag">Profil</span>
                                </div>

                                <div class="dashboard-activity-item">
                                    <span class="dashboard-activity-dot green"></span>
                                    <div>
                                        <strong>Historique des commandes</strong>
                                        <small>Retrouvez vos achats dans cet espace</small>
                                    </div>
                                    <span class="dashboard-activity-tag">Suivi</span>
                                </div>
                            </div>

                            <div class="dashboard-progress">
                                <div>
                                    <span>Profil client</span>
                                    <strong id="dashboard-profile-progress">À compléter</strong>
                                </div>
                                <div class="dashboard-progress-track">
                                    <span id="dashboard-progress-bar"></span>
                                </div>
                                <small>Ajoutez une adresse pour faciliter vos prochaines commandes.</small>
                            </div>
                        </section>

                        <section class="dashboard-panel dashboard-quick">
                            <div class="dashboard-panel-heading">
                                <div>
                                    <span class="dashboard-eyebrow">RACCOURCIS</span>
                                    <h3>Accès rapide</h3>
                                </div>
                            </div>

                            <button type="button" data-section="commandes">
                                <span class="dashboard-quick-icon">▤</span>
                                <span>
                                    <strong>Mes commandes</strong>
                                    <small>Consulter mon historique</small>
                                </span>
                                <b>›</b>
                            </button>

                            <button type="button" data-section="adresse">
                                <span class="dashboard-quick-icon">⌖</span>
                                <span>
                                    <strong>Mon adresse</strong>
                                    <small>Modifier mes coordonnées</small>
                                </span>
                                <b>›</b>
                            </button>

                            <a href="index.html#categories">
                                <span class="dashboard-quick-icon">✦</span>
                                <span>
                                    <strong>La boutique</strong>
                                    <small>Découvrir les produits</small>
                                </span>
                                <b>›</b>
                            </a>

                            <div class="dashboard-quick-note">
                                <span>INFORMATION</span>
                                <p>Vos commandes et vos informations personnelles sont accessibles depuis votre espace client.</p>
                            </div>
                        </section>
                    </div>

                    <section class="dashboard-real-orders">
                        <div class="dashboard-section-title">
                            <div>
                                <span class="dashboard-eyebrow">HISTORIQUE</span>
                                <h3>Mes dernières commandes</h3>
                            </div>
                            <button type="button" data-section="commandes">
                                Tout afficher →
                            </button>
                        </div>
                        <div class="dashboard-orders-slot"></div>
                    </section>

                    <section class="dashboard-real-address">
                        <div class="dashboard-section-title">
                            <div>
                                <span class="dashboard-eyebrow">LIVRAISON</span>
                                <h3>Mon adresse habituelle</h3>
                            </div>
                        </div>
                        <div class="dashboard-address-slot"></div>
                    </section>

                    <footer class="dashboard-footer">
                        CALI29 CLIENT SPACE <span>•</span> Votre espace personnel
                    </footer>
                </section>
            </main>
        </div>
        `;

        espace.appendChild(dashboard);

        const welcomeSlot = $(".dashboard-welcome-slot", dashboard);
        const ordersSlot = $(".dashboard-orders-slot", dashboard);
        const addressSlot = $(".dashboard-address-slot", dashboard);

        welcomeSlot.appendChild(bienvenue);
        addressSlot.appendChild(adresse);

        if (historique) {
            ordersSlot.appendChild(historique);
        }

        const logoutSlot = $(".dashboard-sidebar-logout", dashboard);

        logoutSlot.addEventListener("click", () => {
            deconnexion.click();
        });

        function afficherSection(section) {
            const sections = {
                accueil: $(".dashboard-content", dashboard),
                commandes: $(".dashboard-real-orders", dashboard),
                adresse: $(".dashboard-real-address", dashboard),
                profil: $(".dashboard-welcome-slot", dashboard)
            };

            Object.entries(sections).forEach(([nom, element]) => {
                if (element) {
                    element.classList.toggle(
                        "dashboard-section-focused",
                        nom === section
                    );
                }
            });

            dashboard.querySelectorAll("[data-section]").forEach((button) => {
                button.classList.toggle(
                    "active",
                    button.dataset.section === section
                );
            });

            const titres = {
                accueil: "Tableau de bord",
                commandes: "Mes commandes",
                adresse: "Mon adresse",
                profil: "Mon profil"
            };

            const titre = $("h2", dashboard);
            if (titre) titre.textContent = titres[section] || titres.accueil;

            if (section === "commandes") {
                $(".dashboard-real-orders", dashboard)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            if (section === "adresse") {
                $(".dashboard-real-address", dashboard)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            if (section === "profil") {
                welcomeSlot.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            if (section === "accueil") {
                $(".dashboard-content", dashboard).scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        }

        dashboard.querySelectorAll("[data-section]").forEach((button) => {
            button.addEventListener("click", () => {
                afficherSection(button.dataset.section);
            });
        });

        function actualiserIndicateurs() {
            const cartes = $$(".historique-carte", dashboard);
            const compteur = $$(".historique-carte", dashboard).length;

            const ordersStat = $('[data-stat="orders"]', dashboard);
            const pendingStat = $('[data-stat="pending"]', dashboard);
            const lastStat = $('[data-stat="last"]', dashboard);

            if (ordersStat) ordersStat.textContent = compteur;

            if (pendingStat) {
                const enCours = cartes.filter((carte) => {
                    const statut = $(".historique-statut", carte);
                    return statut &&
                        !["Terminée", "Annulée"].includes(statut.textContent.trim());
                }).length;

                pendingStat.textContent = enCours;
            }

            if (lastStat) {
                const date = $(".historique-resume-informations span", cartes[0]);

                lastStat.textContent = date
                    ? date.textContent.trim()
                    : "Aucune";
            }

            const rue = $("#adresse-rue-affichee", dashboard)?.textContent.trim();
            const ville = $("#adresse-ville-affichee", dashboard)?.textContent.trim();
            const complete = Boolean(rue && ville);

            const progress = $("#dashboard-profile-progress", dashboard);
            const bar = $("#dashboard-progress-bar", dashboard);

            if (progress) progress.textContent = complete ? "Complet" : "À compléter";
            if (bar) bar.style.width = complete ? "100%" : "45%";

            const avatar = $(".dashboard-user-avatar", dashboard);
            const pseudo = $("#compte-pseudo-connecte", dashboard)?.textContent.trim();

            if (avatar && pseudo) {
                avatar.textContent = pseudo.charAt(0).toUpperCase();
            }
        }

        const observer = new MutationObserver(actualiserIndicateurs);
        observer.observe(espace, {
            childList: true,
            subtree: true,
            characterData: true
        });

        actualiserIndicateurs();

        const interval = window.setInterval(() => {
            if (!document.body.contains(dashboard)) {
                observer.disconnect();
                window.clearInterval(interval);
                return;
            }

            actualiserIndicateurs();
        }, 1200);
    }

    function $$(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialiserDashboard);
    } else {
        initialiserDashboard();
    }

})();
