/*
 * resolve-conflits.js
 * Resolution automatique des conflits Git "unilateraux" :
 *  - cote HEAD vide      -> on garde le contenu entrant (3fdbb6d)
 *  - cote entrante vide  -> on garde le contenu HEAD
 * Les conflits ou les DEUX cotes contiennent du texte sont LAISSES en place
 * et listes a la fin pour resolution manuelle.
 *
 * Utilisation (a la racine du projet, dans Git Bash ou PowerShell) :
 *   node resolve-conflits.js
 */

const fs = require('fs');
const { execSync } = require('child_process');

function getConflictedFiles() {
  try {
    return execSync('git grep -l -E "^(<{7}|>{7})"', { encoding: 'utf8' })
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (e) {
    // git grep renvoie un code d'erreur s'il ne trouve rien
    return [];
  }
}

const files = getConflictedFiles();

if (files.length === 0) {
  console.log('Aucun fichier contenant des marqueurs de conflit. Tout est propre.');
  process.exit(0);
}

console.log(`Fichiers avec conflits detectes : ${files.length}\n`);

let autoResolved = 0;
const manual = {};

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'; // on conserve le type de saut de ligne
  const lines = raw.split(/\r?\n/);
  const out = [];
  let i = 0;
  let changed = false;
  let manualInFile = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^<{7}[ ]/.test(line)) {
      const startMarker = line;
      i++;

      const head = [];
      while (i < lines.length && !/^={7}$/.test(lines[i])) {
        head.push(lines[i]);
        i++;
      }
      if (i >= lines.length) {
        out.push(line); // marqueur isole : on ne touche pas
        continue;
      }
      const separator = lines[i];
      i++;

      const incoming = [];
      while (i < lines.length && !/^>{7}[ ]/.test(lines[i])) {
        incoming.push(lines[i]);
        i++;
      }
      if (i >= lines.length) {
        out.push(line);
        continue;
      }
      const endMarker = lines[i];
      i++;

      const headEmpty = head.every((l) => l.trim() === '');
      const incomingEmpty = incoming.every((l) => l.trim() === '');

      if (headEmpty && !incomingEmpty) {
        // Ajout provenant de la branche 3fdbb6d
        out.push(...incoming);
        changed = true;
        autoResolved++;
      } else if (incomingEmpty && !headEmpty) {
        // Contenu uniquement dans HEAD
        out.push(...head);
        changed = true;
        autoResolved++;
      } else {
        // Les deux cotes ont du contenu : resolution manuelle requise
        out.push(startMarker, ...head, separator, ...incoming, endMarker);
        manualInFile++;
      }
    } else {
      out.push(line);
      i++;
    }
  }

  if (changed) {
    fs.writeFileSync(file, out.join(eol));
    console.log(`[AUTO] ${file} - conflits simples resoluts`);
  }
  if (manualInFile > 0) {
    manual[file] = manualInFile;
    console.log(`[MANUEL] ${file} - ${manualInFile} bloc(x) a resoudre a la main`);
  }
}

console.log(`\n${autoResolved} bloc(x) de conflit resolu(s) automatiquement.`);
const remaining = Object.keys(manual);
if (remaining.length > 0) {
  console.log('\n=== FICHIERS A RESOUDRE MANUELLEMENT ===');
  for (const f of remaining) console.log(`  - ${f} (${manual[f]} bloc(x))`);
  console.log('\nOuvrez ces fichiers, choisissez le contenu a garder, puis');
  console.log('relancez : git grep -n -E "^(<{7}|>{7})"  (ne doit plus rien afficher)');
} else {
  console.log('\nAucun conflit restant. Verifiez le site, puis :');
  console.log('  git add -A && git commit -m "fix: resolution conflits fusion" && git push');
}
