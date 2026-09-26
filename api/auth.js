// api/auth.js
// Micro-service d'authentification GitHub pour Decap CMS sur Vercel
export default function handler(req, res) {
  const client_id = process.env.OAUTH_CLIENT_ID;
  const redirect_uri = `https://${req.headers.host}/api/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&redirect_uri=${redirect_uri}`;
  
  // Rediriger l'administrateur vers l'écran d'autorisation GitHub
  res.redirect(githubAuthUrl);
}
