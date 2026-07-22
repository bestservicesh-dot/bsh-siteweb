#!/usr/bin/env node
/**
 * build-content.js
 * ============================================================================
 * Ce script transforme le contenu édité via le panneau admin (Decap CMS),
 * stocké sous forme de fichiers Markdown/JSON dans content/, en fichiers
 * JSON prêts à être consommés par le site (dans content/data/).
 *
 * Il tourne automatiquement à chaque déploiement Vercel (voir la
 * configuration "Build Command" recommandée dans le README).
 *
 * Aucune dépendance externe : parsing "front matter" fait à la main, car
 * le format utilisé ici est volontairement simple (une valeur par ligne).
 * ============================================================================
 */

const fs = require("fs");
const path = require("path");

const CONTENT_DIR = path.join(__dirname, "content");
const OUTPUT_DIR = path.join(CONTENT_DIR, "data");

function parseFrontMatterValue(raw) {
  const trimmed = raw.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  // Chaîne entre guillemets ("...") : on retire les guillemets et on
  // dé-échappe les \" internes.
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"');
  }
  return trimmed;
}

// Parse un fichier au format :
// ---
// cle: "valeur"
// autre_cle: 5
// ---
// (corps markdown optionnel après le second ---)
function parseMarkdownFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;

  const [, frontMatterBlock, body] = match;
  const data = {};

  frontMatterBlock.split(/\r?\n/).forEach((line) => {
    const lineMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!lineMatch) return;
    const [, key, value] = lineMatch;
    data[key] = parseFrontMatterValue(value);
  });

  data.body = body.trim();
  return data;
}

function readCollection(folderName) {
  const folderPath = path.join(CONTENT_DIR, folderName);
  if (!fs.existsSync(folderPath)) return [];

  return fs
    .readdirSync(folderPath)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const parsed = parseMarkdownFile(path.join(folderPath, f));
      if (!parsed) return null;
      return { ...parsed, slug: f.replace(/\.md$/, "") };
    })
    .filter((entry) => entry && entry.published !== false);
}

function readJsonSafe(filePath, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return fallback;
  }
}

function build() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // --- Témoignages ---
  const temoignages = readCollection("temoignages");
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "temoignages.json"),
    JSON.stringify(temoignages, null, 2)
  );

  // --- FAQ (triée par le champ "order") ---
  const faq = readCollection("faq").sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999)
  );
  fs.writeFileSync(path.join(OUTPUT_DIR, "faq.json"), JSON.stringify(faq, null, 2));

  // --- Réalisations (les plus récentes en premier) ---
  const realisations = readCollection("realisations").sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "realisations.json"),
    JSON.stringify(realisations, null, 2)
  );

  // --- Services (descriptions éditables) ---
  const services = readCollection("services");
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "services.json"),
    JSON.stringify(services, null, 2)
  );

  // --- Paramètres du site : on fusionne les 4 fichiers en un seul objet ---
  const settings = {
    general: readJsonSafe(path.join(CONTENT_DIR, "settings/general.json")),
    stats: readJsonSafe(path.join(CONTENT_DIR, "settings/stats.json")),
    hero: readJsonSafe(path.join(CONTENT_DIR, "settings/hero.json")),
    social: readJsonSafe(path.join(CONTENT_DIR, "settings/social.json")),
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "settings.json"),
    JSON.stringify(settings, null, 2)
  );

  console.log(
    `✅ Contenu généré : ${temoignages.length} témoignage(s), ${faq.length} question(s) FAQ, ` +
      `${realisations.length} réalisation(s), ${services.length} service(s).`
  );
}

build();
