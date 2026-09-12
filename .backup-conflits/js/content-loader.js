/* ============================================================
   content-loader.js — connecte le contenu édité via l'admin
   (content/data/*.json, généré par build-content.js) aux pages
   du site. Chargé sur toutes les pages.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  loadTestimonials();
  loadFAQ();
  loadRealisations();
});

async function fetchJSON(path) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // on garde silencieusement le contenu statique déjà présent
  }
}

// --- Paramètres généraux : téléphone, email, réseaux sociaux, hero, stats ---
async function loadSettings() {
  const settings = await fetchJSON("/content/data/settings.json");
  if (!settings) return;

  const { general, stats, hero, social } = settings;

  // Téléphone / email / WhatsApp, sur TOUTES les pages (top-bar, footer...)
  if (general) {
    document.querySelectorAll('[data-field="phone"]').forEach((el) => {
      if (general.phone) {
        el.textContent = general.phone;
        el.href = `tel:${general.phone.replace(/[\s\-]/g, "")}`;
      }
    });
    document.querySelectorAll('[data-field="email"]').forEach((el) => {
      if (general.email) {
        el.textContent = general.email;
        el.href = `mailto:${general.email}`;
      }
    });
    document.querySelectorAll('[data-field="address"]').forEach((el) => {
      if (general.address) el.textContent = `📍 ${general.address}`;
    });
    document.querySelectorAll('[data-field="whatsapp-link"]').forEach((el) => {
      if (general.whatsapp) {
        const url = new URL(el.href);
        url.pathname = `/${general.whatsapp}`;
        el.href = url.toString();
      }
    });
  }

  // Chiffres clés (page d'accueil)
  if (stats) {
    const map = {
      projects: document.querySelector('[data-stat="projects"]'),
      years: document.querySelector('[data-stat="years"]'),
      satisfaction: document.querySelector('[data-stat="satisfaction"]'),
      team: document.querySelector('[data-stat="team"]'),
    };
    if (map.projects && stats.projects) map.projects.dataset.count = stats.projects;
    if (map.years && stats.years) map.years.textContent = `${stats.years} ans`;
    if (map.satisfaction && stats.satisfaction) map.satisfaction.dataset.count = stats.satisfaction;
    if (map.team && stats.team) map.team.dataset.count = stats.team;
  }

  // Texte du hero (page d'accueil)
  if (hero) {
    const badge = document.querySelector("[data-hero-badge]");
    const title = document.querySelector("[data-hero-title]");
    const description = document.querySelector("[data-hero-description]");
    if (badge && hero.badge) badge.lastChild.textContent = " " + hero.badge;
    if (title && hero.title && hero.highlight) {
      const highlighted = hero.title.replace(
        hero.highlight,
        `<span>${hero.highlight}</span>`
      );
      title.innerHTML = highlighted;
    }
    if (description && hero.description) description.textContent = hero.description;
  }

  // Réseaux sociaux (icônes déjà présentes, on met juste à jour les liens)
  if (social) {
    Object.entries(social).forEach(([platform, url]) => {
      if (!url) return;
      document
        .querySelectorAll(`[data-social="${platform}"]`)
        .forEach((el) => (el.href = url));
    });
  }
}

// --- Témoignages (page d'accueil) ---
async function loadTestimonials() {
  const container = document.querySelector("[data-testimonials-grid]");
  if (!container) return;

  const testimonials = await fetchJSON("/content/data/temoignages.json");
  // Si le fichier n'existe pas encore ou est vide, on garde le contenu
  // statique déjà présent dans la page (meilleur pour le SEO au 1er chargement).
  if (!testimonials || testimonials.length === 0) return;

  container.innerHTML = testimonials
    .map(
      (t) => `
      <div class="testimonial-card fade-up">
        <div class="testimonial-stars">${"★".repeat(t.rating || 5)}</div>
        <p class="testimonial-text">"${escapeHTML(t.testimonial)}"</p>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${escapeHTML(t.initials || "")}</div>
          <div class="testimonial-info">
            <strong>${escapeHTML(t.name)}</strong>
            <span>${escapeHTML(t.role || "")}</span>
          </div>
        </div>
      </div>`
    )
    .join("");

  // Les nouvelles cartes doivent réapparaître en fondu comme les autres.
  container.querySelectorAll(".fade-up").forEach((el) => el.classList.add("visible"));
}

// --- FAQ (page d'accueil) ---
async function loadFAQ() {
  const container = document.querySelector("[data-faq-list]");
  if (!container) return;

  const faq = await fetchJSON("/content/data/faq.json");
  if (!faq || faq.length === 0) return;

  container.innerHTML = faq
    .map(
      (item) => `
      <div class="faq-item fade-up">
        <div class="faq-question">
          <span>${escapeHTML(item.question)}</span>
          <span class="faq-toggle">+</span>
        </div>
        <div class="faq-answer">
          <div class="faq-answer-inner">${escapeHTML(item.answer)}</div>
        </div>
      </div>`
    )
    .join("");

  container.querySelectorAll(".fade-up").forEach((el) => el.classList.add("visible"));
  // main.js utilise la délégation d'évènement sur .faq-list, donc les
  // nouveaux éléments injectés fonctionnent automatiquement (voir main.js).
}

// --- Réalisations (page réalisations.html) ---
async function loadRealisations() {
  const container = document.querySelector("[data-portfolio-grid]");
  if (!container) return;

  const realisations = await fetchJSON("/content/data/realisations.json");
  // Tant qu'aucune vraie réalisation n'a été ajoutée via l'admin, on garde
  // les exemples illustrés déjà présents dans la page.
  if (!realisations || realisations.length === 0) return;

  container.innerHTML = realisations
    .map(
      (r) => `
      <div class="portfolio-item fade-up">
        ${
          r.image
            ? `<img src="${escapeAttr(r.image)}" alt="${escapeAttr(r.title)}" loading="lazy" style="width:100%;height:300px;object-fit:cover;">`
            : `<div style="width:100%;height:300px;background:#E2E8F0;"></div>`
        }
        <div class="portfolio-overlay">
          <h4>${escapeHTML(r.title)}</h4>
          <span>${escapeHTML(r.type || "")} — ${escapeHTML(r.location || "")}, ${escapeHTML(String(r.year || ""))}</span>
        </div>
      </div>`
    )
    .join("");

  container.querySelectorAll(".fade-up").forEach((el) => el.classList.add("visible"));
}

function escapeHTML(str) {
  if (str == null) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

function escapeAttr(str) {
  return escapeHTML(str).replace(/"/g, "&quot;");
}
