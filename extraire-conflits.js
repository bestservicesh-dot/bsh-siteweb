/*
 * extraire-conflits.js
 * Extrait tous les conflits Git restants, regroupes par CONTENU IDENTIQUE,
 * dans un seul fichier : conflits-restants.txt
 * Collez-moi ensuite le contenu de ce fichier.
 *
 * Utilisation :
 *   node extraire-conflits.js
 */

const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

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

const files = getConflictedFiles();
const CONTEXT = 4;
const groups = new Map(); // cle = hash du contenu du conflit
let total = 0;

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let i = 0;
  let blockIndex = 0;

  while (i < lines.length) {
    if (/^<{7}[ ]/.test(lines[i])) {
      blockIndex++;
      total++;
      const start = i;
      const head = [];
      i++;
      while (i < lines.length && !/^={7}$/.test(lines[i])) {
        head.push(lines[i]);
        i++;
      }
      i++; // ligne =======
      const incoming = [];
      while (i < lines.length && !/^>{7}[ ]/.test(lines[i])) {
        incoming.push(lines[i]);
        i++;
      }
      const end = i;
      i++;

      const ctxBefore = lines.slice(Math.max(0, start - CONTEXT), start);
      const ctxAfter = lines.slice(end + 1, end + 1 + CONTEXT);

      const key = crypto
        .createHash('md5')
        .update(head.join('\n') + '\u0000' + incoming.join('\n'))
        .digest('hex');

      if (!groups.has(key)) {
        groups.set(key, {
          head,
          incoming,
          ctxBefore,
          ctxAfter,
          occurrences: [],
        });
      }
      groups.get(key).occurrences.push(`${file} (conflit n°${blockIndex}, lignes ~${start + 1}-${end + 1})`);
    } else {
      i++;
    }
  }
}

if (total === 0) {
  console.log('Aucun conflit restant !');
} else {
  const report = [];
  let n = 0;
  for (const g of groups.values()) {
    n++;
    report.push(
      [
        '================================================================',
        `CONFLIT TYPE N°${n}  —  apparait ${g.occurrences.length} fois`,
        'Fichier(s) concerne(s) :',
        ...g.occurrences.map((o) => '  • ' + o),
        '----------------------------------------------------------------',
        'CONTEXTE AVANT (1ere occurrence) :',
        ...g.ctxBefore.map((l) => '  | ' + l),
        '----------------------------------------------------------------',
        'VERSION A — VOTRE BRANCHE (HEAD) :',
        ...g.head.map((l) => 'A | ' + l),
        '----------------------------------------------------------------',
        'VERSION B — BRANCHE 3fdbb6d (boutique / KkiaPay / pubs) :',
        ...g.incoming.map((l) => 'B | ' + l),
        '----------------------------------------------------------------',
        'CONTEXTE APRES (1ere occurrence) :',
        ...g.ctxAfter.map((l) => '  | ' + l),
        '================================================================',
        '',
      ].join('\n')
    );
  }

  const header = `SYNTHESE : ${total} bloc(x) de conflit, ${groups.size} type(s) distinct(s), dans ${files.length} fichier(s).\n\n`;
  fs.writeFileSync('conflits-restants.txt', header + report.join('\n'), 'utf8');
  console.log(`${total} conflit(s) -> ${groups.size} type(s) distinct(s) dans ${files.length} fichier(s).`);
  console.log('-> Ouvrez "conflits-restants.txt" et collez-moi tout son contenu.');
}
