# 🗺️ Configuration Google Places API

## 🎯 Objectif

Configurer Google Places API pour activer l'**autocomplétion d'adresse** dans l'édition du profil vétérinaire.

---

## ⚡ ÉTAPE 1 : Créer un projet Google Cloud

### 1. Accéder à Google Cloud Console

1. Allez sur https://console.cloud.google.com
2. Connectez-vous avec votre compte Google
3. Acceptez les conditions d'utilisation si nécessaire

### 2. Créer un nouveau projet (ou utiliser un existant)

1. Cliquez sur le **sélecteur de projet** en haut à gauche
2. Cliquez sur **"Nouveau projet"**
3. Donnez un nom : **"PetCare App"** (ou autre)
4. Sélectionnez votre organisation (si applicable)
5. Cliquez sur **"Créer"**
6. Attendez quelques secondes que le projet soit créé
7. Sélectionnez ce nouveau projet

---

## ⚡ ÉTAPE 2 : Activer les API nécessaires

### 1. Activer Places API

1. Dans le menu de gauche → **APIs & Services** → **Bibliothèque**
2. Cherchez **"Places API"**
3. Cliquez sur **"Places API"**
4. Cliquez sur **"Activer"**
5. Attendez l'activation (quelques secondes)

### 2. Activer Geocoding API (optionnel mais recommandé)

1. Retournez à la **Bibliothèque**
2. Cherchez **"Geocoding API"**
3. Cliquez dessus
4. Cliquez sur **"Activer"**

---

## ⚡ ÉTAPE 3 : Créer une clé API

### 1. Créer la clé

1. Menu de gauche → **APIs & Services** → **Identifiants**
2. Cliquez sur **"+ Créer des identifiants"**
3. Sélectionnez **"Clé API"**
4. Une popup s'affiche avec votre clé API : **Copiez-la !**
   ```
   AIzaSyDaGmWKa4JsXZ...VQzf5hI2O
   ```

### 2. Restreindre la clé (RECOMMANDÉ pour la sécurité)

1. Cliquez sur **"Modifier la clé API"** (ou sur le nom de la clé)
2. Sous **"Restrictions relatives aux applications"** :
   - Pour le développement : **"Aucune restriction"** (temporaire)
   - Pour la production : **"Sites web"** et ajoutez vos domaines
3. Sous **"Restrictions relatives aux API"** :
   - Sélectionnez **"Limiter la clé"**
   - Cochez **"Places API"**
   - Cochez **"Geocoding API"** (si activée)
4. Cliquez sur **"Enregistrer"**

---

## ⚡ ÉTAPE 4 : Configurer la clé dans l'application

### Option A : Fichier .env (RECOMMANDÉ)

1. **Créez un fichier `.env`** à la racine du projet :
   ```bash
   touch .env
   ```

2. **Ajoutez la clé API** :
   ```env
   GOOGLE_PLACES_API_KEY=AIzaSyDaGmWKa4JsXZ...VQzf5hI2O
   ```

3. **Installez le package pour lire les variables d'environnement** :
   ```bash
   npm install react-native-dotenv
   npm install --save-dev @types/react-native-dotenv
   ```

4. **Configurez babel.config.js** :
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

5. **Créez `types.d.ts`** à la racine :
   ```typescript
   declare module '@env' {
     export const GOOGLE_PLACES_API_KEY: string;
   }
   ```

6. **Mettez à jour AddressAutocomplete.tsx** :
   ```typescript
   import { GOOGLE_PLACES_API_KEY } from '@env';
   
   // Utilisez GOOGLE_PLACES_API_KEY au lieu de la constante
   ```

### Option B : Directement dans le code (SIMPLE mais MOINS SÉCURISÉ)

1. **Ouvrez** `src/components/AddressAutocomplete.tsx`
2. **Remplacez** la ligne :
   ```typescript
   const GOOGLE_PLACES_API_KEY = 'VOTRE_CLE_API_GOOGLE_ICI';
   ```
   par :
   ```typescript
   const GOOGLE_PLACES_API_KEY = 'AIzaSyDaGmWKa4JsXZ...VQzf5hI2O';
   ```

⚠️ **Attention** : Ne commitez JAMAIS votre clé API sur Git/GitHub !

---

## ⚡ ÉTAPE 5 : Tester l'autocomplétion

### 1. Redémarrer l'application

```bash
# Arrêtez l'app (Ctrl+C)
# Redémarrez
npm start
# ou
expo start
```

### 2. Tester dans l'app

1. Connectez-vous en tant que **vétérinaire**
2. Allez sur votre **profil**
3. Cliquez sur **✏️ Modifier**
4. Dans la section **"Clinique"**
5. Cliquez sur **"Autocomplétion"**
6. Commencez à taper une adresse
7. ✅ Les suggestions apparaissent !

---

## 💰 TARIFICATION

### Quota gratuit mensuel

Google offre **$200 de crédit gratuit par mois**, ce qui équivaut à environ :

| Service | Quota gratuit |
|---------|--------------|
| **Places Autocomplete** | 28,000 requêtes/mois |
| **Geocoding** | 40,000 requêtes/mois |

### Coût après le quota gratuit

