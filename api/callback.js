// api/callback.js
// Échange du code OAuth GitHub contre un access_token pour Decap CMS
export default async function handler(req, res) {
  const code          = req.query.code;
  const client_id     = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET;

  // ── Erreur : code manquant ──────────────────────────────────────
  if (!code) {
    return res.status(400).send(buildScript('error', "Code d'autorisation manquant"));
  }

  if (!client_id || !client_secret) {
    return res.status(500).send(buildScript('error', 'Variables OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET manquantes sur Vercel'));
  }

  try {
    // ── Échange code → access_token ─────────────────────────────────
    const ghRes = await fetch('https://github.com/login/oauth/access_token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify({ client_id, client_secret, code }),
    });

    const data = await ghRes.json();

    if (data.error || !data.access_token) {
      const msg = data.error_description || data.error || 'Erreur GitHub inconnue';
      return res.status(400).send(buildScript('error', msg));
    }

    // ── Succès : envoyer le token à Decap CMS ───────────────────────
    // On sérialise proprement puis on encode en base64 pour éviter
    // tout conflit de guillemets dans le JS généré
    const payload = Buffer.from(JSON.stringify({
      token:    data.access_token,
      provider: 'github',
    })).toString('base64');

    return res.status(200).send(buildScript('success', payload, true));

  } catch (err) {
    return res.status(500).send(buildScript('error', err.message || 'Erreur serveur'));
  }
}

// ── Helper : génère la page HTML qui postMessage vers Decap CMS ──
function buildScript(status, payloadOrMsg, isBase64 = false) {
  let jsCode;

  if (status === 'success') {
    // Décoder le base64 côté client pour reconstruire le JSON proprement
    jsCode = `
      (function() {
        var raw     = atob(${JSON.stringify(payloadOrMsg)});
        var content = JSON.parse(raw);
        var msg     = 'authorization:github:success:' + JSON.stringify(content);
        function send(e) {
          window.opener.postMessage(msg, e.origin);
        }
        window.addEventListener('message', send, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    `;
  } else {
    jsCode = `
      (function() {
        var msg = 'authorization:github:error:' + ${JSON.stringify(payloadOrMsg)};
        window.opener.postMessage(msg, '*');
        window.close();
      })();
    `;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body><script>${jsCode}<\/script></body></html>`;
}
