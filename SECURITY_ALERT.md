# 🚨 ALERTE SÉCURITÉ - CLEF API COMPROMISE

## ⚠️ ACTION REQUISE IMMÉDIATEMENT

Votre clé API `ea7cf698d95a9b99c3f9ea9d5b16fb05` a été **partagée publiquement** dans notre conversation.

### 🔴 Risques

- ✅ Quelqu'un pourrait utiliser votre quota d'API
- ✅ Votre compte pourrait être facturé pour des requêtes non autorisées
- ✅ Vos données de compte pourraient être exposées

---

## ✅ ÉTAPES DE CORRECTION (5 minutes)

### 1️⃣ Régénérer votre clé API

1. Allez sur https://dashboard.api-football.com/
2. Connectez-vous à votre compte
3. Cliquez sur **"API Keys"** dans le menu
4. Trouvez la clé `ea7cf698d95a9b99c3f9ea9d5b16fb05`
5. Cliquez sur **"Regenerate"** ou **"Revoke"**
6. Copiez la nouvelle clé générée

### 2️⃣ Mettre à jour le fichier `.env.local`

```bash
# Ouvrez le fichier
code .env.local

# OU en ligne de commande
nano .env.local
```

**Remplacez** l'ancienne clé par la nouvelle :

```env
FOOTBALL_API_KEY=VOTRE_NOUVELLE_CLEF_ICI
```

### 3️⃣ Redémarrer le serveur

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

---

## 📚 Bonnes pratiques de sécurité

### ❌ NE JAMAIS FAIRE

- Partager votre clé API dans un chat/email/message
- Commiter `.env.local` dans Git
- Exposer votre clé dans le code frontend
- Prendre des screenshots contenant la clé
- La poster sur des forums/Discord/Slack

### ✅ TOUJOURS FAIRE

- Garder les clés dans `.env.local` (jamais commité)
- Utiliser des variables d'environnement
- Régénérer la clé si compromise
- Utiliser des clés différentes pour dev/prod
- Limiter les permissions de la clé si possible

---

## 🔒 Vérification de sécurité

```bash
# Vérifier que .env.local n'est PAS dans Git
git status

# Si .env.local apparaît, ne le commitez JAMAIS !
# Il devrait être ignoré par .gitignore

# Vérifier le .gitignore
cat .gitignore | grep "env"
# ✅ Devrait contenir : .env*
```

---

## 🎯 Configuration sécurisée pour la production

### Vercel

```bash
# Ajouter la variable d'environnement sur Vercel
vercel env add FOOTBALL_API_KEY production
# Entrez votre clé quand demandé
```

### Netlify

1. Allez dans **Site settings** > **Environment variables**
2. Cliquez sur **Add a variable**
3. Key: `FOOTBALL_API_KEY`
4. Value: Votre nouvelle clé
5. Scope: **Production**

### Railway / Render / Autres

Consultez leur documentation pour ajouter des variables d'environnement.

---

## 📝 Checklist post-incident

- [ ] Nouvelle clé API générée sur API-Football
- [ ] Ancienne clé révoquée
- [ ] Fichier `.env.local` mis à jour
- [ ] Serveur de développement redémarré
- [ ] Vérification que `.env.local` est dans `.gitignore`
- [ ] Vérification que `.env.local` n'est pas dans Git
- [ ] Variables d'environnement configurées pour production
- [ ] Ce fichier `SECURITY_ALERT.md` lu et compris

---

## 🆘 Besoin d'aide ?

Si vous avez des questions sur la sécurité de votre clé API :

- Documentation API-Football : https://www.api-football.com/documentation-v3
- Support API-Football : contact@api-football.com
- Next.js Environment Variables : https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

---

**Une fois la nouvelle clé configurée, vous pouvez supprimer ce fichier.**

```bash
rm SECURITY_ALERT.md
```
