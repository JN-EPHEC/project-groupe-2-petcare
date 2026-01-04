# 📋 Guide de Gestion des Utilisateurs - Admin

## 🎯 Accès à la page de gestion

1. Connectez-vous avec un compte admin : `admin` / `admin123`
2. Naviguez vers **Admin Dashboard** → **Gestion des utilisateurs**

## 🔧 Fonctionnalités disponibles

### 1. **Voir les détails d'un utilisateur** 📝
- Cliquez sur le bouton **"Détails"** bleu
- Affiche toutes les informations :
  - Nom complet, email, téléphone
  - Localisation, rôle, statut
  - ID utilisateur
  - Pour les vétérinaires : spécialité, clinique, statut d'approbation

### 2. **Modifier le profil d'un utilisateur** ✏️
- Cliquez sur le bouton **"Modifier"** bleu clair
- Vous pouvez modifier :
  - Prénom et nom
  - Téléphone
  - Localisation
- Les modifications sont sauvegardées dans Firebase

### 3. **Réinitialiser le mot de passe** 🔐
- Cliquez sur le bouton **"Mot de passe"** orange
- Une alerte affiche la commande à exécuter :
  ```bash
  node scripts/resetUserPassword.js email@exemple.com nouveauMotDePasse
  ```
- Le mot de passe doit contenir au moins 6 caractères
- Exemple :
  ```bash
  cd /Users/nabiltouil/Documents/Soumiya/PetCare+
  node scripts/resetUserPassword.js marie@example.com marie123
  ```

### 4. **Approuver un vétérinaire** ✅
- Visible uniquement pour les vétérinaires en attente
- Cliquez sur **"Approuver"** vert
- Le vétérinaire peut alors accéder à l'application

### 5. **Promouvoir en administrateur** 👑
- Cliquez sur **"Promouvoir Admin"** orange
- Une alerte affiche la commande à exécuter :
  ```bash
  node scripts/promoteToAdmin.js email@exemple.com
  ```
- L'utilisateur obtient tous les privilèges admin
- Accès au dashboard admin complet

### 6. **Rétrograder un administrateur** ⬇️
- Visible uniquement pour les admins
- Cliquez sur **"Rétrograder"** violet
- ✅ **Fonctionne directement depuis l'app**
- L'utilisateur redevient propriétaire

### 7. **Suspendre un compte** ⏸️
- Cliquez sur **"Suspendre"** gris
- Une alerte affiche la commande à exécuter :
  ```bash
  node scripts/suspendUser.js email@exemple.com suspend
  ```
- L'utilisateur ne peut plus se connecter
- Le statut passe à "Suspendu"

### 8. **Activer un compte suspendu** ▶️
- Cliquez sur **"Activer"** vert
- Une alerte affiche la commande à exécuter :
  ```bash
  node scripts/suspendUser.js email@exemple.com activate
  ```
- L'utilisateur peut à nouveau se connecter
- Le statut passe à "Actif"

### 9. **Supprimer un utilisateur** 🗑️
- Cliquez sur **"Supprimer"** rouge
- Une alerte affiche la commande à exécuter :
  ```bash
  node scripts/deleteUser.js email@exemple.com
  ```
- ⚠️ **ATTENTION** : Cette action est irréversible
- Supprime l'utilisateur de Firebase Auth ET Firestore
- Vous ne pouvez pas supprimer votre propre compte

## 🎯 Pourquoi utiliser des scripts ?

Certaines actions (supprimer, suspendre, promouvoir) nécessitent **Firebase Admin SDK** pour modifier Firebase Authentication. Ces actions ne peuvent pas être faites directement depuis l'app mobile.

**Actions directes** (sans script) :
- ✅ Voir détails
- ✅ Modifier profil
- ✅ Approuver vétérinaire
- ✅ Rétrograder admin

**Actions via scripts** (nécessitent terminal) :
- 🔧 Supprimer utilisateur
- 🔧 Suspendre/Activer
- 🔧 Promouvoir admin
- 🔧 Réinitialiser mot de passe

