# Guide de Vérification d'Email 📧

## Vue d'ensemble

Tous les utilisateurs (propriétaires ET vétérinaires) reçoivent maintenant un **email de vérification automatique** lors de l'inscription. Il n'y a plus d'approbation manuelle par l'admin.

## Processus de Vérification

### 1. Pour les Propriétaires d'Animaux

```
1. Inscription sur SignupScreen
   ↓
2. Compte créé dans Firebase Auth
   ↓
3. Email de vérification envoyé automatiquement
   ↓
4. Utilisateur clique sur le lien dans l'email
   ↓
5. Email vérifié ✅
   ↓
6. Connexion possible
```

### 2. Pour les Vétérinaires

```
1. Inscription sur VetSignupScreen
   ↓
2. Compte créé dans Firebase Auth avec role: 'vet'
   ↓
3. Email de vérification envoyé automatiquement
   ↓
4. Utilisateur clique sur le lien dans l'email
   ↓
5. Email vérifié ✅
   ↓
6. Connexion possible (accès direct à l'espace vétérinaire)
```

## Modifications Effectuées

### 1. `firebaseAuth.ts`

#### Fonction `signIn`
- ✅ Vérifie que l'email est vérifié (`user.emailVerified`)
- ❌ **SUPPRIMÉ** : Vérification de `approved: false` pour les vétérinaires
- ✅ Bloque toujours les comptes suspendus/supprimés

**Avant :**
```typescript
// Vérifier si c'est un vétérinaire non approuvé
if (userData.role === 'vet' && userData.approved === false) {
  await signOut(auth);
  const error = new Error('Votre compte vétérinaire est en attente d\'approbation par un administrateur.') as any;
  error.code = 'auth/vet-not-approved';
  throw error;
}
```

**Après :**
```typescript
// Note: La vérification de l'email suffit pour tous les utilisateurs (propriétaires ET vétérinaires)
// Plus besoin d'approbation manuelle pour les vétérinaires
```

