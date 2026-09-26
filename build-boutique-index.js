// build-boutique-index.js — exécuté par Vercel à chaque déploiement
// Scanne data/boutique/*.json et génère data/boutique/index.json
// Ainsi chaque nouveau produit ajouté via l'Admin s'affiche automatiquement.
const fs   = require('fs');
const path = require('path');
const dir  = path.join(__dirname, 'data', 'boutique');
const out  = path.join(dir, 'index.json');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json').sort();
const products = [];
for (const f of files) {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
    if (d.published !== false) products.push(d.id || f.replace('.json',''));
  } catch(e) { console.warn('skip', f, e.message); }
}
fs.writeFileSync(out, JSON.stringify({ _comment:'Auto-généré', products }, null, 2));
console.log('✅ boutique/index.json:', products.length, 'produit(s):', products.join(', '));
