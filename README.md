# SAKHO GROUP — application mobile

- `mobile/` : application Expo (SDK 58, expo-router, TypeScript)
- `api/` : API sur Vercel (fonctions `api/*.ts`) + Postgres Neon (`db/schema.sql`)

## Prérequis

Node 22 (via nvm : `nvm use 22`). Le `node` d'Anaconda (v6) est trop ancien.

## API (Vercel + Neon)

En local, avec un Postgres Docker :

```bash
docker run -d --name sakho-pg -e POSTGRES_PASSWORD=sakho -e POSTGRES_DB=sakho -p 127.0.0.1:54329:5432 postgres:17-alpine
cd api
cp .env.example .env   # DATABASE_URL=postgres://postgres:sakho@127.0.0.1:54329/sakho
npm install
npm run migrate        # applique db/schema.sql (rejouable)
npm run sync           # récupère les publications des 5 sites
npm run dev            # http://localhost:3001/api/publications
```

En production :

1. Importer le dossier `api/` comme projet Vercel.
2. Storage > Neon : crée la base et ajoute `DATABASE_URL` au projet.
3. Ajouter `CRON_SECRET` (chaîne aléatoire) dans les variables du projet.
4. `vercel env pull .env` puis `npm run migrate` pour créer les tables sur Neon.

Synchro des sites : cron quotidien (`vercel.json`, limite du plan gratuit) et, en plus,
rafraîchissement automatique en arrière-plan quand l'app lit des publications et que la
dernière synchro a plus de 15 minutes.

Routes : `GET /api/publications?site=&rubrique=actualite,voyage&limite=20`, `GET /api/sites`,
`GET /api/cron/sync` (protégée).

## Application

```bash
cd mobile
cp .env.example .env   # EXPO_PUBLIC_API_URL (IP de l'ordinateur pour un téléphone)
npm install
npx expo start
```

## Les 5 sites

| Site | Technologie | Ce que l'app récupère |
| --- | --- | --- |
| seneinfo.net | WordPress | 10 derniers articles (actualité) |
| almadinatravel.net | WordPress (permaliens désactivés → `?rest_route=`) | Offres Omra/Hajj (rubrique voyage) |
| almadinauniversity.com | Moodle | Cours de l'accueil public, avec image, et vidéo de présentation |
| icfaonline.com | Moodle | Cours de l'accueil public (sans image) |
| tijanizawiya.com | GoDaddy Website Builder | Rien pour l'instant (page unique sans blog) ; le blog GoDaddy (`/f.rss`) sera lu automatiquement s'il est ajouté |
