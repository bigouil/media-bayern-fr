# 📊 Configuration de la Base de Données - Media Bayern

Guide complet pour configurer et gérer la base de données des actualités automatisées.

---

## 🎯 Vue d'ensemble

Votre site utilise maintenant **Prisma** avec **SQLite** (facilement migrable vers PostgreSQL) pour gérer les actualités en temps réel.

### Fonctionnalités

✅ **Actualités automatiques** via flux RSS
✅ **Base de données** avec Prisma ORM
✅ **API REST** complète (CRUD)
✅ **Panneau d'administration** simple
✅ **Catégories et tags** dynamiques
✅ **Système de publication** (publié/brouillon)
✅ **Articles en vedette** pour la homepage
✅ **Compteur de vues** automatique

---

## 📦 Installation

### 1. Installer les dépendances

```bash
npm install
```

Nouvelles dépendances ajoutées :
- `@prisma/client` - Client Prisma
- `prisma` - CLI Prisma (dev dependency)
- `rss-parser` - Parser RSS
- `turndown` - Convertisseur HTML → Markdown

### 2. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer la base de données (SQLite)
npm run db:push

# Peupler avec des données initiales
npm run db:seed
```

**Résultat attendu :**
```
✅ 6 catégories créées
✅ 9 tags créés
✅ 3 articles de démonstration
✅ 3 flux RSS configurés
```

### 3. Synchroniser les actualités RSS

```bash
npm run rss:sync
```

Cette commande récupère automatiquement les dernières actualités Bayern depuis plusieurs sources fiables.

---

## 🗄️ Structure de la base de données

### Tables principales

**Article**
- `id` : Identifiant unique
- `title` : Titre de l'article
- `slug` : URL-friendly (ex: "bayern-champion-2025")
- `excerpt` : Résumé court
- `content` : Contenu complet (Markdown)
- `coverImage` : URL de l'image
- `published` : Publié (true) ou brouillon (false)
- `featured` : À la une (true/false)
- `views` : Nombre de vues
- `author` : Auteur
- `source` : Source (RSS, manuel, etc.)
- `sourceUrl` : URL source
- `publishedAt` : Date de publication
- `categoryId` : Lien vers Category

**Category**
- `id`, `name`, `slug`, `description`
- `color` : Couleur (#E21C2A)
- `icon` : Emoji (📰, ⚽, etc.)

**Tag**
- `id`, `name`, `slug`

**ArticleTag** (liaison many-to-many)
- Relie articles ↔ tags

**RSSFeed**
- `id`, `name`, `url`
- `active` : Actif (true/false)
- `lastFetch` : Dernière récupération

---

## 🔄 Synchronisation RSS automatique

### Sources RSS configurées

1. **FC Bayern Official** - Site officiel du club
2. **Bundesliga News** - Actualités Bundesliga
3. **Sky Sports Bayern** - Actualités internationales

### Fonctionnement

Le script `scripts/sync-rss.js` :
1. Récupère les flux RSS
2. Filtre uniquement les articles Bayern (mots-clés)
3. Convertit HTML → Markdown
4. Extrait les images
5. Évite les doublons (vérifie le slug)
6. Associe catégories et tags
7. Sauvegarde dans la base de données

### Commande manuelle

```bash
npm run rss:sync
```

### Automatisation (Production)

#### Option 1 : Cron job (serveur Linux)

```bash
# Éditer le crontab
crontab -e

# Ajouter (synchronisation toutes les heures)
0 * * * * cd /path/to/media-bayern-fr && npm run rss:sync
```

#### Option 2 : Vercel Cron Jobs

Créer `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-rss",
      "schedule": "0 * * * *"
    }
  ]
}
```

Créer `app/api/cron/sync-rss/route.ts` :

```typescript
import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function GET(request: Request) {
  // Vérifier le token de sécurité Vercel
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Exécuter le script de sync
  exec('npm run rss:sync', (error, stdout, stderr) => {
    console.log(stdout);
    if (error) console.error(error);
  });

  return NextResponse.json({ success: true });
}
```

Ajouter dans `.env` :
```env
CRON_SECRET=your-secret-token-here
```

#### Option 3 : GitHub Actions

Créer `.github/workflows/sync-rss.yml` :

```yaml
name: Sync RSS Feeds

on:
  schedule:
    - cron: '0 * * * *'  # Toutes les heures
  workflow_dispatch:      # Déclenchement manuel

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run db:generate
      - run: npm run rss:sync
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 🎨 Panneau d'administration

Accédez à : **http://localhost:3000/admin**

### Fonctionnalités

- **📊 Statistiques** : Total, publiés, brouillons
- **🔄 Filtres** : Tous / Publiés / Brouillons
- **⭐ Vedette** : Mettre/retirer de la une
- **📝 Publier/Dépublier** : Contrôler la visibilité
- **👁️ Voir** : Prévisualiser l'article
- **🗑️ Supprimer** : Supprimer définitivement

### ⚠️ Sécurité

Le panneau d'administration est actuellement **sans authentification**.

**Pour la production, ajoutez :**

#### NextAuth.js (Recommandé)

```bash
npm install next-auth
```

`app/api/auth/[...nextauth]/route.ts` :

```typescript
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Vérifier les identifiants
        if (
          credentials?.username === process.env.ADMIN_USERNAME &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", name: "Admin" };
        }
        return null;
      }
    })
  ]
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

Dans `app/admin/page.tsx` :

```typescript
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  // Reste du code...
}
```

---

## 🔗 API REST

Toutes les routes API sont disponibles :

### Articles

```bash
# Lister tous les articles (avec filtres)
GET /api/articles?page=1&limit=10&category=actualites&search=bayern

