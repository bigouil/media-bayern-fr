# Guide d'intégration API pour les matchs en direct

Ce guide vous explique comment connecter votre site à des données de matchs en temps réel.

## 📋 Table des matières

1. [Options d'API disponibles](#options-dapi-disponibles)
2. [Configuration API-Football (Recommandé)](#configuration-api-football)
3. [Configuration Football-Data.org](#configuration-football-dataorg)
4. [Utilisation](#utilisation)
5. [Alternatives](#alternatives)
6. [Troubleshooting](#troubleshooting)

---

## 🌐 Options d'API disponibles

### 1. API-Football (Recommandé) ⭐

**Site:** https://www.api-football.com/

**Avantages:**
- Données en temps réel (scores, stats, compositions)
- Couverture mondiale (800+ ligues)
- Excellente documentation
- Support fiable

**Plans:**
- **Gratuit:** 100 requêtes/jour
- **Pro:** 10€/mois - 3000 requêtes/jour
- **Ultra:** 30€/mois - 30000 requêtes/jour
- **Mega:** 90€/mois - Illimité

**Limites du plan gratuit:**
- Suffisant pour développement
- ~3 requêtes/heure pour un site en production
- Recommandé: Plan Pro minimum pour production

---

### 2. Football-Data.org

**Site:** https://www.football-data.org/

**Avantages:**
- API gratuite avec limite généreuse
- Bonne couverture européenne
- Simple à utiliser

**Plans:**
- **Gratuit:** 10 requêtes/minute
- Limité à certaines compétitions

---

### 3. TheSportsDB

**Site:** https://www.thesportsdb.com/

**Avantages:**
- Gratuit pour usage personnel
- Multi-sports
- Images et logos inclus

**Inconvénients:**
- Mise à jour moins rapide
- Moins de détails

---

## 🚀 Configuration API-Football

### Étape 1 : Inscription

1. Allez sur https://www.api-football.com/
2. Créez un compte
3. Choisissez le plan gratuit (ou payant)
4. Récupérez votre clé API dans votre dashboard

### Étape 2 : Configuration du projet

1. **Créer le fichier `.env.local`** à la racine du projet :

```bash
cp .env.local.example .env.local
```

2. **Ajouter votre clé API** :

```env
FOOTBALL_API_KEY=votre_cle_api_ici
```

3. **Ajouter `.env.local` au `.gitignore`** (déjà fait normalement) :

```gitignore
.env.local
.env*.local
```

### Étape 3 : Tester l'API

Créez un script de test :

```bash
node scripts/test-api.js
```

```javascript
// scripts/test-api.js
const API_KEY = process.env.FOOTBALL_API_KEY;
const BAYERN_TEAM_ID = 157;

async function testAPI() {
  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?team=${BAYERN_TEAM_ID}&last=5`,
      {
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
      }
    );

    const data = await response.json();
    console.log('✅ API connectée avec succès!');
    console.log(`Matchs récupérés: ${data.response.length}`);
    console.log('Premier match:', data.response[0]);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testAPI();
```

### Étape 4 : Utiliser dans le site

**Remplacez le composant MatchCalendar par LiveMatchCalendar :**

```tsx
// app/matchs/page.tsx
import { LiveMatchCalendar } from "@/components/LiveMatchCalendar"; // ✅ Nouveau
// import { MatchCalendar } from "@/components/MatchCalendar"; // ❌ Ancien

export default function MatchsPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <LiveMatchCalendar />
    </div>
  );
}
```

---

## 📊 Utilisation avancée

### Afficher les matchs en direct uniquement

```tsx
"use client";
import { useEffect, useState } from "react";

export function LiveMatchWidget() {
  const [liveMatches, setLiveMatches] = useState([]);

  useEffect(() => {
    async function fetchLive() {
      const res = await fetch('/api/matches/live');
      const data = await res.json();
      setLiveMatches(data.data);
    }

    fetchLive();
    const interval = setInterval(fetchLive, 30000); // Actualiser toutes les 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {liveMatches.length > 0 ? (
        liveMatches.map(match => (
          <div key={match.id}>
            {match.homeTeam} {match.homeScore} - {match.awayScore} {match.awayTeam}
          </div>
        ))
      ) : (
        <p>Aucun match en direct</p>
      )}
    </div>
  );
}
```

### Webhook pour notifications

```typescript
// app/api/webhooks/match-events/route.ts
export async function POST(request: Request) {
  const event = await request.json();

  // Événement de but
  if (event.type === 'goal') {
    // Envoyer notification push
    // Mettre à jour le cache
    // etc.
  }

  return new Response('OK', { status: 200 });
}
```

---

## 🔄 Alternatives sans API payante

### Option 1 : Web Scraping (Attention aux conditions d'utilisation)

```typescript
// lib/scraper/bundesliga.ts
import * as cheerio from 'cheerio';

export async function scrapeBundesligaMatches() {
  const response = await fetch('https://www.bundesliga.com/en/bundesliga/matchday');
  const html = await response.text();
  const $ = cheerio.load(html);

  // Parser le HTML
  // ⚠️ Vérifiez les conditions d'utilisation du site
}
```

### Option 2 : RSS Feeds

Certains sites proposent des flux RSS :
- https://www.bundesliga.com/en/bundesliga/news?rss
- https://fcbayern.com/en/rss

### Option 3 : Google Sheets + API

1. Créer un Google Sheet avec les matchs
2. Utiliser l'API Google Sheets
3. Mettre à jour manuellement

```typescript
// lib/api/google-sheets.ts
import { google } from 'googleapis';

export async function getMatchesFromSheet() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: 'Matches!A2:H',
  });

  return response.data.values;
}
```

---

## 🗄️ Base de données locale (Recommandé pour production)

Pour éviter les limites d'API, synchronisez les données dans votre DB :

### Avec Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

```prisma
// prisma/schema.prisma
model Match {
  id           String   @id @default(cuid())
  fixtureId    Int      @unique
  homeTeam     String
  awayTeam     String
  homeScore    Int?
  awayScore    Int?
  date         DateTime
  competition  String
  stadium      String
  status       String
  isLive       Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Script de synchronisation (cron job) :**

```typescript
// scripts/sync-matches.ts
import { PrismaClient } from '@prisma/client';
import { getBayernMatches } from '@/lib/api/football-api';

const prisma = new PrismaClient();

async function syncMatches() {
  console.log('🔄 Synchronisation des matchs...');

  const matches = await getBayernMatches(2024);

  for (const match of matches) {
    await prisma.match.upsert({
      where: { fixtureId: parseInt(match.id.replace('match-', '')) },
      update: {
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: match.status,
        isLive: match.isLive || false,
      },
      create: {
        fixtureId: parseInt(match.id.replace('match-', '')),
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        date: new Date(match.date),
        competition: match.competition,
        stadium: match.stadium,
        status: match.status,
        isLive: match.isLive || false,
      },
    });
  }

  console.log(`✅ ${matches.length} matchs synchronisés`);
}

syncMatches();
```

**Cron job (toutes les 5 minutes) :**

```typescript
// app/api/cron/sync-matches/route.ts
import { syncMatches } from '@/lib/sync-matches';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  await syncMatches();
  return Response.json({ success: true });
}
```

**Vercel Cron :**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-matches",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## 🔧 Troubleshooting

### Erreur : "API Key invalid"

- Vérifiez que la clé est correcte dans `.env.local`
- Redémarrez le serveur Next.js (`npm run dev`)
- Vérifiez que votre abonnement API est actif

### Erreur : "Rate limit exceeded"

- Vous avez dépassé votre quota
- Attendez le reset (quotidien pour plan gratuit)
- Upgradez votre plan
- Implémentez un cache Redis

### Erreur : "CORS"

Si vous appelez l'API depuis le client :
```typescript
// ❌ Ne pas faire
fetch('https://v3.football.api-sports.io/...')

// ✅ Faire
fetch('/api/matches') // Passe par votre backend
```

### Performances lentes

**Solution : Redis Cache**

```bash
npm install ioredis
```

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedMatches() {
  const cached = await redis.get('bayern:matches');
  if (cached) return JSON.parse(cached);

  const matches = await getBayernMatches(2024);
  await redis.setex('bayern:matches', 300, JSON.stringify(matches)); // 5min

  return matches;
}
```

---

## 📈 Monitoring

### Surveiller votre usage API

```typescript
// lib/api/usage-tracker.ts
export async function trackAPIUsage(endpoint: string) {
  await prisma.apiUsage.create({
    data: {
      endpoint,
      timestamp: new Date(),
    },
  });
}

// Dashboard d'usage
export async function getAPIUsageToday() {
  return await prisma.apiUsage.count({
    where: {
      timestamp: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });
}
```

---

## 💡 Recommandations de production

1. **Plan API-Football Pro minimum** (10€/mois)
2. **Base de données Prisma** pour cache local
3. **Redis** pour cache en mémoire
4. **Cron job** toutes les 5 minutes
5. **Monitoring** de l'usage API
6. **Fallback** sur données locales si API down

**Coût estimé :**
- API-Football Pro : 10€/mois
- Vercel Pro (crons) : 20$/mois
- Redis (Upstash) : Gratuit jusqu'à 10k requêtes
- **Total : ~30€/mois**

---

## 🎯 Checklist de mise en production

- [ ] Clé API configurée
- [ ] Tests effectués
- [ ] Cache implémenté (DB + Redis)
- [ ] Cron jobs configurés
- [ ] Monitoring en place
- [ ] Fallback sur données locales
- [ ] Limites d'API respectées
- [ ] Documentation d'équipe créée

---

**Besoin d'aide ?** Consultez la documentation officielle :
- [API-Football Docs](https://www.api-football.com/documentation-v3)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Docs](https://www.prisma.io/docs)
