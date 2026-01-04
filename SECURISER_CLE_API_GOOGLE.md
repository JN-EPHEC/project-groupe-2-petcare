# 🔒 URGENT : Sécuriser votre clé API Google Places

## ⚠️ ATTENTION

Votre clé API a été exposée publiquement. **Vous devez la sécuriser immédiatement** pour éviter toute utilisation non autorisée et des frais inattendus.

---

## 🚨 ACTIONS IMMÉDIATES

### Option 1 : Restreindre la clé existante (RAPIDE - 2 minutes)

1. **Allez sur Google Cloud Console**
   👉 https://console.cloud.google.com/apis/credentials

2. **Trouvez votre clé API**
   - Cherchez : `AIzaSyBtEwktPtW8gXEANn0yf_kWlkSh9ElQtY0`
   - Cliquez dessus pour l'éditer

3. **Ajoutez des restrictions d'applications**
   
   Pour le développement (temporaire) :
   - Sélectionnez **"Sites web (avec référents HTTP)"**
   - Ajoutez : `http://localhost:*/*`
   - Ajoutez : `http://192.168.*.*/*`
   
   Pour la production :
   - Ajoutez vos domaines réels : `https://votre-domaine.com/*`

4. **Restreignez les API**
   - Sélectionnez **"Limiter la clé"**
   - Cochez **UNIQUEMENT** :
     - ✅ Places API
     - ✅ Geocoding API
   - Décochez tout le reste

5. **Enregistrez** et attendez 5 minutes que les restrictions s'appliquent

---

### Option 2 : Créer une nouvelle clé (RECOMMANDÉ - 5 minutes)

1. **Supprimez l'ancienne clé**
   - Google Cloud Console → Identifiants
   - Trouvez `AIzaSyBtEwktPtW8gXEANn0yf_kWlkSh9ElQtY0`
   - Cliquez sur la poubelle 🗑️ → Confirmer

2. **Créez une nouvelle clé**
   - Cliquez sur **"+ Créer des identifiants"**
   - Sélectionnez **"Clé API"**
   - Copiez la nouvelle clé

3. **Restreignez IMMÉDIATEMENT la nouvelle clé**
   - Suivez les étapes de l'Option 1
   - NE PAS laisser sans restrictions

4. **Mettez à jour l'application**
   ```typescript
   // src/components/AddressAutocomplete.tsx
   const GOOGLE_PLACES_API_KEY = 'VOTRE_NOUVELLE_CLE_ICI';
   ```

5. **Redémarrez l'app**

---

## 🛡️ CONFIGURATION SÉCURISÉE (Option 1 appliquée)

Voici ce que j'ai configuré :

```typescript
// src/components/AddressAutocomplete.tsx
const GOOGLE_PLACES_API_KEY = 'AIzaSyBtEwktPtW8gXEANn0yf_kWlkSh9ElQtY0';
```

**⚠️ Cette clé est maintenant dans votre code source !**

### Ce qui doit être fait :

1. ✅ La clé est configurée dans l'app
2. ❌ La clé n'est PAS dans .env (moins sécurisé)
3. ✅ .gitignore configuré correctement
4. ❌ Restrictions API non appliquées (À FAIRE MAINTENANT)

---

## 🔐 MEILLEURE PRATIQUE : Utiliser .env

### 1. Créer un fichier .env

```bash
# À la racine du projet
touch .env
```

### 2. Ajouter la clé dans .env

```env
GOOGLE_PLACES_API_KEY=AIzaSyBtEwktPtW8gXEANn0yf_kWlkSh9ElQtY0
```

### 3. Installer les dépendances

```bash
npm install react-native-dotenv
npm install --save-dev @types/react-native-dotenv
```

### 4. Configurer babel.config.js

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]
    ]
  };
};
```

### 5. Créer types.d.ts

```typescript
// À la racine
declare module '@env' {
  export const GOOGLE_PLACES_API_KEY: string;
}
```

### 6. Mettre à jour AddressAutocomplete.tsx

```typescript
import { GOOGLE_PLACES_API_KEY } from '@env';

