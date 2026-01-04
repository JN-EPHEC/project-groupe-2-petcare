# 🐛 Guide de Debug - Admin Users Screen

## 🎯 Tests ajoutés

J'ai ajouté des alertes de test "TEST" pour chaque bouton. Voici ce que vous devriez voir :

### 1️⃣ **Ouvrez l'app et connectez-vous**
```
Email: admin
Mot de passe: admin123
```

### 2️⃣ **Allez dans "Gestion des utilisateurs"**
- Naviguez depuis le dashboard admin

### 3️⃣ **Ouvrez la console du navigateur**
```
• Chrome/Edge: F12 ou Cmd+Option+I (Mac)
• Firefox: F12 ou Cmd+Option+K (Mac)
• Safari: Cmd+Option+C (Mac)
```

### 4️⃣ **Cherchez ces messages dans la console**
```
📊 Utilisateurs affichés: X
📊 Tous les utilisateurs: Y
```

**Si vous voyez ces messages** ✅
→ L'écran se charge correctement
→ Les utilisateurs sont affichés

**Si vous ne voyez PAS ces messages** ❌
→ L'écran ne charge pas
→ Problème de navigation

---

## 🧪 Test des boutons

Cliquez sur **CHAQUE** bouton et notez ce qui se passe :

### ✅ **Ce qui DEVRAIT se passer :**

#### Bouton "Détails" (bleu):
1. Alerte: `TEST - Bouton Détails cliqué !`
2. Console: `🔵 handleShowDetails appelée pour: email@user.com`
3. Puis: Modal avec les détails s'ouvre

#### Bouton "Modifier" (bleu clair):
1. Alerte: `TEST - Bouton Modifier cliqué !`
2. Console: `✏️ handleEditUser appelée pour: email@user.com`
3. Puis: Modal d'édition s'ouvre

#### Bouton "Mot de passe" (orange):
1. Alerte: `TEST - Bouton Mot de passe cliqué !`
2. Console: `🔐 handleResetPassword appelée pour: email@user.com`
3. Puis: Alerte avec instructions

#### Bouton "Approuver" (vert):
1. Alerte: `TEST - Bouton approve cliqué !`
2. Console: `🎯 handleUserAction appelée - Action: approve`
3. Puis: Popup de confirmation

#### Bouton "Promouvoir Admin" (orange):
1. Alerte: `TEST - Bouton promote_admin cliqué !`
2. Console: `🎯 handleUserAction appelée - Action: promote_admin`
3. Puis: Popup avec instructions

#### Bouton "Suspendre" (gris):
1. Alerte: `TEST - Bouton suspend cliqué !`
2. Console: `🎯 handleUserAction appelée - Action: suspend`
3. Puis: Popup avec instructions

#### Bouton "Supprimer" (rouge):
1. Alerte: `TEST - Bouton delete cliqué !`
2. Console: `🎯 handleUserAction appelée - Action: delete`
3. Puis: Popup avec instructions

---

## 🔍 Diagnostic

### Scénario 1: Rien ne se passe quand vous cliquez
**Symptômes:**
- Pas d'alerte "TEST"
- Rien dans la console
- Pas de réaction visuelle

**Causes possibles:**
1. Les boutons ne sont pas visibles/rendus
2. Un autre élément couvre les boutons
3. Erreur JavaScript qui bloque l'exécution

**Solutions:**
```bash
# 1. Rechargez complètement l'app
# Dans le terminal Expo, appuyez sur 'r'

# 2. Vérifiez les erreurs dans la console
# Cherchez des lignes en rouge

# 3. Redémarrez le serveur
npm start
```

---

### Scénario 2: Alerte "TEST" s'affiche mais rien d'autre
**Symptômes:**
- Alerte "TEST" visible ✅
- Message console visible ✅
- Mais pas d'autres popups ❌

**Causes possibles:**
- Erreur dans la logique du popup
- Problème avec Alert.alert
- Texte trop long qui empêche l'affichage

**Solutions:**
- Regardez s'il y a une erreur dans la console après le "TEST"
- Copiez l'erreur et envoyez-la moi

---

### Scénario 3: Aucun utilisateur affiché
**Symptômes:**
- Page se charge mais vide
- Console dit: `📊 Utilisateurs affichés: 0`

**Causes possibles:**
- Firebase n'a pas d'utilisateurs
- Problème de chargement

**Solutions:**
```bash
# Créez un utilisateur de test
node scripts/createAdminAccount.js
```

---

### Scénario 4: Erreur JavaScript visible
**Symptômes:**
- Écran rouge avec erreur
- Message d'erreur dans la console

**Solutions:**
1. Prenez une capture de l'erreur
2. Copiez le message exact
3. Envoyez-moi le message

---

## 📋 Checklist de vérification

Cochez ce que vous voyez :

**Écran:**
- [ ] L'écran "Gestion des utilisateurs" se charge
- [ ] Je vois la barre de recherche
- [ ] Je vois les filtres (Tous, Propriétaires, etc.)
- [ ] Je vois au moins un utilisateur
- [ ] Je vois les boutons sur chaque utilisateur

**Console:**
- [ ] Je vois `📊 Utilisateurs affichés: X`
- [ ] Je vois `📊 Tous les utilisateurs: Y`
- [ ] Pas d'erreurs en rouge

**Boutons (testez UN SEUL utilisateur):**
- [ ] "Détails" → Alerte "TEST" s'affiche
- [ ] "Modifier" → Alerte "TEST" s'affiche
- [ ] "Mot de passe" → Alerte "TEST" s'affiche
- [ ] "Approuver" (si visible) → Alerte "TEST" s'affiche
- [ ] "Promouvoir" → Alerte "TEST" s'affiche
- [ ] "Supprimer" → Alerte "TEST" s'affiche

---

## 🆘 Si rien ne fonctionne

Essayez dans cet ordre :

```bash
# 1. Recharger l'app (dans Expo)
Press 'r' in terminal

# 2. Effacer le cache et redémarrer
npm start -- --clear

# 3. Si toujours rien, redémarrer le serveur
Ctrl+C (arrêter)
npm start (redémarrer)

# 4. En dernier recours
rm -rf node_modules
npm install
npm start
```

---

## 📸 Captures à envoyer

Si le problème persiste, envoyez-moi :

1. **Capture de l'écran** "Gestion des utilisateurs"
2. **Capture de la console** (avec tous les messages)
3. **Message d'erreur** si vous en voyez un
4. **Résultat de la checklist** ci-dessus

---

## 💡 Note importante

Les alertes "TEST" sont temporaires. Une fois que ça fonctionne, je les retirerai et vous aurez les vrais popups détaillés.