| Service | Prix |
|---------|------|
| **Places Autocomplete** | $0.00283 par requête (≈ 2.83€ pour 1000 requêtes) |
| **Geocoding** | $0.005 par requête |

### Estimation pour votre app

Avec **100 vétérinaires** modifiant leur profil **2 fois par mois** :
- 200 requêtes/mois
- **Coût** : **GRATUIT** (largement sous le quota)

Même avec **1000 vétérinaires** :
- 2000 requêtes/mois
- **Coût** : **GRATUIT**

💡 **Vous ne paierez probablement rien** pour cette fonctionnalité !

---

## 🔒 SÉCURITÉ : Protéger votre clé API

### 1. Ajouter .env au .gitignore

Assurez-vous que `.env` est dans `.gitignore` :
```gitignore
# .gitignore
.env
.env.local
.env.production
```

### 2. Restrictions de la clé API

Dans Google Cloud Console :

#### Restrictions par domaine (Production)
- Ajoutez vos domaines autorisés
- Ex : `https://monapp.com`, `https://www.monapp.com`

#### Restrictions par IP (Backend)
- Si vous utilisez la clé côté serveur
- Ajoutez les IPs de vos serveurs

#### Restrictions par application (Mobile)
- Pour iOS : ajoutez le Bundle ID
- Pour Android : ajoutez le SHA-1 de votre keystore

### 3. Surveiller l'utilisation

1. Google Cloud Console → **APIs & Services** → **Tableau de bord**
2. Vérifiez régulièrement l'utilisation
3. Configurez des alertes de facturation

---

## 🐛 DÉPANNAGE

### "Invalid API key"

**Causes** :
- Clé API incorrecte
- API non activée
- Restrictions trop strictes

**Solutions** :
1. Vérifiez que vous avez copié la bonne clé
2. Vérifiez que Places API est activée
3. Temporairement, enlevez les restrictions pour tester

### "This API key is not authorized to use this service"

**Solution** :
1. Google Cloud Console → Identifiants
2. Cliquez sur votre clé API
3. Sous "Restrictions relatives aux API" → Assurez-vous que "Places API" est cochée

### "REQUEST_DENIED"

**Cause** : API non activée ou problème de facturation

**Solution** :
1. Activez Places API
2. Configurez un compte de facturation (même pour le quota gratuit)

### Les suggestions n'apparaissent pas

**Solutions** :
1. Vérifiez la console (F12) pour les erreurs
2. Testez avec `components: ''` (sans restriction de pays)
3. Vérifiez votre connexion internet
4. Attendez quelques minutes (propagation de la clé)

### "OVER_QUERY_LIMIT"

**Cause** : Quota gratuit dépassé

**Solution** :
1. Vérifiez votre utilisation dans Google Cloud Console
2. Configurez un compte de facturation
3. Ajoutez du crédit

---

## 📊 CONFIGURATION AVANCÉE

### Limiter à un pays spécifique

Dans `AddressAutocomplete.tsx`, modifiez :
```typescript
query={{
  key: GOOGLE_PLACES_API_KEY,
  language: 'fr',
  components: 'country:be', // be = Belgique
  // Autres codes : fr = France, nl = Pays-Bas, de = Allemagne
}}
```

### Limiter à un type d'adresse

```typescript
query={{
  key: GOOGLE_PLACES_API_KEY,
  types: 'address', // Seulement des adresses complètes
  // Autres types : 'establishment', 'geocode', etc.
}}
```

### Changer la langue

```typescript
query={{
  key: GOOGLE_PLACES_API_KEY,
  language: 'nl', // Néerlandais
  // 'fr' = Français, 'en' = Anglais, 'de' = Allemand
}}
```

---

## ✅ CHECKLIST DE CONFIGURATION

- [ ] Projet Google Cloud créé
- [ ] Places API activée
- [ ] Geocoding API activée (optionnel)
- [ ] Clé API créée et copiée
- [ ] Restrictions de sécurité configurées
- [ ] Clé ajoutée dans `.env` OU dans le code
- [ ] `.env` ajouté à `.gitignore`
- [ ] Application redémarrée
- [ ] Autocomplétion testée et fonctionnelle
- [ ] Compte de facturation configuré (pour dépasser le quota gratuit)

---

## 🔗 LIENS UTILES

- **Google Cloud Console** : https://console.cloud.google.com
- **Places API Documentation** : https://developers.google.com/maps/documentation/places/web-service
- **Tarification** : https://developers.google.com/maps/billing-and-pricing/pricing
- **Calculateur de prix** : https://mapsplatformtransition.withgoogle.com/pricing-calculator

---

## 💡 ALTERNATIVE GRATUITE : Nominatim (OpenStreetMap)

Si vous ne voulez **PAS** utiliser Google Places :

### Avantages
- ✅ 100% gratuit
- ✅ Pas de clé API nécessaire
- ✅ Open source

### Inconvénients
- ❌ Moins précis que Google
- ❌ Base de données moins complète
- ❌ Moins de détails

### Package à utiliser
```bash
npm install react-native-geocoding
```

---

✨ **Suivez ce guide et l'autocomplétion d'adresse sera fonctionnelle !** 🗺️





