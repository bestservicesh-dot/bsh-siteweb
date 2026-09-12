# 🛠️ Guide d'Installation de l'Espace d'Administration BSH (Bénin)

Félicitations ! J'ai entièrement reconstruit l'architecture de votre site et l'ai connectée à **Decap CMS (Netlify CMS)**. 

Tous les éléments du site — y compris le portfolio, les témoignages, la FAQ, les services, les numéros de téléphone et les textes généraux — sont désormais gérés de manière dynamique via des fichiers JSON stockés dans le dossier `/data`.

Voici comment déployer cette architecture sur votre projet Vercel et configurer l'accès administrateur.

---

## 📂 Structure des fichiers créés pour vous

Les fichiers suivants ont été créés et sont prêts à être ajoutés à votre dépôt GitHub :

1.  `index.html` : La page d'accueil principale du site BSH. Elle charge dynamiquement tous ses contenus depuis les fichiers de données JSON. Si l'API est en cours de chargement ou absente, elle affiche un contenu de secours ("fallback") de haute qualité.
2.  `devis.html` : La page de formulaire de devis gratuit. Elle transmet automatiquement les demandes de devis directement sur le numéro WhatsApp de BSH, formatées de manière ultra-professionnelle.
3.  `css/style.css` : Une feuille de style CSS moderne, responsive et haut de gamme, reprenant l'identité BTP de BSH (bleu ardoise et orange/jaune chantier).
4.  `js/main.js` : Le script JavaScript qui gère la navigation mobile, l'accordéon FAQ, le filtrage dynamique du Portfolio, et le chargement en direct des fichiers de données.
5.  `admin/index.html` : La page de l'interface administrateur (accessible sur `votredomaine.com/admin/`).
6.  `admin/config.yml` : La configuration complète de Decap CMS qui structure tous les formulaires d'édition (champs textes, images, listes, étoiles, etc.).
7.  `data/` : Le dossier contenant les données initiales du site (`general.json`, `services.json`, `realisations.json`, `temoignages.json`, `faq.json`).

---

## 🚀 Étape 1 : Publier les fichiers sur votre GitHub

Pour que votre site se mette à jour, vous devez envoyer ces nouveaux fichiers sur le dépôt GitHub lié à votre projet Vercel.

1. Téléchargez ou copiez les fichiers générés dans votre espace de travail.
2. Remplacez les anciens fichiers statiques de votre projet local par ceux-ci.
3. Faites un **Git Commit** et un **Git Push** vers votre branche principale (généralement `main`) :
   ```bash
   git add .
   git commit -m "Intégration complète de Decap CMS et de l'architecture dynamique"
   git push origin main
   ```
4. **Vercel** va détecter le push et déployer automatiquement la nouvelle version du site en quelques secondes.

---

## 🔒 Étape 2 : Configurer l'authentification GitHub pour l'Admin

Puisque Decap CMS est sécurisé, il a besoin d'une autorisation pour permettre à l'administrateur d'éditer les fichiers directement sur GitHub. 

Voici la méthode standard et gratuite pour configurer cela sur Vercel :

### A. Créer une application OAuth sur GitHub
1. Connectez-vous à votre compte GitHub.
2. Allez dans **Settings** (en haut à droite de votre profil) > **Developer settings** (tout en bas à gauche) > **OAuth Apps** > **New OAuth App**.
3. Remplissez les champs comme suit :
   * **Application name :** `BSH Admin`
   * **Homepage URL :** `https://bsh-siteweb.vercel.app` (ou votre nom de domaine final)
   * **Authorization callback URL :** `https://api.netlify.com/auth/done` (si vous utilisez le service tiers gratuit Netlify, ou l'URL de votre passerelle OAuth).
4. Cliquez sur **Register application**.
5. Copiez le **Client ID** et générez un **Client Secret** (notez-les précieusement).

### B. Associer un service d'authentification (OAuth Provider)
Puisque le CMS s'exécute uniquement dans le navigateur, il a besoin d'un serveur tiers pour finaliser l'authentification GitHub. Vous avez deux options gratuites :

#### Option 1 : Utiliser un serveur d'authentification Vercel en un clic (Recommandé)
Vous pouvez déployer une mini-fonction Vercel gratuite pour gérer cela en cliquant sur le modèle pré-configuré :
[Déployer GitHub OAuth Provider sur Vercel](https://github.com/vencax/netlify-cms-github-oauth-provider)
* Lors du déploiement, Vercel vous demandera de saisir deux variables d'environnement :
  * `OAUTH_CLIENT_ID` : (votre Client ID de l'étape A)
  * `OAUTH_CLIENT_SECRET` : (votre Client Secret de l'étape A)
* Une fois déployé, notez l'URL de ce micro-service (ex : `https://mon-oauth-bsh.vercel.app`).
* Mettez à jour votre fichier `admin/config.yml` avec l'URL de votre micro-service d'authentification :
  ```yaml
  backend:
    name: github
    repo: VOTRE_PSEUDO_GITHUB/VOTRE_DEPOT  # Ex: bsh-btp/siteweb
    branch: main
    base_url: https://mon-oauth-bsh.vercel.app # URL de votre micro-service Vercel
  ```

---

## 📝 Comment utiliser l'interface Administrateur au quotidien ?

Une fois que vous avez configuré l'authentification :

1. Allez sur `https://votre-site.vercel.app/admin/`.
2. Cliquez sur le bouton **"Login with GitHub"** (Se connecter avec GitHub).
3. Saisissez vos identifiants GitHub.
4. Vous arrivez sur votre tableau de bord BSH :
   *   **📞 Contact & Accueil :** Modifiez instantanément les numéros de téléphone, emails, liens WhatsApp, les chiffres de statistiques (ex: 150+ projets), les textes d'introduction.
   *   **🏗️ Gestion des Services :** Changez les icônes, les titres ou les descriptions des 14 services.
   *   **📷 Portfolio & Réalisations :** Ajoutez un nouveau chantier, choisissez sa catégorie, saisissez la ville (Cotonou, Calavi) et **téléversez la photo du chantier**. Le CMS va stocker automatiquement l'image dans le dépôt et l'afficher sur le site !
   *   **💬 Témoignages :** Ajoutez ou supprimez des avis de clients, attribuez-leur des étoiles (de 1 à 5).
   *   **❓ FAQ :** Ajoutez de nouvelles questions-réponses pour vos clients béninois.
5. Cliquez sur le bouton vert **"Publish"** (Publier) en haut à droite.
6. **Magique :** Vercel se met au travail en arrière-plan. En moins de 30 secondes, le site public se met à jour pour tous vos visiteurs partout dans le monde !