## 🔍 Filtres et recherche

### Recherche
- Utilisez la barre de recherche en haut
- Recherche par nom, prénom ou email
- Recherche en temps réel

### Filtres par rôle
- **Tous** : Affiche tous les utilisateurs
- **Propriétaires** : Uniquement les propriétaires d'animaux
- **Vétérinaires** : Uniquement les vétérinaires
- **Admins** : Uniquement les administrateurs

## 🛡️ Protections de sécurité

1. **Vous ne pouvez pas modifier votre propre compte**
   - Pas de suppression
   - Pas de suspension
   - Pas de rétrogradation

2. **Confirmations obligatoires**
   - Toutes les actions importantes demandent confirmation
   - Double vérification pour la suppression

3. **Logs d'activité**
   - Toutes les modifications sont enregistrées avec timestamp
   - Traçabilité complète dans Firestore

## 💡 Astuces

- **Rafraîchir la liste** : Cliquez sur l'icône 🔄 en haut à droite
- **Vétérinaires en attente** : Badge orange "En attente"
- **Comptes suspendus** : Badge rouge "Suspendu"
- **Comptes actifs** : Badge vert "Actif"

## 🚀 Exemples d'utilisation

### Scénario 1 : Nouveau vétérinaire
1. Vérifier les détails (diplômes, licence) → Cliquer "Détails"
2. Approuver le compte → Bouton vert "Approuver" ✅
3. Le vétérinaire reçoit l'accès immédiatement

### Scénario 2 : Utilisateur oublié son mot de passe
1. Cliquer sur "Mot de passe"
2. Copier la commande affichée
3. Exécuter dans le terminal :
   ```bash
   cd /Users/nabiltouil/Documents/Soumiya/PetCare+
   node scripts/resetUserPassword.js user@email.com nouveauMdp123
   ```
4. Informer l'utilisateur du nouveau mot de passe

### Scénario 3 : Modifier les informations d'un utilisateur
1. Cliquer sur "Modifier" ✅
2. Changer les informations nécessaires
3. Cliquer sur "Enregistrer"
4. ✅ Changements appliqués immédiatement

### Scénario 4 : Promouvoir quelqu'un en admin
1. Cliquer sur "Promouvoir Admin"
2. Copier la commande affichée
3. Exécuter dans le terminal :
   ```bash
   cd /Users/nabiltouil/Documents/Soumiya/PetCare+
   node scripts/promoteToAdmin.js user@email.com
   ```
4. L'utilisateur peut maintenant accéder au dashboard admin

### Scénario 5 : Compte suspect
1. Cliquer sur "Suspendre"
2. Copier et exécuter la commande :
   ```bash
   node scripts/suspendUser.js user@email.com suspend
   ```
3. Vérifier l'activité
4. Si tout est OK : Cliquer "Activer" et exécuter la commande
5. Sinon : Cliquer "Supprimer" et exécuter la commande

## 📝 Scripts disponibles

| Script | Usage | Description |
|--------|-------|-------------|
| `resetUserPassword.js` | `node scripts/resetUserPassword.js <email> <newPassword>` | Réinitialise le mot de passe |
| `deleteUser.js` | `node scripts/deleteUser.js <email>` | Supprime complètement l'utilisateur |
| `promoteToAdmin.js` | `node scripts/promoteToAdmin.js <email>` | Promeut en administrateur |
| `suspendUser.js` | `node scripts/suspendUser.js <email> suspend` | Suspend le compte |
| `suspendUser.js` | `node scripts/suspendUser.js <email> activate` | Active le compte |

## 📞 Support

En cas de problème :
1. Vérifier les logs de la console
2. Vérifier Firebase Console
3. Contacter le développeur

## ⚙️ Configuration requise

- Node.js installé
- Accès au terminal
- Firebase Admin SDK configuré
- Fichier `petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json` présent

---

**Version** : 1.0  
**Dernière mise à jour** : Décembre 2025

