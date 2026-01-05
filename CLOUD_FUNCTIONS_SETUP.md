# ☁️ Configuration des Cloud Functions Firebase

## 🎯 Pourquoi ?

Les Cloud Functions permettent d'exécuter des actions admin (supprimer, suspendre, etc.) **directement depuis l'app** sans passer par le terminal !

---

## 📦 Étapes d'installation

### 1️⃣ Installer les dépendances des Cloud Functions

```bash
cd /Users/nabiltouil/Documents/Soumiya/PetCare+/functions
npm install
```

### 2️⃣ Installer Firebase CLI (si pas déjà fait)

```bash
npm install -g firebase-tools
```

### 3️⃣ Se connecter à Firebase

```bash
firebase login
```

### 4️⃣ Initialiser Firebase Functions (si pas déjà fait)

```bash
cd /Users/nabiltouil/Documents/Soumiya/PetCare+
firebase init functions
```

Choisissez :
- ✅ Use an existing project
- ✅ JavaScript
- ✅ ESLint? → **No** (optionnel)
- ✅ Install dependencies? → **Yes**

### 5️⃣ Définir les custom claims admin

Pour que les fonctions vérifient les droits admin, exécutez :

```bash
cd /Users/nabiltouil/Documents/Soumiya/PetCare+
node scripts/setAdminClaims.js
```

### 6️⃣ Déployer les Cloud Functions

```bash
cd /Users/nabiltouil/Documents/Soumiya/PetCare+
firebase deploy --only functions
```

Attendez quelques minutes... ⏳

Vous verrez :
```
✔  functions[deleteUser]: Successful create operation.
✔  functions[suspendUser]: Successful create operation.
✔  functions[activateUser]: Successful create operation.
✔  functions[promoteToAdmin]: Successful create operation.
✔  functions[resetUserPassword]: Successful create operation.

✔  Deploy complete!
```

---

## 🧪 Test en local (optionnel)

Pour tester avant de déployer :

```bash
cd /Users/nabiltouil/Documents/Soumiya/PetCare+/functions
npm run serve
```

Puis dans l'app, changez l'URL des fonctions pour pointer vers localhost.

---

## ✅ Vérification

Une fois déployé, allez sur :
https://console.firebase.google.com/project/petcare-2a317/functions

Vous devriez voir vos 5 fonctions listées !

---

## 🚀 Utilisation dans l'app

Une fois déployé, les boutons dans l'app fonctionneront **automatiquement** :

| Bouton | Action | Fonction Cloud |
|--------|--------|----------------|
| 🗑️ Supprimer | Supprime l'utilisateur | `deleteUser` |
| ⏸️ Suspendre | Désactive le compte | `suspendUser` |
| ▶️ Activer | Active le compte | `activateUser` |
| 👑 Promouvoir | Promeut en admin | `promoteToAdmin` |
| 🔐 Mot de passe | Réinitialise le mdp | `resetUserPassword` |

**Plus besoin de terminal !** 🎉

---

## 💰 Coût

Firebase offre :
- ✅ **2 millions d'appels gratuits/mois**
- ✅ Largement suffisant pour votre usage

---

## 🔧 Maintenance

### Voir les logs des fonctions :
```bash
firebase functions:log
```

### Redéployer après modification :
```bash
firebase deploy --only functions
```

### Supprimer une fonction :
```bash
firebase functions:delete functionName
```

---

## ⚠️ Important

Les fonctions vérifient que l'appelant est un **admin** via les custom claims.

Assurez-vous que votre compte admin a les bons custom claims :
```bash
node scripts/setAdminClaims.js
```

---

## 🆘 Problèmes courants

### Erreur: "permission-denied"
→ Votre utilisateur n'a pas les custom claims admin
→ Exécutez `node scripts/setAdminClaims.js`

### Erreur: "functions not deployed"
→ Les fonctions ne sont pas encore déployées
→ Exécutez `firebase deploy --only functions`

### Erreur: "billing required"
→ Firebase nécessite un compte avec facturation pour les fonctions
→ Ajoutez une carte bancaire (gratuit jusqu'à 2M appels/mois)

---

**Une fois configuré, tout fonctionne automatiquement dans l'app !** 🎉






