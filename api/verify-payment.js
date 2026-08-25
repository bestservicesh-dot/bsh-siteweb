/**
 * ============================================================
 *  /api/verify-payment.js  —  FONCTION SERVERLESS VERCEL
 *  Vérification SÉCURISÉE d'un paiement KkiaPay (anti-fraude)
 * ============================================================
 *
 *  👉 DÉPLOIEMENT : placez ce fichier dans le dossier `api/` de votre
 *     projet Vercel à la RACINE (même niveau que index.html).
 *     Route finale : https://www.bestservicesandhouse.site/api/verify-payment
 *
 *  Cette fonction s'exécute sur le SERVEUR : elle ne communique JAMAIS vos
 *  clés privée/ secrète au navigateur.
 *
 *  ⚠️  Aucune dépendance à installer : Vercel exécute Node 18+, `fetch` est natif.
 *
 *  CONFIGURATION : ci-dessous (section "CLÉS KKIAPAY"). Vous pouvez soit
 *  coller vos clés directement ici, soit utiliser les variables
 *  d'environnement Vercel : KKIA_PUBLIC_KEY, KKIA_PRIVATE_KEY,
 *  KKIA_SECRET_KEY, KKIA_SANDBOX.
 */

// ============ CLÉS KKIAPAY (à renseigner) ============
// La clé PUBLIQUE peut figurer ici (elle est déjà visible dans le site).
// La clé PRIVÉE et la clé SECRÈTE ne doivent JAMAIS être dans le navigateur.
//
//  ⚠️ ATTENTION : les deux clés ci-dessous (tpk_ / tsk_) sont des clés de
//     TEST (sandbox). Pour ce faire, KKIA_SANDBOX doit rester à true.
//     Pour encaisser de VRAIS paiements, remplacez-les par vos clés de
//     PRODUCTION (sans préfixe « t ») et passez KKIA_SANDBOX à false.
const KKIA_PUBLIC_KEY  = process.env.KKIA_PUBLIC_KEY  || '951b57308db511f1af94251966ede9f1';
const KKIA_PRIVATE_KEY = process.env.KKIA_PRIVATE_KEY || 'tpk_951b7e408db511f1af94251966ede9f1';
const KKIA_SECRET_KEY  = process.env.KKIA_SECRET_KEY  || 'tsk_951b7e418db511f1af94251966ede9f1';
// true = mode test (sandbox), false = production (paiements réels)
// ⚠️ Défaut = true (test), car vos clés actuelles sont des clés de test.
//    Pour encaisser de VRAIS paiements : passez à false.
const KKIA_SANDBOX     = (process.env.KKIA_SANDBOX === undefined)
                          ? true
                          : (process.env.KKIA_SANDBOX === 'true');
// ======================================================

const LIVE_BASE    = 'https://api.kkiapay.me';
const SANDBOX_BASE = 'https://api-sandbox.kkiapay.me';
const STATUS_PATH  = '/api/v1/transactions/status';

// URL du site (pour CORS)
const SITE_URL = process.env.SITE_URL || 'https://www.bestservicesandhouse.site';

export default async function handler(req, res) {
  // ---- CORS ----
  res.setHeader('Access-Control-Allow-Origin', SITE_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // ---- Paramètre : identifiant de transaction ----
  const transactionId =
    req.query?.transaction_id || req.query?.transactionId ||
    req.body?.transactionId || '';

  if (!transactionId) {
    return res.status(400).json({ success: false, error: 'transaction_id manquant' });
  }

  // ---- Vérifier que les clés sont bien renseignées ----
  if (KKIA_PRIVATE_KEY.includes('PASTEZ') || KKIA_SECRET_KEY.includes('PASTEZ')) {
    return res.status(500).json({
      success: false,
      error: 'Clés privée/secrète KkiaPay non configurées. Ouvrez api/verify-payment.js et renseignez-les.',
    });
  }

  const base = KKIA_SANDBOX ? SANDBOX_BASE : LIVE_BASE;

  try {
    const resp = await fetch(base + STATUS_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':    KKIA_PUBLIC_KEY,
        'x-private-key': KKIA_PRIVATE_KEY,
        'x-secret-key':  KKIA_SECRET_KEY,
      },
      body: JSON.stringify({ transactionId }),
      // On limite le temps d'attente
      signal: AbortSignal.timeout(15000),
    });

    const data = await resp.json();
    const status = data?.status || null;
    const amount = typeof data?.amount === 'number' ? data.amount : null;

    // ✅ Succès SEULEMENT si KkiaPay confirme status == SUCCESS.
    //    (On pourrait aussi vérifier que amount correspond au montant attendu.)
    const success = status === 'SUCCESS';

    console.log(`[verify] ${transactionId} -> ${status} | amount=${amount}`);

    return res.status(200).json({
      success,
      verified: success,
      transactionId: data?.transactionId || transactionId,
      status,
      amount,
      currency: data?.currency || null,
      source: data?.source_common_name || data?.source || null,
      fees: data?.fees ?? null,
      income: data?.income ?? null,
      client: data?.client || null,
      reason: data?.reason || null,
    });
  } catch (err) {
    console.error('[verify] Erreur:', err);
    return res.status(200).json({
      success: false,
      verified: false,
      error: err?.message || 'Impossible de contacter le serveur KkiaPay.',
      transactionId,
    });
  }
}
