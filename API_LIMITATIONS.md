# ⚠️ Limitations du plan gratuit API-Football

## 🔴 Problème rencontré

Le **plan gratuit** de API-Football a des limitations importantes qui empêchent l'utilisation en temps réel :

### Limitations détectées

1. ❌ **Saisons limitées** : Uniquement 2021-2023 (pas de saison 2024-2025)
2. ❌ **Paramètre "last"** : Non disponible (impossible de récupérer les derniers matchs)
3. ❌ **Paramètre "live"** : Peut être limité selon le plan
4. ✅ **Paramètre "next"** : Disponible (prochains matchs)
5. ✅ **100 requêtes/jour** : Suffisant pour le développement

---

## 💡 Solutions

### Option 1 : Mode Hybride (Actuel) ✅

Le code est configuré pour utiliser :
- **Données locales** (JSON) en fallback
- **API** quand disponible pour les saisons 2021-2023

```typescript
// Le code tombe automatiquement sur les données locales si l'API échoue
if (matches.length === 0) {
  const matchesData = await import('@/lib/data/matches.json');
  matches = matchesData.default;
}
```

**Avantages :**
- ✅ Fonctionne immédiatement
- ✅ Pas de coût
- ✅ Bon pour le développement

**Inconvénients :**
- ❌ Données non actualisées automatiquement
- ❌ Nécessite mise à jour manuelle du JSON

---

### Option 2 : Upgrader vers Plan Pro 💰

**Prix :** 10€/mois

**Ce que vous obtenez :**
- ✅ Saisons 2024-2025 en temps réel
- ✅ Paramètres "last" et "live" disponibles
- ✅ 3000 requêtes/jour (vs 100)
- ✅ Support prioritaire

**Lien :** https://dashboard.api-football.com/pricing

---

### Option 3 : Alternative gratuite - Football-Data.org

**API :** https://www.football-data.org/

**Avantages :**
- ✅ Gratuit avec bonnes limites (10 req/min)
- ✅ Saisons récentes disponibles
- ✅ Bonnes données européennes

**Inconvénients :**
- ❌ Moins de ligues couvertes
- ❌ Mises à jour moins fréquentes

**Configuration :**

```typescript
// lib/api/football-data.ts
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';
const BAYERN_TEAM_ID = 5; // ID différent

async function fetchFromAPI(endpoint: string) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'X-Auth-Token': API_KEY,
    },
  });
  return response.json();
}

export async function getBayernMatches() {
  const data = await fetchFromAPI(`/teams/${BAYERN_TEAM_ID}/matches`);
  return data.matches;
}
```

**Inscription :** https://www.football-data.org/client/register

---

### Option 4 : Mise à jour manuelle optimisée 📝

Si vous restez sur le plan gratuit, voici un workflow efficace :

**1. Script de mise à jour hebdomadaire**

```bash
# scripts/update-matches.sh
#!/bin/bash

echo "📥 Mise à jour des matchs..."

# Récupérer les données depuis une source (ex: RSS, scraping autorisé, ou saisie manuelle)
# Mettre à jour lib/data/matches.json

echo "✅ Matchs mis à jour!"
```

**2. Automatisation GitHub Actions**

```yaml
# .github/workflows/update-matches.yml
name: Update Matches Weekly

on:
  schedule:
    - cron: '0 9 * * 1' # Tous les lundis à 9h
  workflow_dispatch: # Manuel aussi

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Update matches
        run: ./scripts/update-matches.sh
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add lib/data/matches.json
          git commit -m "🔄 Update matches data" || echo "No changes"
          git push
```

---

## 🎯 Recommandation

### Pour le développement immédiat
✅ **Utilisez le mode hybride actuel** (données locales + API en fallback)

### Pour la production
🚀 **Passez au plan Pro** (10€/mois) pour :
- Données en temps réel
- Meilleure expérience utilisateur
- Scores live

### Budget limité
🆓 **Football-Data.org** comme alternative gratuite

---

## 📝 État actuel de votre configuration

Votre site fonctionne avec :

```
├── Données locales (matches.json) ✅
├── API-Football plan gratuit ⚠️
│   └── Limité à saisons 2021-2023
└── Fallback automatique ✅
```

**Pour tester :**

1. **Avec données locales :**
```bash
npm run dev
# Visitez http://localhost:3000/matchs
# ✅ Devrait afficher les matchs du JSON
```

2. **Avec API (saison 2023) :**
```bash
# Modifiez LiveMatchCalendar.tsx ligne de fetchMatches :
const response = await fetch('/api/matches?type=all&season=2023');
```

---

## 🔄 Prochaines étapes

1. [ ] Décider du plan (gratuit ou Pro)
2. [ ] Si gratuit : organiser mise à jour manuelle matches.json
3. [ ] Si Pro : upgrader et enlever les fallbacks
4. [ ] Tester le site avec les données choisies
5. [ ] Configurer le déploiement (Vercel/Netlify)

---

## 📞 Support

- API-Football Discord : https://discord.gg/api-football
- Documentation : https://www.api-football.com/documentation-v3
- Football-Data : https://www.football-data.org/documentation/api

---

**Conclusion :** Le site fonctionne actuellement en mode hybride. Pour du vrai temps réel avec saison 2024-2025, un plan payant est nécessaire (10€/mois).
