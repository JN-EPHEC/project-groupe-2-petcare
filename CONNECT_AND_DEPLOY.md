# 🔐 Connexion et Déploiement Firebase

## 📋 Étapes à suivre MAINTENANT :

### 1️⃣ Connectez-vous à Firebase

Dans votre terminal, exécutez :

```bash
firebase login
```

**Une fenêtre de navigateur va s'ouvrir** 🌐

### 2️⃣ Dans le navigateur qui s'ouvre :

Connectez-vous avec :
- **Email** : `soumia.ettouilpro@gmail.com`
- **Mot de passe** : `FIREBASE1340`

### 3️⃣ Autorisez Firebase CLI

Cliquez sur **"Autoriser"** / **"Allow"**

### 4️⃣ Vérifiez la connexion

Retournez au terminal et vérifiez :

```bash
firebase login:list
```

Vous devriez voir :
```
Logged in as soumia.ettouilpro@gmail.com
```

### 5️⃣ Déployez les Cloud Functions

```bash
cd /Users/nabiltouil/Documents/Soumiya/PetCare+
firebase deploy --only functions
```

---

## ⏱️ Le déploiement va prendre 2-3 minutes

Vous verrez défiler :

```
=== Deploying to 'petcare-2a317'...

i  deploying functions
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (XX KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: creating Node.js 18 function deleteUser(us-central1)...
i  functions: creating Node.js 18 function suspendUser(us-central1)...
i  functions: creating Node.js 18 function activateUser(us-central1)...
i  functions: creating Node.js 18 function promoteToAdmin(us-central1)...
i  functions: creating Node.js 18 function resetUserPassword(us-central1)...
✔  functions[deleteUser(us-central1)]: Successful create operation.
✔  functions[suspendUser(us-central1)]: Successful create operation.
✔  functions[activateUser(us-central1)]: Successful create operation.
✔  functions[promoteToAdmin(us-central1)]: Successful create operation.
✔  functions[resetUserPassword(us-central1)]: Successful create operation.

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/petcare-2a317/overview
```

---

## ⚠️ Si vous voyez "Billing required"

Les Cloud Functions nécessitent le **plan Blaze** (avec facturation).

**C'est GRATUIT jusqu'à 2M appels/mois** (largement suffisant)

Pour activer :

1. Allez sur https://console.firebase.google.com/project/petcare-2a317/usage

2. Cliquez sur "**Upgrade to Blaze**"

3. Ajoutez une carte bancaire

4. Confirmez (vous ne serez pas facturé pour un usage normal)

5. Réessayez le déploiement :
```bash
firebase deploy --only functions
```

---

## ✅ Après le déploiement réussi

1. **Vérifiez dans la console** :
   https://console.firebase.google.com/project/petcare-2a317/functions

2. **Testez dans l'app** :
   - Rechargez l'app (touche `r` dans le terminal Expo)
   - Allez dans "Gestion des utilisateurs"
   - Cliquez sur n'importe quel bouton d'action
   - **Ça devrait marcher directement !** 🎉

---

## 🎊 Résultat

**Plus besoin de scripts dans le terminal !**

Les boutons dans l'app fonctionneront automatiquement :
- 🗑️ Supprimer → Supprime directement
- ⏸️ Suspendre → Suspend directement
- ▶️ Activer → Active directement
- 👑 Promouvoir → Promeut directement
- 🔐 Mot de passe → Change directement (avec popup pour le nouveau mdp)

---

**Exécutez `firebase login` maintenant !** 🚀