# Récupérer un article
GET /api/articles/[slug]

# Créer un article
POST /api/articles
Body: { title, slug, content, categorySlug, tags, published, featured }

# Mettre à jour un article
PUT /api/articles/[slug]
Body: { title, content, published, featured, ... }

# Supprimer un article
DELETE /api/articles/[slug]
```

### Catégories

```bash
# Lister toutes les catégories
GET /api/categories
```

### Tags

```bash
# Lister tous les tags
GET /api/tags
```

### Exemples avec curl

```bash
# Récupérer les 5 derniers articles
curl http://localhost:3000/api/articles?limit=5

# Récupérer un article spécifique
curl http://localhost:3000/api/articles/bayern-champion-2025

# Créer un nouvel article
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "slug": "test-article",
    "content": "Contenu de test",
    "published": true
  }'
```

---

## 🚀 Migration vers PostgreSQL

SQLite est parfait pour le développement, mais pour la production, migrez vers PostgreSQL.

### 1. Créer une base PostgreSQL

**Vercel Postgres :**
```bash
npm i -g vercel
vercel postgres create
```

**Railway :**
```bash
railway login
railway add
railway postgres
```

**Supabase :**
1. Créer un projet sur supabase.com
2. Récupérer la connexion string

### 2. Mettre à jour Prisma

`prisma/schema.prisma` :

```prisma
datasource db {
  provider = "postgresql"  // ← Changé de "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. Mettre à jour .env

```env
# PostgreSQL (exemple Vercel)
DATABASE_URL="postgresql://user:password@host.postgres.vercel-storage.com/db?sslmode=require"
```

### 4. Migrer

```bash
# Créer la migration
npm run db:migrate

# Peupler les données
npm run db:seed

# Synchroniser les RSS
npm run rss:sync
```

---

## 🎬 Scripts npm disponibles

```bash
# Base de données
npm run db:generate   # Générer le client Prisma
npm run db:push       # Créer/mettre à jour la DB (dev)
npm run db:migrate    # Migration (production)
npm run db:studio     # Interface visuelle Prisma
npm run db:seed       # Peupler avec des données

# RSS
npm run rss:sync      # Synchroniser les flux RSS

# Développement
npm run dev           # Serveur de développement
npm run build         # Build de production
npm run start         # Serveur de production
```

---

## 🗂️ Prisma Studio

Interface graphique pour gérer votre base de données :

```bash
npm run db:studio
```

Ouvre **http://localhost:5555** avec :
- Vue de toutes les tables
- Édition des données
- Requêtes SQL
- Import/Export

---

## 🐛 Dépannage

### Erreur : "Can't reach database server"

**SQLite :**
```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

**PostgreSQL :**
Vérifiez la connexion string dans `.env`

### Erreur : "Table does not exist"

```bash
npm run db:generate
npm run db:push
```

### Articles RSS ne s'importent pas

1. Vérifiez les flux RSS :
```bash
curl https://fcbayern.com/de/news.rss
```

2. Activez les logs :
```bash
NODE_ENV=development npm run rss:sync
```

3. Testez avec un seul flux :
Éditez `scripts/sync-rss.js` et commentez les autres sources

### Performances lentes

**SQLite (dev) :**
- Normal pour >1000 articles
- Migrez vers PostgreSQL

**PostgreSQL :**
- Ajoutez des index :
```sql
CREATE INDEX idx_articles_published ON "Article"("published");
CREATE INDEX idx_articles_featured ON "Article"("featured");
```

---

## 📊 Monitoring

### Vérifier le nombre d'articles

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.article.count().then(count => {
  console.log('Total articles:', count);
  prisma.\$disconnect();
});
"
```

### Dernière synchronisation RSS

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.rSSFeed.findMany().then(feeds => {
  feeds.forEach(f => console.log(f.name, ':', f.lastFetch));
  prisma.\$disconnect();
});
"
```

---

## 🎯 Checklist de mise en production

- [ ] Migrer vers PostgreSQL
- [ ] Configurer les variables d'environnement production
- [ ] Ajouter l'authentification au panneau admin
- [ ] Configurer un cron job pour la sync RSS
- [ ] Optimiser les images (CDN)
- [ ] Ajouter des sauvegardes automatiques de la DB
- [ ] Mettre en place un monitoring (Sentry, etc.)
- [ ] Tester les performances (>1000 articles)
- [ ] Configurer le cache Redis (optionnel)
- [ ] Ajouter des webhooks pour les notifications

---

## 📚 Ressources

- **Prisma Docs** : https://www.prisma.io/docs
- **RSS Parser** : https://github.com/rbren/rss-parser
- **NextAuth.js** : https://next-auth.js.org/
- **Vercel Postgres** : https://vercel.com/docs/storage/vercel-postgres
- **Railway** : https://railway.app/
- **Supabase** : https://supabase.com/

---

## ✅ Résumé rapide

```bash
# Installation complète
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run rss:sync

# Démarrer le site
npm run dev

# Accéder au panneau admin
open http://localhost:3000/admin

# Synchroniser les actualités (manuel)
npm run rss:sync

# Interface visuelle de la DB
npm run db:studio
```

---

**🎉 Votre site a maintenant des actualités automatiques en temps réel !**
