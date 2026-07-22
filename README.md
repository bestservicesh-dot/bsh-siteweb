# 🏗️ BSH - Best Services and House — Site Web v2.0
## Guide de déploiement

---

## 📁 Structure du site

```
bsh-site/
├── index.html                  ← Page d'accueil
├── services/
│   ├── index.html              ← Liste de tous les services
│   ├── construction-batiment.html
│   ├── renovation.html
│   ├── etancheite.html
│   ├── reparation-toiture.html
│   ├── peinture-decoration.html
│   ├── carrelage.html
│   ├── pavage-assainissement.html
│   ├── reparation-fissures.html
│   ├── isolation.html
│   └── entretien-nettoyage.html
├── realisations.html           ← Portfolio
├── a-propos.html               ← Page à propos
├── devis.html                  ← Formulaire de devis
├── contact.html                ← Page contact
├── blog/
│   ├── index.html              ← Liste des articles
│   └── cout-construction-benin-2026.html  ← Article exemple
├── mentions-legales.html       ← Mentions légales
├── css/
│   └── style.css               ← Feuille de styles
├── js/
│   └── main.js                 ← JavaScript
├── images/                     ← Dossier images (à remplir)
├── sitemap.xml                 ← Sitemap pour Google
├── robots.txt                  ← Configuration robots
└── README.md                   ← Ce fichier
```

---

## 🚀 Déploiement sur Vercel

### Méthode 1 : Via le dashboard Vercel (la plus simple)

1. Connectez-vous sur [vercel.com](https://vercel.com)
2. Cliquez sur **"New Project"**
3. Choisissez **"Import from..."** → Uploadez le contenu du ZIP
4. Framework Preset : **Other**
5. ⚠️ **Important** — dans "Build and Output Settings", configure :
   - **Build Command** : `node build-content.js`
   - **Output Directory** : laisse vide (ou `.`)
   - **Root Directory** : le dossier `bsh-site` (si le zip garde ce dossier parent)
   
   Ce "Build Command" est ce qui permet au panneau d'administration (voir
   section CMS ci-dessous) de réellement mettre à jour le contenu affiché
   sur le site à chaque modification.
6. Clique sur **"Deploy"**
7. Configure ton domaine personnalisé `bestservicesandhouse.site`

⚠️ Si tu réutilises un projet Vercel qui hébergeait auparavant une autre
version du site (React/Vite), les anciens réglages de build ne
correspondent plus du tout à ce site statique — je recommande de créer un
**nouveau projet Vercel** dédié à ce site pour éviter toute confusion.

### Méthode 2 : Via GitHub + Vercel

1. Créez un repository GitHub avec le contenu du ZIP
2. Sur Vercel, importez le repository
3. Le déploiement se fera automatiquement à chaque push

### Méthode 3 : Via Vercel CLI

```bash
npm i -g vercel
cd bsh-site
vercel --prod
```

---

## 🔄 Comment fonctionne le panneau admin (important à comprendre)

Le panneau `/admin` (Decap CMS) permet d'éditer témoignages, FAQ,
réalisations, services et paramètres généraux **sans toucher au code**.
Voici le circuit complet :

```
Toi (admin) → modifie un témoignage → Decap CMS enregistre un fichier
dans content/ → commit automatique sur GitHub → Vercel détecte le commit
et redéploie → "node build-content.js" régénère content/data/*.json →
le site affiche le nouveau contenu (via js/content-loader.js)
```

**Deux prérequis indispensables pour que ce circuit fonctionne :**

### 1. Le site doit être sur GitHub (pas juste un zip uploadé)

Pour que Decap CMS puisse enregistrer tes modifications, le code doit
vivre dans un vrai repository GitHub, et Vercel doit être connecté à ce
repo (import GitHub, pas "upload zip" — voir Méthode 2 plus haut). Sinon,
tes modifications via l'admin n'auront tout simplement nulle part où
s'enregistrer.