// Supprimer la ligne const GOOGLE_PLACES_API_KEY = '...'
```

---

## 🚨 RISQUES SI NON SÉCURISÉE

### Utilisation non autorisée

- ✅ Quelqu'un peut utiliser votre clé
- ✅ Générer des milliers de requêtes
- ✅ Vous faire payer des frais énormes

### Exemple réel

Un développeur a laissé sa clé API exposée :
- **$2,400** de frais en 48 heures
- Des bots ont exploité la clé
- Google a refusé d'annuler les frais

### Protection

- ✅ Restreindre la clé IMMÉDIATEMENT
- ✅ Surveiller l'utilisation quotidiennement
- ✅ Configurer des alertes de facturation

---

## 📊 SURVEILLANCE DE L'UTILISATION

### 1. Configurer des alertes

1. Google Cloud Console → **Facturation**
2. Cliquez sur **"Alertes de budget"**
3. Créez une alerte :
   - Budget mensuel : **$10** (ou $0 si 100% gratuit)
   - Seuils d'alerte : 50%, 90%, 100%
   - Email de notification

### 2. Vérifier l'utilisation quotidiennement (première semaine)

1. Google Cloud Console → **APIs & Services** → **Tableau de bord**
2. Sélectionnez **"Places API"**
3. Vérifiez le graphique des requêtes
4. Si > 1000 requêtes/jour → **PROBLÈME !**

### 3. Utilisation normale attendue

| Période | Requêtes attendues |
|---------|-------------------|
| Par vétérinaire/modification | 5-10 |
| Par jour (10 vétérinaires) | 50-100 |
| Par mois | 200-500 |

Si vous voyez **> 1000 requêtes/jour** : Quelqu'un exploite votre clé !

---

## ✅ CHECKLIST DE SÉCURITÉ

- [ ] Clé API restreinte par domaine/IP
- [ ] Clé API restreinte aux API nécessaires uniquement
- [ ] Alerte de facturation configurée ($10/mois)
- [ ] .env créé (optionnel mais recommandé)
- [ ] Clé supprimée du code source (si .env utilisé)
- [ ] Surveillance activée pour la première semaine
- [ ] Documentation lue et comprise

---

## 🔗 LIENS UTILES

- **Gérer les identifiants** : https://console.cloud.google.com/apis/credentials
- **Surveiller l'utilisation** : https://console.cloud.google.com/apis/dashboard
- **Facturation et alertes** : https://console.cloud.google.com/billing
- **Best practices Google** : https://cloud.google.com/docs/authentication/api-keys

---

## 💡 CONSEIL IMPORTANT

**NE PARTAGEZ JAMAIS** votre clé API :
- ❌ Sur des forums publics
- ❌ Sur GitHub/GitLab (sans .gitignore)
- ❌ Dans des screenshots
- ❌ Dans des messages de support
- ❌ Dans des emails non sécurisés

**Stockez-la** :
- ✅ Dans .env (ignoré par Git)
- ✅ Dans les secrets de déploiement
- ✅ Dans un gestionnaire de secrets (Vault, etc.)

---

## 🚀 APRÈS LA SÉCURISATION

Une fois votre clé sécurisée :

1. **Rechargez l'app** (Ctrl+R)
2. **Testez l'autocomplétion** :
   - Profil vétérinaire → ✏️ Modifier
   - Cliquez sur "Autocomplétion"
   - Tapez une adresse
   - Les suggestions apparaissent ! 🎉
3. **Surveillez l'utilisation** pendant 1 semaine
4. **Profitez de l'autocomplétion** en toute sécurité ! 🗺️

---

✨ **Sécurisez votre clé MAINTENANT et profitez de l'autocomplétion en toute tranquillité !** 🔒




