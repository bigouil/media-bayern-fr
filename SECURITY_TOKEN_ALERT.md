# 🚨 ALERTE SÉCURITÉ CRITIQUE - Token API compromis

## ⚠️ ACTION REQUISE IMMÉDIATEMENT

Votre token Football-Data.org `c372fa6b39c54ef992fb1e0cb66623a8` a été **partagé publiquement** dans notre conversation.

---

## 🔴 ÉTAPE 1 : Révoquer le token actuel

1. Allez sur https://www.football-data.org/client/account
2. Connectez-vous à votre compte
3. Cliquez sur **"API Tokens"** ou **"Manage Tokens"**
4. Trouvez le token `c372fa6b39c54ef992fb1e0cb66623a8`
5. Cliquez sur **"Delete"** ou **"Revoke"**

---

## 🔐 ÉTAPE 2 : Créer un nouveau token

1. Sur la même page, cliquez sur **"Create new token"**
2. Donnez-lui un nom (ex: "Media Bayern Production")
3. **Copiez le nouveau token** (vous ne pourrez plus le voir après)
4. Conservez-le en lieu sûr

---

## ✏️ ÉTAPE 3 : Mettre à jour votre configuration

### Option A : Manuellement

Ouvrez le fichier `.env.local` :

```bash
code .env.local
```

Remplacez l'ancien token :

```env
FOOTBALL_DATA_API_TOKEN=VOTRE_NOUVEAU_TOKEN_ICI
```

### Option B : En ligne de commande

```bash
echo "FOOTBALL_DATA_API_TOKEN=VOTRE_NOUVEAU_TOKEN_ICI" > .env.local
echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000" >> .env.local
```

---

## 🔄 ÉTAPE 4 : Redémarrer le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

---

## 🔒 ÉTAPE 5 : Vérifier que tout fonctionne

```bash
# Testez l'API
node scripts/test-football-data.js

# Ou visitez directement
# http://localhost:3000/matchs
```

---

## 📝 Bonnes pratiques de sécurité

### ❌ NE JAMAIS FAIRE

- ❌ Partager votre token dans un chat/email
- ❌ Commiter `.env.local` dans Git
- ❌ Prendre des screenshots avec le token visible
- ❌ Le poster sur des forums/Discord/Slack
- ❌ L'exposer dans le code frontend

### ✅ TOUJOURS FAIRE

- ✅ Garder les tokens dans `.env.local` (jamais commité)
- ✅ Utiliser des variables d'environnement
- ✅ Régénérer le token si compromis
- ✅ Utiliser des tokens différents pour dev/prod
- ✅ Vérifier `.gitignore` contient `.env*`

---

## 🔍 Vérification de sécurité

```bash
# Vérifier que .env.local n'est PAS dans Git
git status

# Vérifier le .gitignore
cat .gitignore | grep "env"
# ✅ Devrait afficher : .env*

# Si .env.local apparaît dans git status :
git rm --cached .env.local
git add .gitignore
git commit -m "Remove .env.local from git"
```

---

## 🌐 Configuration pour la production

### Vercel

```bash
vercel env add FOOTBALL_DATA_API_TOKEN production
# Entrez votre NOUVEAU token quand demandé
```

### Netlify

1. **Site settings** > **Environment variables**
2. **Add a variable**
   - Key: `FOOTBALL_DATA_API_TOKEN`
   - Value: Votre NOUVEAU token
3. **Deploy** pour appliquer

### Railway

```bash
railway variables set FOOTBALL_DATA_API_TOKEN=VOTRE_NOUVEAU_TOKEN
```

### Render

1. **Dashboard** > votre service > **Environment**
2. **Add Environment Variable**
3. Key: `FOOTBALL_DATA_API_TOKEN`
4. Value: Votre NOUVEAU token
5. **Save Changes**

---

## 📊 Pourquoi c'est important ?

### Risques si le token est compromis

1. **Épuisement du quota**
   - Quelqu'un pourrait faire des milliers de requêtes
   - Vous atteindriez la limite (10/min)
   - Votre site serait bloqué

2. **Données sensibles**
   - Accès à vos statistiques d'utilisation
   - Informations sur votre compte

3. **Suspension du compte**
   - Football-Data.org pourrait suspendre votre compte
   - Violation des conditions d'utilisation

---

## ✅ Checklist post-incident

- [ ] Ancien token révoqué sur Football-Data.org
- [ ] Nouveau token créé
- [ ] Fichier `.env.local` mis à jour avec le nouveau token
- [ ] Serveur de développement redémarré
- [ ] Test effectué (script ou site web)
- [ ] Vérification que `.env.local` est dans `.gitignore`
- [ ] Variables d'environnement configurées pour production
- [ ] Ce fichier lu et compris

---

## 🆘 En cas de problème

### Le nouveau token ne fonctionne pas

```bash
# Vérifiez qu'il est bien dans .env.local
cat .env.local

# Vérifiez qu'il est chargé par Node.js
node -e "console.log(process.env.FOOTBALL_DATA_API_TOKEN)"

# Testez directement
FOOTBALL_DATA_API_TOKEN=VOTRE_TOKEN node scripts/test-football-data.js
```

### Le site ne démarre pas

```bash
# Nettoyez le cache Next.js
rm -rf .next
npm run dev
```

### L'API retourne "Unauthorized"

- Le token est peut-être incorrect
- Copiez-collez à nouveau depuis Football-Data.org
- Vérifiez qu'il n'y a pas d'espaces avant/après

---

## 📞 Support

- **Football-Data.org** : https://www.football-data.org/support
- **Documentation API** : https://www.football-data.org/documentation/quickstart
- **Compte** : https://www.football-data.org/client/account

---

## 🎯 Résumé rapide

```bash
# 1. Révoquer l'ancien token sur le site
# 2. Créer un nouveau token
# 3. Mettre à jour .env.local
echo "FOOTBALL_DATA_API_TOKEN=nouveau_token" > .env.local
# 4. Redémarrer
npm run dev
# 5. Tester
node scripts/test-football-data.js
```

---

**⏰ Temps estimé : 5 minutes**

**Une fois terminé, supprimez ce fichier :**

```bash
rm SECURITY_TOKEN_ALERT.md
rm SECURITY_ALERT.md
```

---

🔐 **La sécurité de vos tokens API est cruciale pour la fiabilité de votre site !**
