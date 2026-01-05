# 🚀 Instructions de déploiement des Cloud Functions

## ⚠️ Problème rencontré

Le compte `nabil.t93@gmail.com` connecté actuellement **n'a pas les droits** sur le projet Firebase `petcare-2a317`.

Le projet appartient au compte : **soumia.ettouilpro@gmail.com**

---

## ✅ Solution : Déployer avec le bon compte

### Option 1 : Se connecter avec le compte propriétaire

```bash
# 1. Se déconnecter du compte actuel
firebase logout

# 2. Se reconnecter avec le compte propriétaire
firebase login
# ⚠️ Connectez-vous avec: soumia.ettouilpro@gmail.com

# 3. Vérifier la connexion
firebase login:list
# Vous devriez voir: Logged in as soumia.ettouilpro@gmail.com

# 4. Déployer les fonctions
cd /Users/nabiltouil/Documents/Soumiya/PetCare+
firebase deploy --only functions
```

---

### Option 2 : Ajouter des droits au compte actuel

**Dans la Firebase Console** (avec le compte soumia.ettouilpro@gmail.com):

1. Allez sur https://console.firebase.google.com/project/petcare-2a317/settings/iam

2. Cliquez sur "Add member" (Ajouter un membre)

3. Ajoutez `nabil.t93@gmail.com` avec le rôle:
   - **Firebase Admin** (pour tout gérer)
   - OU **Cloud Functions Admin** (pour déployer les fonctions uniquement)

4. Puis réessayez:
```bash
cd /Users/nabiltouil/Documents/Soumiya/PetCare+
firebase deploy --only functions
```

---

### Option 3 : Utiliser un token d'accès

```bash
# 1. Générer un token avec le compte propriétaire
# (exécutez sur l'ordinateur avec le compte soumia.ettouilpro@gmail.com)
firebase login:ci

# 2. Copiez le token affiché
# Exemple: 1//abcdefghijklmnop...

# 3. Sur votre machine, utilisez le token:
export FIREBASE_TOKEN="votre-token-ici"
firebase deploy --only functions --token $FIREBASE_TOKEN
```

---

## 🎯 Recommandation

**Option 1** est la plus simple si vous avez accès au compte `soumia.ettouilpro@gmail.com`.

**Option 2** est meilleure si plusieurs personnes doivent déployer.

---

## 📋 Après le déploiement réussi

Une fois déployé, vous verrez :

```
✔  functions[deleteUser(us-central1)]: Successful create operation.
✔  functions[suspendUser(us-central1)]: Successful create operation.
✔  functions[activateUser(us-central1)]: Successful create operation.
✔  functions[promoteToAdmin(us-central1)]: Successful create operation.
✔  functions[resetUserPassword(us-central1)]: Successful create operation.

✔  Deploy complete!

Functions URL (deleteUser(us-central1)): https://us-central1-petcare-2a317.cloudfunctions.net/deleteUser
```

---

## ✅ Vérification

1. Allez sur : https://console.firebase.google.com/project/petcare-2a317/functions

2. Vous devriez voir vos 5 nouvelles fonctions listées

3. Testez dans l'app - les boutons devraient maintenant fonctionner !

---

## 💰 Coût

⚠️ **Important** : Les Cloud Functions nécessitent le plan **Blaze** (avec facturation).

- Gratuit jusqu'à 2M invocations/mois
- Au-delà : ~$0.40 par million d'invocations supplémentaires

**Pour activer le plan Blaze:**

1. Allez sur https://console.firebase.google.com/project/petcare-2a317/usage

2. Cliquez sur "Upgrade"

3. Ajoutez une carte bancaire (vous ne serez pas facturé si vous restez sous les limites gratuites)

---

## 🆘 Aide supplémentaire

Si vous avez des questions ou problèmes :

1. Vérifiez que vous êtes connecté avec le bon compte :
```bash
firebase login:list
```

2. Vérifiez que le projet existe :
```bash
firebase projects:list
```

3. Vérifiez les droits du compte :
```bash
firebase apps:list --project petcare-2a317
```






