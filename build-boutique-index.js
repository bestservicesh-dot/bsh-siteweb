#!/usr/bin/env node
/**
 * BSH — Générateur automatique de l'index de la boutique
 * Exécuté par Vercel à chaque déploiement (buildCommand dans vercel.json)
 * Scanne data/boutique/*.json et génère data/boutique/index.json
 * Ainsi tout nouveau produit ajouté via l'Admin s'affiche automatiquement.
 */
const fs   = require('fs');
const path = require('path');

const DIR   = path.join(__dirname, 'data', 'boutique');
const INDEX = path.join(DIR, 'index.json');

try {
  const files = fs.readdirSync(DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json')
    .sort();

  const products = [];
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf-8'));
      const id   = data.id || file.replace('.json', '');
      if (data.published !== false) {
        products.push(id);
      }
    } catch (e) {
      console.warn(`  skip ${file}: ${e.message}`);
    }
  }

  fs.writeFileSync(INDEX, JSON.stringify({
    _comment:  "Auto-généré par build-boutique-index.js — ne pas modifier manuellement",
    generated: new Date().toISOString(),
    count:     products.length,
    products
  }, null, 2));

  console.log(`✅ boutique/index.json : ${products.length} produit(s) → ${products.join(', ')}`);
} catch (err) {
  console.error('❌ Erreur build boutique index:', err.message);
  process.exit(1);
}
