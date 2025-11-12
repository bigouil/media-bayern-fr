# 🚀 Démarrage Rapide - Actualités Automatiques

Guide ultra-rapide pour mettre en place le système d'actualités automatisées.

---

## ⚡ Installation en 5 minutes

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer la base de données
npm run db:generate
npm run db:push

# 3. Peupler avec des données initiales
npm run db:seed

# 4. Importer les actualités RSS
npm run rss:sync

# 5. Démarrer le site
npm run dev
```

Ouvrez http://localhost:3000/admin pour gérer vos articles !

---

## 📋 Ce qui a été installé

### 🗄️ Base de données
- **Prisma** : ORM moderne pour TypeScript
- **SQLite** : Base de données locale (facile à migrer vers PostgreSQL)
- **4 tables** : Articles, Categories, Tags, ArticleTags, RSSFeeds

### 📡 Agrégation RSS
- **3 sources configurées** :
  - FC Bayern Official
  - Bundesliga News
  - Sky Sports Bayern
- **Import automatique** avec filtrage Bayern
- **Conversion HTML → Markdown**

### 🎨 Interface d'administration
- **Panneau admin** : `/admin`
- Publier/dépublier articles
- Mettre en vedette
- Gérer catégories et tags
- Statistiques en temps réel

### 🔌 API REST complète
- `GET /api/articles` - Liste des articles
- `GET /api/articles/[slug]` - Article spécifique
- `POST /api/articles` - Créer un article
- `PUT /api/articles/[slug]` - Modifier un article
- `DELETE /api/articles/[slug]` - Supprimer un article
- `GET /api/categories` - Liste des catégories
- `GET /api/tags` - Liste des tags

---

## 🎯 Utilisation quotidienne

### Synchroniser les actualités

```bash
# Manuellement
npm run rss:sync

# Automatiquement (ajoutez un cron job)
# Toutes les heures : 0 * * * * cd /path/to/project && npm run rss:sync
```

### Gérer les articles

1. Allez sur http://localhost:3000/admin
2. Cliquez sur "Publier" pour rendre un article visible
3. Cliquez sur ⭐ pour le mettre en vedette sur la homepage
4. Cliquez sur "Voir" pour prévisualiser

### Voir les actualités sur le site

- Homepage : http://localhost:3000 (articles en vedette)
- Toutes les actus : http://localhost:3000/actualites
- Article spécifique : http://localhost:3000/article/[slug]

---

## 🛠️ Commandes utiles

```bash
# Base de données
npm run db:studio      # Interface graphique Prisma (localhost:5555)
npm run db:generate    # Régénérer le client Prisma
npm run db:push        # Appliquer les changements au schéma

# RSS
npm run rss:sync       # Synchroniser les flux RSS

# Développement
npm run dev            # Serveur de développement
npm run build          # Build de production
npm run start          # Serveur de production
```

---

## 📊 Structure des fichiers

```
media-bayern-fr/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   └── dev.db                 # Base SQLite (ignorée par Git)
│
├── lib/
│   ├── prisma.ts              # Client Prisma singleton
│   └── services/
│       └── rss-aggregator.ts  # Service d'agrégation RSS
│
├── app/
│   ├── api/
│   │   ├── articles/          # Routes API articles
│   │   ├── categories/        # Routes API catégories
│   │   └── tags/              # Routes API tags
│   ├── admin/                 # Panneau d'administration
│   └── actualites/            # Page des actualités
│
├── scripts/
│   ├── sync-rss.js            # Script de synchronisation RSS
│   └── seed-db.js             # Script de peuplement initial
│
└── docs/
    ├── DATABASE_SETUP.md      # Documentation complète
    └── QUICK_START.md         # Ce fichier
```

---

## 🔧 Configuration

### Variables d'environnement (.env.local)

```env
# Base de données
DATABASE_URL="file:./dev.db"

# API Football-Data.org
FOOTBALL_DATA_API_TOKEN=your_token_here

# Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🎨 Personnalisation

### Ajouter une source RSS

Éditez `lib/services/rss-aggregator.ts` :

```typescript
export const RSS_SOURCES = [
  // ... sources existantes
  {
    name: 'Nouvelle Source',
    url: 'https://example.com/rss',
    category: 'Actualités',
    enabled: true,
  },
];
```

Puis lancez :
```bash
npm run rss:sync
```

### Ajouter une catégorie

Éditez `scripts/seed-db.js` :

```javascript
const CATEGORIES = [
  // ... catégories existantes
  {
    name: 'Jeunes',
    slug: 'jeunes',
    description: 'Actualités de l\'équipe réserve',
    color: '#0066B2',
    icon: '🌟',
  },
];
```

Puis lancez :
```bash
npm run db:seed
```

---

## 🚀 Déploiement en production

### 1. Migrer vers PostgreSQL

Voir [DATABASE_SETUP.md](./DATABASE_SETUP.md#-migration-vers-postgresql)

### 2. Configurer les variables d'environnement

Sur Vercel/Netlify/Railway :
```env
DATABASE_URL=postgresql://...
FOOTBALL_DATA_API_TOKEN=...
NEXT_PUBLIC_SITE_URL=https://votre-site.com
```

### 3. Déployer

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# Railway
railway up
```

### 4. Peupler la base de données

```bash
# Localement, en production
DATABASE_URL="postgresql://..." npm run db:seed
DATABASE_URL="postgresql://..." npm run rss:sync
```

### 5. Automatiser la synchronisation RSS

Voir [DATABASE_SETUP.md](./DATABASE_SETUP.md#automatisation-production)

Options :
- **Vercel Cron Jobs** (recommandé pour Vercel)
- **GitHub Actions** (gratuit)
- **Cron job serveur** (si VPS)

---

## 🐛 Problèmes fréquents

### "Can't reach database server"

```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### "Module not found: Can't resolve '@/lib/prisma'"

```bash
npm run db:generate
```

### Aucun article ne s'affiche

1. Vérifiez que la DB contient des articles :
```bash
npm run db:studio
# Ouvrez la table Article
```

2. Synchronisez les RSS :
```bash
npm run rss:sync
```

3. Vérifiez que les articles sont publiés :
- Allez sur http://localhost:3000/admin
- Cliquez sur "Publier" pour chaque article

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Configuration complète
- [Prisma Docs](https://www.prisma.io/docs) - Documentation Prisma
- [RSS Parser](https://github.com/rbren/rss-parser) - Documentation RSS Parser

---

## ✅ Checklist de vérification

- [ ] `npm install` exécuté avec succès
- [ ] `npm run db:generate` exécuté
- [ ] `npm run db:push` exécuté
- [ ] `npm run db:seed` exécuté
- [ ] `npm run rss:sync` exécuté
- [ ] `npm run dev` démarre sans erreur
- [ ] http://localhost:3000/admin accessible
- [ ] http://localhost:3000/actualites affiche des articles
- [ ] La page /admin permet de publier/dépublier

---

## 🎉 Prochaines étapes

1. **Personnalisez les sources RSS** pour vos besoins
2. **Ajoutez l'authentification** au panneau admin (NextAuth.js)
3. **Migrez vers PostgreSQL** pour la production
4. **Automatisez la synchronisation** avec un cron job
5. **Optimisez les images** avec un CDN (Cloudinary, imgix)
6. **Ajoutez des notifications** (Discord, Slack) pour les nouveaux articles

---

**🚀 Votre site a maintenant des actualités automatiques !**

Pour toute question, consultez la [documentation complète](./DATABASE_SETUP.md).
