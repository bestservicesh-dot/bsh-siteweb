/*
 * resolution-auto.js
 * Resolution automatique INTELLIGENTE des conflits Git.
 *
 * Regles appliquees a chaque bloc de conflit :
 *   1. Une des deux versions est vide      -> garde l'autre
 *   2. Une version CONTIENT l'autre        -> garde la plus complete
 *      (ex: meme texte + une phrase en plus, comme le communique KkiaPay)
 *   3. Variantes ligne par ligne           -> garde la version qui a
 *      toutes les lignes de l'autre + des lignes en plus
 *   4. Les deux versions sont vraiment differentes (ex: deux codes
 *      distincts)                           -> CONFLIT LAISSE EN PLACE,
 *      signale pour verification manuelle.
 *
 * Securite :
 *   - Sauvegarde de chaque fichier modifie dans .backup-conflits/
 *   - Validation automatique des fichiers .json apres correction
 *   - Aucun `git add/commit` : vous gardez le controle
 *
 * Utilisation :
 *   node resolution-auto.js             mode intelligent (recommande)
 *   node resolution-auto.js --force=head      force la version A partout
 *   node resolution-auto.js --force=incoming  force la version B partout
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FORCE = (() => {
  const arg = process.argv.find((a) => a.startsWith('--force='));
  return arg ? arg.split('=')[1] : null; // 'head' | 'incoming' | null
})();

const BACKUP_DIR = '.backup-conflits';

function getConflictedFiles() {
  try {
    return execSync('git grep -l -E "^(<{7}|>{7})"', { encoding: 'utf8' })
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

/* Supprime ponctuation JSON/JS/HTML + espaces pour comparer les contenus */
function clean(lines) {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/['",;`{}()[\]\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* Une version "contient" l'autre : memes lignes communes dans l'ordre,
   avec des lignes supplementaires d'un cote. */
function lineSuperset(longer, shorter) {
  const L = longer.map((l) => l.trim()).filter(Boolean);
  const S = shorter.map((l) => l.trim()).filter(Boolean);
  if (L.length < S.length) return false;
  let i = 0;
  for (let j = 0; j < L.length && i < S.length; j++) {
    if (L[j] === S[i]) i++;
  }
  return i === S.length;
}

/*
 * Renvoie :
 *   'head'      -> garder la version A
 *   'incoming'  -> garder la version B
 *   null        -> impossible de decider automatiquement
 */
function decide(head, incoming) {
  if (FORCE === 'head') return 'head';
  if (FORCE === 'incoming') return 'incoming';

  const headEmpty = head.every((l) => l.trim() === '');
  const incEmpty = incoming.every((l) => l.trim() === '');
  if (headEmpty && !incEmpty) return 'incoming';
  if (incEmpty && !headEmpty) return 'head';
  if (headEmpty && incEmpty) return 'head';

  const cH = clean(head);
  const cI = clean(incoming);

  // Cas 2 : une version textuelle est le prefixe strict de l'autre
  if (cH.length > cI.length && cH.startsWith(cI)) return 'head';
  if (cI.length > cH.length && cI.startsWith(cH)) return 'incoming';

  // Cas 3 : lignes communes + lignes en plus
  if (lineSuperset(head, incoming) && !lineSuperset(incoming, head)) return 'head';
  if (lineSuperset(incoming, head) && !lineSuperset(head, incoming)) return 'incoming';

  return null;
}

function backup(file) {
  const dest = path.join(BACKUP_DIR, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(file, dest);
}

const files = getConflictedFiles();
if (files.length === 0) {
  console.log('Aucun conflit restant. Rien a faire.');
  process.exit(0);
}

console.log(
  FORCE
    ? `!!! Mode FORCE = ${FORCE} : la version ${FORCE === 'head' ? 'A (HEAD)' : 'B (3fdbb6d)'} sera gardee partout !!!\n`
    : 'Mode intelligent.\n'
);

const stillManual = {};
let auto = 0;
let modifiedFiles = 0;

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  const out = [];
  let i = 0;
  let changed = false;
  let manual = 0;
  let blockNo = 0;

  while (i < lines.length) {
    if (/^<{7}(?: .*)?$/.test(lines[i])) {
      blockNo++;
      const startLine = i + 1;
      const markerStart = lines[i];
      i++;
      const head = [];
      while (i < lines.length && !/^={7}\s*$/.test(lines[i])) {
        head.push(lines[i]);
        i++;
      }
      i++; // =======
      const incoming = [];
      while (i < lines.length && !/^>{7}(?: .*)?$/.test(lines[i])) {
        incoming.push(lines[i]);
        i++;
      }
      const markerEnd = lines[i];
      i++;

      const choice = decide(head, incoming);
      if (choice === 'head') {
        out.push(...head);
        changed = true;
        auto++;
      } else if (choice === 'incoming') {
        out.push(...incoming);
        changed = true;
        auto++;
      } else {
        out.push(markerStart, ...head, '=======', ...incoming, markerEnd);
        manual++;
      }
    } else {
      out.push(lines[i]);
      i++;
    }
  }

  if (changed) {
    backup(file);
    fs.writeFileSync(file, out.join(eol));
    modifiedFiles++;
    console.log(`[RESOLU] ${file} (${blockNo - manual}/${blockNo} bloc(x))`);

    // Validation des fichiers JSON
    if (file.endsWith('.json')) {
      try {
        JSON.parse(fs.readFileSync(file, 'utf8'));
        console.log(`         -> JSON valide OK`);
      } catch (e) {
        console.log(`         -> !!! ERREUR JSON apres correction : ${e.message}`);
      }
    }
  }
  if (manual > 0) {
    stillManual[file] = manual;
    console.log(`[MANUEL] ${file} - ${manual} bloc(x) vraiment differents`);
  }
}

console.log(`\n${auto} bloc(x) resolu(s) dans ${modifiedFiles} fichier(s).`);
console.log(`Sauvegardes dans le dossier "${BACKUP_DIR}/" (a supprimer une fois tout valide).`);

const restants = Object.keys(stillManual);
if (restants.length) {
  console.log('\n=== BLOCS VRAIMENT DIFFERENTS A VERIFIER A LA MAIN ===');
  for (const f of restants) console.log(`  - ${f} (${stillManual[f]} bloc(x))`);
  console.log('\nRelancez "node extraire-conflits.js" et collez-moi le fichier genere.');
} else {
  console.log('\nTous les conflits sont resolus. Verifications recommandees :');
  console.log('  git grep -n -E "^(<{7}|>{7})"     (ne doit rien afficher)');
  console.log('  npm run dev                        (testez le site)');
  console.log('Puis : git add -A && git commit -m "fix: resolution conflits" && git push');
}
