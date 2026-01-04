# 👑 Guide de Configuration Admin - PetCare+

## 🚀 Création du Compte Administrateur

### Méthode 1: Script Automatique (Recommandé)

Le script `createAdminAccount.js` crée automatiquement un compte administrateur dans Firebase.

#### Prérequis:
- Node.js installé
- Firebase Admin SDK configuré
- Fichier `petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json` présent

#### Étapes:

1. **Installer les dépendances** (si ce n'est pas déjà fait):
```bash
npm install firebase-admin
```

2. **Exécuter le script**:
```bash
node scripts/createAdminAccount.js
```

3. **Résultat attendu**:
```
🚀 Création du compte administrateur...

✅ Compte Firebase Auth créé
   UID: abc123def456
   Email: admin@petcare.com

✅ Document Firestore créé/mis à jour
   Collection: users
   Document ID: abc123def456
   Rôle: admin

==================================================
🎉 COMPTE ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !
==================================================

📧 Informations de connexion:
   Email: admin@petcare.com
   Mot de passe: admin
   Rôle: Administrateur

🔑 UID Firebase: abc123def456

⚠️  IMPORTANT: Changez le mot de passe après la première connexion!
==================================================
```

#### Configuration du compte:
Le script crée un compte avec:
- **Email**: `admin@petcare.com`
- **Mot de passe**: `admin`
- **Rôle**: `admin`
- **Email vérifié**: `true` (automatique)
- **Nom**: Admin PetCare

---

### Méthode 2: Manuellement via Firebase Console

Si vous préférez créer le compte manuellement:

1. **Firebase Authentication**:
   - Allez sur [Firebase Console](https://console.firebase.google.com/)
   - Sélectionnez votre projet `petcare-2a317`
   - Allez dans **Authentication** → **Users**
   - Cliquez sur **Add user**
   - Email: `admin@petcare.com`
   - Mot de passe: `admin` (ou autre)
   - Copiez l'**UID** généré

2. **Firestore Database**:
   - Allez dans **Firestore Database**
   - Collection: `users`
   - Cliquez sur **Add document**
   - Document ID: [Collez l'UID copié]
   - Ajoutez les champs:
     ```
     email: "admin@petcare.com"
     firstName: "Admin"
     lastName: "PetCare"
     role: "admin"
     phone: "+32 2 000 0000"
     location: "Belgique"
     avatarUrl: "https://ui-avatars.com/api/?name=Admin+PetCare&background=FF6B00&color=fff"
     createdAt: [Timestamp now]
     updatedAt: [Timestamp now]
     ```

---

## 🎯 Fonctionnalités Admin

### 1. **Dashboard Administrateur**

Accessible après connexion avec le compte admin:
- 📊 Statistiques de la plateforme
- 👥 Nombre total d'utilisateurs
- 🩺 Vétérinaires en attente d'approbation
- 🐾 Nombre total d'animaux
- 📈 Graphiques et analytics

### 2. **Gestion des Utilisateurs** 👥

**Accès**: Dashboard Admin → Utilisateurs

#### Fonctionnalités disponibles:

**✅ Promouvoir en Administrateur**
- Sélectionnez un utilisateur (propriétaire ou vétérinaire)
- Cliquez sur "Promouvoir Admin"
- L'utilisateur obtient tous les privilèges admin
- Accès au tableau de bord administrateur

**✅ Rétrograder un Admin**
- Retirer les privilèges admin d'un utilisateur
- L'utilisateur redevient propriétaire

**✅ Approuver des Vétérinaires**
- Vérifier les credentials des vétérinaires
- Approuver ou rejeter les demandes
- Les vétérinaires approuvés peuvent se connecter

**✅ Supprimer des Utilisateurs**
- Supprimer définitivement un compte
- Action irréversible
- Impossible de supprimer son propre compte admin

**✅ Filtrer et Rechercher**
- Filtrer par rôle: Tous, Propriétaires, Vétérinaires, Admins
- Rechercher par nom ou email
- Rafraîchir la liste en temps réel

#### Protection:
- ⚠️ Un admin ne peut pas se supprimer lui-même
- ⚠️ Un admin ne peut pas se rétrograder lui-même
- ⚠️ Confirmation requise pour toutes les actions critiques

---

### 3. **Gestion des Vétérinaires** 🩺

**Accès**: Dashboard Admin → Vétérinaires

- Voir tous les vétérinaires (approuvés et en attente)
- Approuver les nouvelles demandes
- Rejeter avec raison
- Voir les détails professionnels (clinique, spécialité, expérience)

---

### 4. **Gestion des Animaux** 🐾

**Accès**: Dashboard Admin → Animaux

- Voir tous les animaux enregistrés
- Statistiques par type (chiens, chats, autres)
- Filtrer et rechercher

---

### 5. **Analytics** 📊

**Accès**: Dashboard Admin → Analytics

- Croissance mensuelle des utilisateurs
- Top vétérinaires (par nombre de patients)
- Statistiques globales de la plateforme
- Graphiques et visualisations

---

## 🔐 Sécurité

### Règles Firestore

Pour permettre aux admins de gérer les utilisateurs, assurez-vous que vos règles Firestore (`firestore.rules`) incluent:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      // Admin peut tout faire
      allow read, write, delete: if isAdmin();
      
      // Un utilisateur peut lire son propre profil
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Un utilisateur peut mettre à jour son propre profil (sauf le rôle)
      allow update: if request.auth != null && 
                       request.auth.uid == userId && 
                       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);
    }
    
    // Autres collections...
  }
}
```

### Bonnes Pratiques:

1. **Changez le mot de passe par défaut** immédiatement après la première connexion
2. **Ne partagez jamais** les credentials admin
3. **Créez plusieurs admins** pour éviter un point de défaillance unique
4. **Auditez régulièrement** les actions admin dans Firebase Console
5. **Activez l'authentification à deux facteurs** si possible

---

## 🧪 Tests

### Tester la Création d'Admin:

1. **Créer le compte**:
```bash
node scripts/createAdminAccount.js
```

2. **Se connecter**:
   - Ouvrez l'app PetCare+
   - Email: `admin@petcare.com`
   - Mot de passe: `admin`

3. **Vérifier l'accès**:
   - ✅ Vous devriez voir le Dashboard Admin
   - ✅ Onglets: Home, Users, Vets, Profile
   - ✅ Accès à toutes les fonctionnalités admin

### Tester la Promotion en Admin:

1. **Créer un utilisateur test**:
   - Inscrivez-vous avec un nouveau compte propriétaire
   - Email: `test@example.com`

2. **Se connecter en tant qu'admin**:
   - Email: `admin@petcare.com`
   - Mot de passe: `admin`

3. **Promouvoir l'utilisateur**:
   - Allez dans Utilisateurs
   - Cherchez `test@example.com`
   - Cliquez sur "Promouvoir Admin"
   - Confirmez

4. **Vérifier**:
   - Déconnectez-vous
   - Connectez-vous avec `test@example.com`
   - ✅ Vous devriez voir le Dashboard Admin

5. **Rétrograder (optionnel)**:
   - Reconnectez-vous en tant qu'admin principal
   - Cliquez sur "Rétrograder"
   - L'utilisateur test redevient propriétaire

---

## 📱 Interface Admin

### Navigation:

```
┌─────────────────────────────────────┐
│       ADMIN DASHBOARD               │
├─────────────────────────────────────┤
│                                     │
│  📊 Statistiques                    │
│  👥 125 utilisateurs                │
│  🩺 15 vétérinaires                 │
│  🐾 342 animaux                     │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ⏳ Vétérinaires en attente: 3     │
│  [Voir les demandes]                │
│                                     │
└─────────────────────────────────────┘