1. Crée un repository sur [github.com](https://github.com) (gratuit),
   ex : `bsh-site`
2. Pousse le contenu de ce dossier dedans
3. Dans `admin/config.yml`, remplace `VOTRE-USERNAME/bsh-site` par le nom
   réel de ton repo (ex : `jean-dupont/bsh-site`)
4. Sur Vercel, importe ce repo GitHub (au lieu d'un zip) — chaque
   modification via l'admin déclenchera alors un redéploiement automatique

### 2. Authentification de l'admin (OAuth)

Decap CMS a besoin d'un service d'authentification pour te laisser te
connecter à `/admin`. La configuration actuelle (`base_url:
https://api.netlify.com`) utilise le service d'authentification gratuit de
Netlify — **même si le site n'est pas hébergé chez Netlify**, tu peux
utiliser gratuitement cette brique :

1. Crée un compte gratuit sur [netlify.com](https://netlify.com)
2. Crée un nouveau site Netlify, en important **le même repo GitHub**
   (uniquement pour l'authentification — le vrai site continue de tourner
   sur Vercel, ce site Netlify ne sert qu'à te connecter à l'admin)
3. Dans ce site Netlify → **Site configuration → Identity** → active
   Identity, puis active le fournisseur **Git Gateway**
4. Retourne sur `https://TON-DOMAINE/admin`, connecte-toi — ça devrait
   maintenant fonctionner

C'est une configuration à faire une seule fois. Si une étape bloque,
montre-moi le message d'erreur exact.

## 🔧 Configuration post-déploiement

### 1. Domaine personnalisé
- Dans Vercel → Settings → Domains
- Ajoutez `bestservicesandhouse.site` et `www.bestservicesandhouse.site`
- Configurez les DNS chez votre registrar

### 2. Google Analytics (à ajouter)
Ajoutez avant `</head>` dans chaque page :
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 3. Google Search Console
- Inscrivez-vous sur [search.google.com/search-console](https://search.google.com/search-console)
- Ajoutez votre site
- Soumettez le sitemap : `https://www.bestservicesandhouse.site/sitemap.xml`

### 4. Google Business Profile (CRUCIAL)
- Créez votre fiche sur [business.google.com](https://business.google.com)
- Remplissez toutes les informations
- Ajoutez des photos de vos réalisations
- Demandez des avis à vos clients

---

## 📸 Images à remplacer

Les placeholders SVG doivent être remplacés par de vraies photos :

| Fichier | Description | Taille recommandée |
|---------|-------------|-------------------|
| `images/og-image.jpg` | Image partage réseaux sociaux | 1200x630px |
| `images/hero-batiment.jpg` | Photo hero page d'accueil | 1200x627px |
| `images/about-equipe.jpg` | Photo équipe BSH | 800x600px |
| `images/realisations/*.jpg` | Photos des projets | 800x600px |
| `images/temoignages/*.jpg` | Photos clients | 200x200px |
| `images/blog/*.jpg` | Images articles blog | 800x400px |

**Format recommandé** : WebP (avec fallback JPG)
**Compression** : Utilisez [squoosh.app](https://squoosh.app) ou [tinypng.com](https://tinypng.com)

---

## 📝 Configuration formulaire

Le formulaire actuel affiche un message de succès mais n'envoie pas réellement d'email. Pour le connecter :

### Option A : Formspree (gratuit jusqu'à 50 soumissions/mois)
1. Inscrivez-vous sur [formspree.io](https://formspree.io)
2. Récupérez votre endpoint
3. Modifiez le formulaire : `<form action="https://formspree.io/f/VOTRE_ID" method="POST">`

### Option B : EmailJS (gratuit jusqu'à 200 emails/mois)
1. Inscrivez-vous sur [emailjs.com](https://emailjs.com)
2. Configurez un service email
3. Intégrez le SDK dans le JS

### Option C : Backend custom
Développez une API (Node.js, PHP...) qui reçoit les soumissions et envoie un email.

---

## 📱 Réseaux sociaux — À créer

| Plateforme | URL à configurer | Priorité |
|------------|-----------------|----------|
| Facebook | facebook.com/BSHBenin | 🔴 Haute |
| Instagram | instagram.com/bsh_benin | 🔴 Haute |
| LinkedIn | linkedin.com/company/bsh-benin | 🟠 Moyenne |
| TikTok | tiktok.com/@bsh_benin | 🟡 Basse |
| YouTube | youtube.com/@BSHBenin | 🟡 Basse |

---

## 📧 Email professionnel

Remplacez `bestservices.h@gmail.com` par `contact@bestservicesandhouse.site`.

**Options :**
- Zoho Mail (gratuit pour 1 utilisateur)
- Google Workspace (5€/mois/utilisateur)
- Microsoft 365 (5€/mois/utilisateur)

---

## 🔐 Sécurité

Le site est actuellement un site statique (HTML/CSS/JS), donc la surface d'attaque est minimale. Recommandations :

- ✅ Activez HTTPS (Vercel le fait automatiquement)
- ✅ Ajoutez des headers de sécurité (Vercel → Settings → Headers)
- ✅ Ne déployez JAMAIS d'espace admin sur un site statique
- ✅ Utilisez un captcha sur les formulaires (reCAPTCHA v3 recommandé)

### Headers de sécurité à ajouter dans Vercel :
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "X-XSS-Protection", "value": "1; mode=block"},
        {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"},
        {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()"}
      ]
    }
  ]
}
```

---

## ✅ Checklist pré-lancement

- [ ] Remplacer les images placeholder par de vraies photos
- [ ] Créer une fiche Google Business Profile
- [ ] Installer Google Analytics 4
- [ ] Soumettre le sitemap dans Google Search Console
- [ ] Configurer l'email professionnel
- [ ] Créer les pages réseaux sociaux
- [ ] Connecter le formulaire à un service d'envoi d'email
- [ ] Tester le site sur mobile et tablette
- [ ] Vérifier tous les liens
- [ ] Ajouter un captcha sur les formulaires
- [ ] Vérifier les performances avec PageSpeed Insights

---

## 📈 Prochaines étapes

1. **Semaine 1** : Déployer le site + Google Business + Analytics
2. **Semaine 2-4** : Ajouter les vraies photos + créer les réseaux sociaux
3. **Mois 2** : Publier 2-4 articles de blog SEO
4. **Mois 3** : Lancer des campagnes Google Ads locales

---

*Site développé le 20 juillet 2026 — BSH v2.0*
