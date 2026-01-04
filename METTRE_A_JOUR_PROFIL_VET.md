# 🩺 Mettre à jour le profil vétérinaire dans Firebase

## 🎯 PROBLÈME

Les données affichées dans l'app sont les vraies données de Firebase, MAIS votre profil vétérinaire n'a pas encore tous les champs renseignés dans Firestore !

---

## ✅ SOLUTION : Compléter votre profil dans Firebase Console

### Étape 1 : Ouvrir Firebase Console

1. Allez sur https://console.firebase.google.com
2. Sélectionnez votre projet **PetCare**

### Étape 2 : Trouver votre profil vétérinaire

1. **Firestore Database** → Collection **"users"**
2. Cherchez votre document vétérinaire (avec votre email)
3. Cliquez dessus pour l'ouvrir

### Étape 3 : Ajouter/Modifier les champs suivants

Cliquez sur **"Ajouter un champ"** pour chaque champ manquant, ou modifiez les champs existants.

#### 📋 CHAMPS PROFESSIONNELS (à ajouter/modifier)

| Champ | Type | Valeur exemple | Description |
|-------|------|----------------|-------------|
| `specialty` | **string** | `"Vétérinaire généraliste"` | Votre spécialité |
| `experience` | **string** | `"8 ans"` | Années d'expérience |
| `clinicName` | **string** | `"Clinique Vétérinaire de Wavre"` | Nom de votre clinique |
| `clinicAddress` | **string** | `"Rue de la Station 45, 1300 Wavre"` | Adresse complète |
| `location` | **string** | `"Wavre"` | Ville (pour la recherche) |
| `phone` | **string** | `"+32 2 234 5678"` | Téléphone de la clinique |
| `clinicPhone` | **string** | `"+32 2 234 5678"` | Téléphone (alias) |

#### 📋 CHAMPS OPTIONNELS (mais recommandés)

| Champ | Type | Valeur exemple | Description |
|-------|------|----------------|-------------|
| `consultationRate` | **string** | `"50€"` | Tarif de consultation |
| `emergencyAvailable` | **boolean** | `true` | Disponible pour urgences |
| `rating` | **number** | `4.8` | Note moyenne |
| `isPremiumPartner` | **boolean** | `false` | Partenaire premium |
| `languages` | **array** | `["Français", "English"]` | Langues parlées |
| `services` | **array** | `["Consultations", "Vaccinations", "Chirurgie"]` | Services proposés |

#### 📋 CHAMPS DÉJÀ PRÉSENTS (à vérifier)

| Champ | Valeur requise |
|-------|----------------|
| `role` | `"vet"` |
| `approved` | `true` |
| `firstName` | Votre prénom |
| `lastName` | Votre nom |
| `email` | Votre email |

---

## 🔧 COMMENT AJOUTER UN CHAMP

1. Dans le document vétérinaire, cliquez sur **"Ajouter un champ"**
2. Entrez le **nom du champ** (ex: `specialty`)
3. Sélectionnez le **type** (string, boolean, number, array)
4. Entrez la **valeur** (ex: `Vétérinaire généraliste`)
5. Cliquez sur **"Ajouter"**

---

## 🔧 COMMENT AJOUTER UN ARRAY (pour languages ou services)

1. Ajoutez un champ de type **array**
2. Cliquez sur le champ créé pour l'ouvrir
3. Cliquez sur **"Ajouter un élément"**
4. Type: **string**, Valeur: `"Français"`
5. Répétez pour chaque élément

Exemple pour `languages` :
```
languages (array)
  ├─ 0: "Français"
  ├─ 1: "English"
  └─ 2: "Nederlands"
```

Exemple pour `services` :
```
services (array)
  ├─ 0: "Consultations générales"
  ├─ 1: "Vaccinations"
  ├─ 2: "Chirurgie"
  ├─ 3: "Dentisterie"
  ├─ 4: "Analyses laboratoire"
  └─ 5: "Urgences"
```

---

## ✅ EXEMPLE COMPLET D'UN PROFIL VÉTÉRINAIRE

Voici à quoi devrait ressembler votre document dans Firestore :

```
users/{votre-id}
├─ role: "vet"
├─ approved: true
├─ firstName: "Soum"
├─ lastName: "ETT"
├─ email: "nabil_touil@hotmail.com"
├─ specialty: "Vétérinaire généraliste"
├─ experience: "8 ans"
├─ clinicName: "Clinique Vétérinaire de Wavre"
├─ clinicAddress: "Rue de la Station 45, 1300 Wavre"
├─ location: "Wavre"
├─ phone: "+32 2 234 5678"
├─ consultationRate: "50€"
├─ emergencyAvailable: true
├─ rating: 4.8
├─ isPremiumPartner: false
├─ languages: ["Français", "English", "Nederlands"]
├─ services: ["Consultations générales", "Vaccinations", "Chirurgie", "Dentisterie", "Analyses laboratoire", "Urgences"]
├─ avatarUrl: "https://..." (si photo uploadée)
└─ onboardingCompleted: true
```

---

## 🚀 APRÈS LA MISE À JOUR

1. **Sauvegardez** tous les changements dans Firebase Console
2. **Rechargez l'app** (Ctrl+R dans le navigateur)
3. **Reconnectez-vous** si nécessaire
4. ✅ **Votre profil affichera les VRAIES données !**

---

## 📊 STATISTIQUES (AUTOMATIQUES ✨)

Les statistiques suivantes sont maintenant **CALCULÉES AUTOMATIQUEMENT** depuis Firebase :

### ✅ Déjà calculées automatiquement :
- **Nombre de patients** : Compte automatiquement tous les animaux liés à votre ID vétérinaire
- **Années d'expérience** : 
  - Si vous avez le champ `experience` (ex: "8 ans"), il extrait le nombre
  - Sinon, calcule depuis votre date de création de compte
  - Si aucune donnée : affiche "N/A"

### 🔜 À implémenter plus tard :
- **Nombre de consultations** : Nécessite la collection `appointments` (pas encore créée)
- **Note et avis** : Affiche `user.rating` et `user.reviewsCount` si renseignés

### 💡 Pour afficher votre notation :
Ajoutez ces champs dans votre profil Firebase :
- `rating` (number) : ex: `4.8`
- `reviewsCount` (number) : ex: `127`

Si ces champs ne sont pas renseignés, la note affichera "N/A".

---

## 💡 CONSEIL

Renseignez au minimum ces champs pour que votre profil soit complet :
- ✅ `specialty`
- ✅ `clinicName`
- ✅ `clinicAddress`
- ✅ `phone`
- ✅ `location`

Le reste peut être ajouté progressivement.

---

## ❓ BESOIN D'AIDE ?

Si vous ne voyez toujours pas vos données après la mise à jour :

1. Vérifiez que vous êtes bien **connecté** avec votre compte vétérinaire
2. Vérifiez dans Firebase Console que `role = "vet"` et `approved = true`
3. **Déconnectez-vous** et **reconnectez-vous**
4. Ouvrez la **console du navigateur** (F12) et cherchez les erreurs

---

✨ **Votre profil affichera maintenant vos vraies données !**

