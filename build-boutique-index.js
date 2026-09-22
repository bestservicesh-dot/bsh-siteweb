#!/usr/bin/env node
/**
 * BTIK-PRO / BSH — Générateur automatique de l'index de la boutique
 * 
 * Ce script est exécuté par Vercel à chaque déploiement (via vercel.json)
 * Il scanne data/boutique/*.json et génère data/boutique/index.json
 * 
 * Usage: node build-boutique-index.js
 */

const fs   = require('fs');
const path = require('path');

const BOUTIQUE_DIR = path.join(__dirname, 'data', 'boutique');
const INDEX_FILE   = path.join(BOUTIQUE_DIR, 'index.json');

try {
  // Lire tous les fichiers JSON du dossier boutique
  const files = fs.readdirSync(BOUTIQUE_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json')
    .sort();

  // Construire la liste des IDs produits
  const products = [];
  const productsData = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(BOUTIQUE_DIR, file), 'utf-8');
      const data    = JSON.parse(content);
      const id      = data.id || file.replace('.json', '');

      // Ne lister que les produits publiés
      if (data.published !== false) {
        products.push(id);
        productsData.push({
          id,
          title:    data.title    || '',
          category: data.category || '',
          price:    data.price    || 0,
          published: data.published !== false,
        });
      }
    } catch (e) {
      console.warn(`  ⚠️  Skipping invalid JSON: ${file} — ${e.message}`);
    }
  }

  // Écrire l'index
  const index = {
    generated:    new Date().toISOString(),
    count:        products.length,
    products,
    summary:      productsData,
  };

  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');

  console.log(`✅ index.json généré — ${products.length} produit(s) publié(s):`);
  products.forEach(id => console.log(`   - ${id}`));

} catch (err) {
  console.error('❌ Erreur génération index boutique:', err.message);
  process.exit(1);
}
