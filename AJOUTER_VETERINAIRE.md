# 🔧 Comment ajouter un vétérinaire dans Firebase Console

## ⚡ SOLUTION RAPIDE (5 minutes)

### Étape 1 : Ouvrir Firebase Console

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet **PetCare** (ou petcare-2a317)

### Étape 2 : Accéder à Firestore

1. Dans le menu de gauche, cliquez sur **"Firestore Database"**
2. Vous verrez la liste des collections

### Étape 3 : Ouvrir la collection "users"

1. Cliquez sur la collection **"users"**
2. Vous verrez la liste de tous les utilisateurs

### Étape 4 : Créer un nouveau vétérinaire

1. Cliquez sur **"Ajouter un document"** (bouton en haut)
2. Laissez l'ID se générer automatiquement
3. Ajoutez les champs suivants **UN PAR UN** :

#### 📋 CHAMPS OBLIGATOIRES (À ajouter exactement comme ça)

| Champ | Type | Valeur |
|-------|------|--------|
| `role` | **string** | `vet` |
| `approved` | **boolean** | `true` |
| `firstName` | **string** | `Christine` |
| `lastName` | **string** | `Hartono` |
| `email` | **string** | `vet.test@petcare.com` |
| `location` | **string** | `Wavre` |
| `phone` | **string** | `+32 2 234 5678` |
| `specialty` | **string** | `Vétérinaire généraliste` |
| `clinicName` | **string** | `Clinique Vétérinaire de Wavre` |
| `clinicAddress` | **string** | `Rue de la Station 45, 1300 Wavre` |

#### 📋 CHAMPS OPTIONNELS (mais recommandés)

| Champ | Type | Valeur |
|-------|------|--------|
| `isPremiumPartner` | **boolean** | `false` |
| `rating` | **number** | `4.8` |
| `experience` | **string** | `8 ans` |
| `onboardingCompleted` | **boolean** | `true` |

### ⚠️ ATTENTION AUX TYPES !

- **`role`** : DOIT être le texte exact `vet` (string, pas autre chose)
- **`approved`** : DOIT être un booléen `true` (pas la string "true")
- **`firstName`**, **`lastName`** : strings
- **`rating`** : number (pas string)

### Étape 5 : Sauvegarder

1. Cliquez sur **"Enregistrer"** en haut à droite
2. Le document est créé !

### Étape 6 : Vérifier dans l'app

1. Rechargez votre application (Ctrl+R dans le navigateur)
2. Allez sur l'écran **"Vétérinaires à proximité"**
3. ✅ **Christine Hartono** devrait apparaître !

---

## 🔍 VÉRIFIER UN VÉTÉRINAIRE EXISTANT

Si vous avez déjà un vétérinaire mais qu'il n'apparaît pas :

1. Firebase Console → Firestore Database
2. Collection **"users"**
3. Trouvez le document du vétérinaire
4. Vérifiez que ces 2 champs sont **EXACTEMENT** :
   - `role` = `"vet"` (string)
   - `approved` = `true` (boolean)

### Comment modifier un champ ?

1. Cliquez sur le document du vétérinaire
2. Survolez le champ à modifier
3. Cliquez sur l'icône **crayon** ✏️
4. Modifiez la valeur
5. **Attention au type** : string, boolean, number
6. Cliquez sur **"Mettre à jour"**

---

## ❌ ERREURS COURANTES

### Erreur 1 : `role` n'est pas "vet"
```
❌ role: "veterinaire"  → FAUX
❌ role: "Vet"          → FAUX
❌ role: "VET"          → FAUX
✅ role: "vet"          → CORRECT
```

### Erreur 2 : `approved` n'est pas un booléen
```
❌ approved: "true"     → FAUX (c'est une string)
❌ approved: 1          → FAUX (c'est un number)
✅ approved: true       → CORRECT (c'est un boolean)
```

### Erreur 3 : Champs manquants
```
❌ Pas de firstName     → Le nom n'apparaîtra pas
❌ Pas de location      → La recherche ne fonctionnera pas
✅ Tous les champs      → Tout fonctionne
```

---

## 🎯 CHECKLIST FINALE

Avant de fermer Firebase Console, vérifiez :

- [ ] Le document existe dans `users`
- [ ] `role` = `"vet"` (string, minuscules)
- [ ] `approved` = `true` (boolean)
- [ ] `firstName` est renseigné
- [ ] `lastName` est renseigné
- [ ] `location` est renseigné
- [ ] `phone` est renseigné

---

## 🚀 SCRIPTS ALTERNATIFS

Si vous préférez utiliser les scripts Node.js :

### Option 1 : Vérifier les vétérinaires existants
```bash
npm run check-vets
```

### Option 2 : Ajouter un vétérinaire de test
```bash
npm run add-test-vet
```

**Note** : Ces scripts nécessitent `serviceAccountKey.json` (voir instructions dans le terminal)

---

## 💡 BESOIN D'AIDE ?

Si après avoir suivi ce guide le vétérinaire n'apparaît toujours pas :

1. **Ouvrez la console du navigateur** (F12)
2. Allez dans l'onglet **Console**
3. Cherchez les erreurs en rouge
4. Partagez le message d'erreur

---

✨ **Votre vétérinaire devrait maintenant apparaître dans l'application !**



