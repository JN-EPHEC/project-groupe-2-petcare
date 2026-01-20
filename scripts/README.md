# 🛠️ Scripts d'Administration Firebase

Ces scripts nécessitent **Firebase Admin SDK** pour effectuer des actions administratives sur Firebase Authentication et Firestore.

## 📋 Scripts disponibles

### 1. Réinitialiser un mot de passe
```bash
node scripts/resetUserPassword.js <email> <nouveauMotDePasse>
```
**Exemple:**
```bash
node scripts/resetUserPassword.js user@example.com newPassword123
```
- ✅ Le mot de passe doit contenir au moins 6 caractères
- ✅ Change le mot de passe dans Firebase Auth

---

### 2. Supprimer un utilisateur
```bash
node scripts/deleteUser.js <email>
```
**Exemple:**
```bash
node scripts/deleteUser.js user@example.com
```
- ⚠️ **Action irréversible !**
- Supprime l'utilisateur de Firebase Auth
- Supprime le document Firestore

---

### 3. Promouvoir en administrateur
```bash
node scripts/promoteToAdmin.js <email>
```
**Exemple:**
```bash
node scripts/promoteToAdmin.js user@example.com
```
- 👑 Donne les privilèges admin
- Met à jour le rôle dans Firestore
- Définit les custom claims dans Firebase Auth

---

### 4. Suspendre/Activer un compte
**Suspendre:**
```bash
node scripts/suspendUser.js <email> suspend
```

**Activer:**
```bash
node scripts/suspendUser.js <email> activate
```

**Exemples:**
```bash
node scripts/suspendUser.js user@example.com suspend
node scripts/suspendUser.js user@example.com activate
```
- ⏸️ Suspend = l'utilisateur ne peut plus se connecter
- ▶️ Activate = l'utilisateur peut se reconnecter
- Met à jour Firebase Auth ET Firestore

---

## 🚀 Comment utiliser

### Depuis le terminal :
```bash
# 1. Naviguer vers le dossier du projet
cd /Users/nabiltouil/Documents/Soumiya/PetCare+

# 2. Exécuter le script souhaité
node scripts/resetUserPassword.js user@email.com newPassword

# 3. Vérifier le résultat
# ✅ = Succès
# ❌ = Erreur (vérifier le message)
```

### Depuis l'app admin :
1. Cliquez sur un bouton d'action (Supprimer, Suspendre, etc.)
2. Une alerte affiche la commande à exécuter
3. Copiez la commande
4. Exécutez-la dans votre terminal
5. Rafraîchissez la liste des utilisateurs dans l'app

---

## ⚙️ Prérequis

1. **Node.js** installé
2. **Firebase Admin SDK** configuré
3. Fichier `petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json` présent
4. Accès au terminal

---

## 🔧 Dépannage

### Erreur : "Cannot find module"
```bash
npm install firebase-admin
```

### Erreur : "auth/user-not-found"
→ Aucun utilisateur trouvé avec cet email  
→ Vérifiez l'orthographe de l'email

### Erreur : "auth/invalid-email"
→ Format d'email invalide  
→ Utilisez un email valide (ex: user@example.com)

### Erreur : "Error: Could not load the default credentials"
→ Fichier de credentials Admin SDK manquant  
→ Vérifiez que `petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json` existe

---

## 📚 Documentation

Voir `ADMIN_USER_MANAGEMENT_GUIDE.md` pour plus de détails sur la gestion des utilisateurs.

---

**Note**: Ces scripts sont conçus pour être utilisés par les administrateurs système. Utilisez-les avec précaution, surtout pour la suppression d'utilisateurs.









