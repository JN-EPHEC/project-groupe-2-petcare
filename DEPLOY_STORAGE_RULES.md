# 📦 Déployer les règles de sécurité Firebase Storage

## 🚨 PROBLÈME

Erreur lors de l'upload de documents :
```
Firebase Storage: User does not have permission to access 'documents/...'
(storage/unauthorized)
```

Les règles de sécurité Firebase Storage actuelles sont trop restrictives.

---

## ✅ SOLUTION : Déployer les nouvelles règles

### Méthode 1 : Via Firebase Console (RECOMMANDÉ)

#### Étape 1 : Ouvrir Firebase Console
1. Allez sur https://console.firebase.google.com/
2. Sélectionnez votre projet **`petcare-2a317`**
3. Dans le menu de gauche, cliquez sur **"Storage"**

#### Étape 2 : Ouvrir les règles
1. Cliquez sur l'onglet **"Rules"** (Règles)
2. Vous verrez l'éditeur de règles

#### Étape 3 : Copier-coller les nouvelles règles
1. Ouvrez le fichier **`storage.rules`** de ce projet
2. Copiez TOUT le contenu
3. Collez-le dans l'éditeur Firebase Console (remplacez tout)

#### Étape 4 : Publier
1. Cliquez sur **"Publish"** (Publier)
2. Attendez quelques secondes pour la propagation
3. ✅ Les règles sont déployées !

---

### Méthode 2 : Via Firebase CLI

#### Prérequis
```bash
# Installer Firebase CLI si pas encore fait
npm install -g firebase-tools

# Se connecter à Firebase
firebase login
```

#### Déployer les règles
```bash
# À la racine du projet (où se trouve storage.rules)
firebase deploy --only storage

# Ou déployer toutes les règles (Storage + Firestore)
firebase deploy --only storage,firestore
```

---

## 📋 CE QUE LES NOUVELLES RÈGLES PERMETTENT

### 1. **Documents** (`documents/{userId}/{petId}/{filename}`)
   - ✅ L'utilisateur peut lire/écrire ses propres documents
   - ✅ Limite : 10 MB par fichier
   - ✅ Format : Tous types (PDF, images, etc.)

### 2. **Avatars** (`avatars/{userId}/{filename}`)
   - ✅ Tout le monde peut lire (pour afficher les profils)
   - ✅ Seul le propriétaire peut modifier
   - ✅ Limite : 5 MB
   - ✅ Format : Images uniquement

### 3. **Photos d'animaux** (`pets/{userId}/{petId}/{filename}`)
   - ✅ Tout le monde peut lire
   - ✅ Seul le propriétaire peut modifier
   - ✅ Limite : 5 MB
   - ✅ Format : Images uniquement

### 4. **Wellness** (`wellness/{userId}/{petId}/{filename}`)
   - ✅ L'utilisateur peut lire/écrire ses propres données
   - ✅ Limite : 5 MB
   - ✅ Format : Images uniquement

### 5. **Blog** (`blog/{articleId}/{filename}`)
   - ✅ Tout le monde peut lire
   - ✅ Les utilisateurs authentifiés peuvent écrire (admins)
   - ✅ Limite : 5 MB
   - ✅ Format : Images uniquement

---

## 🔒 SÉCURITÉ

Les règles garantissent que :
- ✅ Chaque utilisateur ne peut accéder qu'à SES propres fichiers
- ✅ Vérification de l'authentification (`request.auth.uid`)
- ✅ Limites de taille pour éviter les abus
- ✅ Validation des types de fichiers (images vs PDF)

---

## 🧪 TESTER APRÈS DÉPLOIEMENT

1. **Rafraîchir l'application** (F5 ou Cmd+R)
2. **Ajouter un document** :
   - Aller sur "Mes documents"
   - Cliquer sur "+"
   - Scanner ou importer un fichier
   - Remplir les informations
   - Cliquer sur "Enregistrer"
3. ✅ **Le document devrait s'uploader sans erreur !**

---

## ⚠️ IMPORTANT

- **Ne déployez PAS les règles en production sans les tester d'abord**
- **Sauvegardez les anciennes règles** avant de les remplacer
- **Vérifiez que tous les chemins correspondent** à ceux utilisés dans le code

---

## 📊 STRUCTURE DES CHEMINS DANS LE CODE

Le code utilise ces chemins dans `documentService.ts` :

```typescript
// Upload de documents
const storageRef = ref(storage, `documents/${userId}/${petId}/${fileName}`);

// Upload d'avatars
const storageRef = ref(storage, `avatars/${userId}/${fileName}`);

// Upload de photos d'animaux
const storageRef = ref(storage, `pets/${userId}/${petId}/${fileName}`);
```

Les règles Storage doivent correspondre EXACTEMENT à ces chemins.

---

## 🔄 VÉRIFICATION

Après déploiement, vérifiez dans Firebase Console > Storage > Rules :

```
✅ Version : rules_version = '2'
✅ Service : service firebase.storage
✅ Matches : documents, avatars, pets, wellness, blog
```

---

## 🆘 SI ÇA NE FONCTIONNE TOUJOURS PAS

1. **Vérifier l'authentification** : L'utilisateur est-il bien connecté ?
2. **Vérifier les logs** : Console Firebase > Storage > Logs
3. **Vérifier le code** : Les chemins correspondent-ils aux règles ?
4. **Attendre** : Les règles peuvent prendre 1-2 minutes pour se propager

---

✅ **Une fois déployé, l'upload de documents fonctionnera !**