#### Fonction `signUpVet`
- ✅ Envoie un email de vérification automatiquement
- ✅ Crée le compte avec `approved: true` (pas besoin d'approbation manuelle)

**Avant :**
```typescript
approved: false, // En attente d'approbation par un admin
```

**Après :**
```typescript
approved: true, // Approuvé automatiquement après vérification d'email
```

### 2. `VetSignupScreen.tsx`

#### Message d'information
**Avant :**
```
Votre compte sera vérifié par un administrateur avant activation
```

**Après :**
```
Vous recevrez un email de vérification après l'inscription
```

#### Message de redirection
**Avant :**
```
Votre compte vétérinaire a été créé avec succès ! 
Vous recevrez une notification une fois qu'un administrateur aura approuvé votre compte.
```

**Après :**
```
Votre compte vétérinaire a été créé avec succès ! 
Vérifiez votre email pour activer votre compte.
```

### 3. `AdminUsersScreen.tsx`

#### Bouton "Approuver"
- ❌ **SUPPRIMÉ** : Le bouton d'approbation manuelle des vétérinaires
- ✅ Les vétérinaires sont automatiquement approuvés après vérification d'email

**Avant :**
```typescript
{/* Approuver vétérinaire en attente */}
{user.approved === false && user.role === 'vet' && (
  <TouchableOpacity 
    style={[styles.actionButton, { backgroundColor: colors.green }]}
    onPress={() => handleUserAction(user, 'approve')}
  >
    <Ionicons name="checkmark" size={18} color={colors.white} />
    <Text style={styles.actionButtonText}>Approuver</Text>
  </TouchableOpacity>
)}
```

**Après :**
```typescript
{/* Note: Plus besoin d'approuver les vétérinaires manuellement, 
    ils reçoivent un email de vérification automatique comme les propriétaires */}
```

## Flux Utilisateur Complet

### Inscription

1. **Utilisateur remplit le formulaire**
   - Propriétaire : `SignupScreen`
   - Vétérinaire : `VetSignupScreen`

2. **Soumission du formulaire**
   - Appel à `signUp()` ou `signUpVet()`
   - Création du compte Firebase Auth
   - Création du document Firestore

3. **Envoi automatique de l'email**
   ```typescript
   await sendEmailVerification(user);
   ```

4. **Redirection vers `EmailVerificationScreen`**
   - Affiche un message explicatif
   - Propose de renvoyer l'email si non reçu

### Vérification

1. **Utilisateur ouvre son email**
2. **Clique sur le lien de vérification**
3. **Firebase marque l'email comme vérifié**
   - `user.emailVerified = true`

### Connexion

1. **Utilisateur se connecte sur `LoginScreen`**
2. **Vérification de l'email**
   ```typescript
   if (!user.emailVerified) {
     throw new Error('Email non vérifié');
   }
   ```
3. **Si vérifié : connexion réussie** ✅
4. **Si non vérifié : erreur affichée** ❌

## Messages d'Erreur

### Email non vérifié
```
Email non vérifié
Veuillez vérifier votre boîte mail et cliquer sur le lien de vérification.
```

### Compte suspendu
```
Votre compte a été suspendu. Contactez l'administrateur.
```

### Compte supprimé
```
Ce compte n'existe plus. Contactez l'administrateur.
```

## Configuration Firebase

### Règles Firestore (inchangées)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && 
                       (request.auth.uid == userId || 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

### Template d'Email (Firebase Console)

Pour personnaliser l'email de vérification :

1. Aller dans **Firebase Console** > **Authentication** > **Templates**
2. Sélectionner **"Email address verification"**
3. Personnaliser le message :

```
Bonjour,

Merci de vous être inscrit sur PetCare+ !

Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :

%LINK%

Si vous n'avez pas créé de compte, ignorez cet email.

L'équipe PetCare+
```

## Avantages de ce Système

### ✅ Simplicité
- Pas besoin d'intervention manuelle de l'admin
- Processus automatisé et rapide

### ✅ Sécurité
- Vérification que l'email appartient bien à l'utilisateur
- Empêche les inscriptions avec des emails invalides

### ✅ Expérience Utilisateur
- Processus identique pour tous les utilisateurs
- Pas d'attente d'approbation manuelle
- Activation immédiate après vérification

### ✅ Scalabilité
- Peut gérer des milliers d'inscriptions sans intervention
- Pas de goulot d'étranglement admin

## Fonctions Disponibles

### Renvoyer l'Email de Vérification

```typescript
import { resendVerificationEmail } from '../services/firebaseAuth';

// Dans un composant
const handleResendEmail = async () => {
  try {
    await resendVerificationEmail();
    Alert.alert('Email envoyé', 'Vérifiez votre boîte mail');
  } catch (error) {
    Alert.alert('Erreur', error.message);
  }
};
```

### Vérifier le Statut de Vérification

```typescript
import { auth } from '../config/firebase';

const isEmailVerified = auth.currentUser?.emailVerified;
```

## Tests

### Test Manuel

1. ✅ Créer un compte propriétaire
2. ✅ Vérifier la réception de l'email
3. ✅ Cliquer sur le lien de vérification
4. ✅ Se connecter avec succès

5. ✅ Créer un compte vétérinaire
6. ✅ Vérifier la réception de l'email
7. ✅ Cliquer sur le lien de vérification
8. ✅ Se connecter avec succès (accès vétérinaire)

9. ✅ Essayer de se connecter sans vérifier l'email
10. ✅ Vérifier que l'erreur est affichée

### Points de Vérification

- [ ] Email de vérification reçu dans les 2 minutes
- [ ] Lien de vérification fonctionnel
- [ ] Connexion bloquée si email non vérifié
- [ ] Connexion autorisée si email vérifié
- [ ] Message d'erreur clair si non vérifié
- [ ] Possibilité de renvoyer l'email

## Dépannage

### Email non reçu

**Causes possibles :**
1. Email dans les spams/courrier indésirable
2. Adresse email invalide
3. Problème de configuration Firebase

**Solutions :**
1. Vérifier les spams
2. Utiliser le bouton "Renvoyer l'email"
3. Vérifier la configuration Firebase Auth

### Lien de vérification expiré

**Cause :** Le lien expire après 24h

**Solution :** Utiliser le bouton "Renvoyer l'email" pour obtenir un nouveau lien

### Email vérifié mais connexion refusée

**Cause :** Cache du navigateur ou de l'app

**Solution :** 
1. Fermer et rouvrir l'app
2. Vider le cache
3. Se reconnecter

## Migration des Vétérinaires Existants

Si vous avez des vétérinaires avec `approved: false` dans Firestore :

### Script de Migration

```javascript
// scripts/migrateVets.js
const admin = require('firebase-admin');
const serviceAccount = require('../petcare-2a317-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateVets() {
  const vetsSnapshot = await db.collection('users')
    .where('role', '==', 'vet')
    .where('approved', '==', false)
    .get();

  console.log(`Found ${vetsSnapshot.size} vets to migrate`);

  for (const doc of vetsSnapshot.docs) {
    const vetData = doc.data();
    const user = await admin.auth().getUser(doc.id);
    
    if (user.emailVerified) {
      // Si l'email est vérifié, approuver automatiquement
      await doc.ref.update({ approved: true });
      console.log(`✅ Approved: ${vetData.email}`);
    } else {
      console.log(`⏳ Waiting for email verification: ${vetData.email}`);
    }
  }
}

migrateVets()
  .then(() => console.log('Migration complete'))
  .catch(console.error);
```

---

**Note :** Ce système est conforme aux meilleures pratiques de sécurité et d'expérience utilisateur. Tous les utilisateurs sont traités de manière égale et automatisée.




