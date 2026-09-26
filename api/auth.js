// api/auth.js
// Authentification GitHub OAuth pour Decap CMS — BSH Best Services and House
export default function handler(req, res) {
  const client_id    = process.env.OAUTH_CLIENT_ID;
  const redirect_uri = 'https://www.bestservicesandhouse.site/api/callback';

  if (!client_id) {
    return res.status(500).send('Erreur configuration : OAUTH_CLIENT_ID manquant sur Vercel.');
  }

  const url = 'https://github.com/login/oauth/authorize'
    + '?client_id='    + encodeURIComponent(client_id)
    + '&scope=repo,user'
    + '&redirect_uri=' + encodeURIComponent(redirect_uri);

  res.redirect(url);
}
