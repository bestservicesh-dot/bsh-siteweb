// api/callback.js
// Retour d'autorisation de GitHub et échange du code contre un Access Token
export default async function handler(req, res) {
  const code = req.query.code;
  const client_id = process.env.OAUTH_CLIENT_ID;
  const client_secret = process.env.OAUTH_CLIENT_SECRET;

  if (!code) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send(`
      <html>
        <body>
          <script>
            window.opener.postMessage("authorization:github:error:Code d'autorisation manquant", "*");
            window.close();
          </script>
        </body>
      </html>
    `);
  }

  try {
    // Échanger le code temporaire contre un jeton d'accès (access_token)
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code
      })
    });

    const data = await response.json();

    if (data.error) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(400).send(`
        <html>
          <body>
            <script>
              window.opener.postMessage('authorization:github:error:' + '${data.error_description || 'Erreur GitHub'}', '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    const token = data.access_token;
    const content = JSON.stringify({
      token: token,
      provider: 'github'
    });

    // Envoyer le jeton d'accès sécurisé à l'interface d'administration
    // Correction de la syntaxe JS pour éviter la collision de guillemets
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
      <html>
        <body>
          <script>
            (function() {
              function receiveMessage(e) {
                // Envoyer les infos d'autorisation à l'onglet parent (Decap CMS)
                window.opener.postMessage('authorization:github:success:' + '${content}', e.origin);
              }
              window.addEventListener("message", receiveMessage, false);
              window.opener.postMessage("authorizing:github", "*");
            })();
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(500).send(`
      <html>
        <body>
          <script>
            window.opener.postMessage('authorization:github:error:' + '${error.message}', '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  }
}