Bottom Navigation:
[🏠 Home] [👥 Users] [🩺 Vets] [👤 Profile]
```

---

## ❓ Dépannage

### Le script ne fonctionne pas

**Erreur**: `Cannot find module 'firebase-admin'`
```bash
npm install firebase-admin
```

**Erreur**: `Service account file not found`
- Vérifiez que `petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json` existe
- Le fichier doit être à la racine du projet

### Impossible de se connecter

1. **Vérifiez Firebase Auth**:
   - Le compte existe-t-il dans Authentication ?
   - L'email est-il vérifié ?

2. **Vérifiez Firestore**:
   - Le document existe-t-il dans la collection `users` ?
   - Le champ `role` est-il bien défini à `"admin"` ?
   - L'UID correspond-il à celui de Firebase Auth ?

3. **Vérifiez les règles Firestore**:
   - Les admins ont-ils les permissions nécessaires ?

### L'utilisateur ne voit pas le Dashboard Admin

1. **Vérifiez le rôle**:
   - Allez dans Firestore → users → [userId]
   - Vérifiez que `role: "admin"`

2. **Redémarrez l'app**:
   - Fermez complètement l'application
   - Reconnectez-vous

3. **Vérifiez le cache**:
   - Déconnectez-vous
   - Reconnectez-vous

---

## 🔄 Gestion de Multiples Admins

### Créer des Admins Supplémentaires:

**Option 1: Via l'interface admin**
1. Connectez-vous en tant qu'admin
2. Allez dans Utilisateurs
3. Trouvez l'utilisateur à promouvoir
4. Cliquez sur "Promouvoir Admin"

**Option 2: Modifier le script**
Modifiez `scripts/createAdminAccount.js` et changez:
```javascript
const ADMIN_CONFIG = {
  email: 'admin2@petcare.com',  // ← Changez l'email
  password: 'admin2',
  firstName: 'Second',
  lastName: 'Admin',
  phone: '+32 2 111 1111',
  location: 'Belgique'
};
```

Puis exécutez:
```bash
node scripts/createAdminAccount.js
```

---

## 📝 Structure de Données Admin

### Document Firestore (`users/{adminId}`):

```json
{
  "id": "abc123def456",
  "email": "admin@petcare.com",
  "firstName": "Admin",
  "lastName": "PetCare",
  "role": "admin",
  "phone": "+32 2 000 0000",
  "location": "Belgique",
  "avatarUrl": "https://ui-avatars.com/api/?name=Admin+PetCare&background=FF6B00&color=fff",
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

## 🎉 Résumé

✅ Script de création automatique du compte admin  
✅ Connexion: `admin@petcare.com` / `admin`  
✅ Dashboard admin complet  
✅ Gestion des utilisateurs (CRUD)  
✅ Promotion/Rétrogradation des admins  
✅ Approbation des vétérinaires  
✅ Protection contre l'auto-suppression  
✅ Filtres et recherche  
✅ Analytics et statistiques  

---

**Prêt à commencer !** 🚀

Exécutez simplement:
```bash
node scripts/createAdminAccount.js
```

Puis connectez-vous avec `admin@petcare.com` / `admin`





