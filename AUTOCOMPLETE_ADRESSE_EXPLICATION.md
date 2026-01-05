# 📍 Autocomplétion d'adresse - Explication

## 🚨 IMPORTANT : Comportement différent selon la plateforme

### 🌐 SUR LE WEB (Chrome, Firefox, Safari)

**L'autocomplétion Google Places est DÉSACTIVÉE sur le web.**

**Pourquoi ?**
- Google Places Autocomplete (react-native-google-places-autocomplete) n'est PAS compatible avec React Native Web
- Tentative d'utilisation → erreur `Cannot access '_request' before initialization`
- Solution : Saisie manuelle uniquement

**Interface sur web :**
```
┌───────────────────────────────────────────────────┐
│ Adresse complète *                                │
│ ┌───────────────────────────────────────────────┐ │
│ │ Ex: Rue de la Station 45, 1300 Wavre         │ │
│ └───────────────────────────────────────────────┘ │
│ Saisissez l'adresse complète de votre clinique   │
└───────────────────────────────────────────────────┘
```

✅ **Solution sur web :** Saisir manuellement l'adresse complète
- Format : `Rue de la Station 45, 1300 Wavre`
- Puis saisir la ville dans le champ suivant : `Wavre`

---

### 📱 SUR MOBILE (iOS / Android)

**L'autocomplétion Google Places est DISPONIBLE sur mobile.**

**Interface sur mobile :**

**Mode 1 : Saisie manuelle (par défaut)**
```
┌───────────────────────────────────────────────────┐
│ Adresse complète *                                │
│ ┌───────────────────────────────────────────────┐ │
│ │ Ex: Rue de la Station 45, 1300 Wavre         │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ ┌───────────────────────────────────────────────┐ │
│ │  🔍 Autocomplétion                            │ │ ← Bouton pour activer Google Places
│ └───────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

**Mode 2 : Autocomplétion Google Places (activé)**
```
┌───────────────────────────────────────────────────┐
│ Adresse complète *                                │
│ ┌───────────────────────────────────────────────┐ │
│ │ Rue de la Sta...                              │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ ┌─────────────────────────────────────────────┐   │
│ │ 📍 Rue de la Station 45, Wavre              │   │
│ │ 📍 Rue de la Station 12, Bruxelles          │   │
│ │ 📍 Rue de la Gare 3, Namur                  │   │
│ └─────────────────────────────────────────────┘   │
│                                                   │
│ ┌───────────────────────────────────────────────┐ │
│ │  ✏️ Saisir manuellement                       │ │ ← Bouton pour revenir au mode manuel
│ └───────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

**Fonctionnement :**
1. Cliquez sur le bouton "🔍 Autocomplétion"
2. L'interface passe en mode Google Places Autocomplete
3. Tapez quelques lettres (ex: "Rue de la Sta")
4. Google suggère des adresses complètes
5. Cliquez sur une suggestion
6. ✅ L'adresse ET la ville sont automatiquement remplies

---

## 🔧 Code technique

### Détection de la plateforme

```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Saisie manuelle uniquement
} else {
  // Autocomplétion Google Places disponible (iOS/Android)
}
```

### Sur web (ligne 186-196 de EditVetProfileScreen.tsx)

```typescript
{Platform.OS === 'web' ? (
  // Sur web: saisie manuelle uniquement
  <Input
    label="Adresse complète *"
    placeholder="Ex: Rue de la Station 45, 1300 Wavre"
    value={clinicAddress}
    onChangeText={setClinicAddress}
    icon="location-outline"
    multiline
    helperText="Saisissez l'adresse complète de votre clinique"
  />
) : ...}
```

### Sur mobile (ligne 197-238 de EditVetProfileScreen.tsx)

```typescript
{!showAddressSearch ? (
  <>
    <View style={styles.addressContainer}>
      <Input
        label="Adresse complète *"
        placeholder="Ex: Rue de la Station 45, 1300 Wavre"
        value={clinicAddress}
        onChangeText={setClinicAddress}
        icon="location-outline"
        multiline
      />
      <TouchableOpacity
        style={styles.addressSearchButton}
        onPress={() => setShowAddressSearch(true)}
      >
        <Ionicons name="search" size={20} color={colors.white} />
        <Text style={styles.addressSearchText}>Autocomplétion</Text>
      </TouchableOpacity>
    </View>
  </>
) : (
  <View style={styles.autocompleteContainer}>
    <AddressAutocomplete
      label="Adresse complète *"
      placeholder="Rechercher une adresse..."
      defaultValue={clinicAddress}
      onAddressSelect={(address, city, details) => {
        console.log('✅ Address autocomplete:', { address, city });
        setClinicAddress(address);
        setLocation(city);
        setShowAddressSearch(false);
      }}
    />
    <TouchableOpacity
      style={styles.manualModeButton}
      onPress={() => setShowAddressSearch(false)}
    >
      <Ionicons name="create-outline" size={20} color={colors.navy} />
      <Text style={styles.manualModeText}>Saisir manuellement</Text>
    </TouchableOpacity>
  </View>
)}
```

---

## 🎯 Comment utiliser

### Sur le WEB (Chrome, etc.)

1. Allez sur "Modifier le profil" (vétérinaire)
2. Section "Clinique"
3. **Saisissez manuellement** l'adresse dans le champ "Adresse complète"
4. Format : `Rue de la Station 45, 1300 Wavre`
5. Saisissez la ville dans le champ "Ville" : `Wavre`
6. Cliquez sur "Enregistrer les modifications"

### Sur MOBILE (iOS/Android)

**Option 1 : Saisie manuelle**
1. Saisissez directement l'adresse dans le champ "Adresse complète"
2. Saisissez la ville dans le champ "Ville"

**Option 2 : Autocomplétion Google Places**
1. Cliquez sur le bouton "🔍 Autocomplétion" (sous le champ d'adresse)
2. Commencez à taper l'adresse
3. Sélectionnez une suggestion dans la liste
4. ✅ L'adresse ET la ville sont automatiquement remplies

---

## 🔑 Clé API Google Places

**Clé actuelle :** `AIzaSyBtEwktPtW8gXEANn0yf_kWlkSh9ElQtY0`

**⚠️ IMPORTANT : Sécurité**

Cette clé est actuellement en dur dans le code (`AddressAutocomplete.tsx`).

**TODO (URGENT) :**
1. Créer un fichier `.env` à la racine du projet
2. Ajouter : `GOOGLE_PLACES_API_KEY=AIzaSyBtEwktPtW8gXEANn0yf_kWlkSh9ElQtY0`
3. Installer `react-native-dotenv` pour lire les variables d'environnement
4. Remplacer la clé en dur par `process.env.GOOGLE_PLACES_API_KEY`
5. Ajouter `.env` à `.gitignore` (déjà fait)

Voir le guide détaillé : `SECURISER_CLE_API_GOOGLE.md`

---

## 🛠️ Dépannage

### "Je ne vois pas l'autocomplétion Google Places"

**Vérifiez votre plateforme :**
- Sur **web** : Normal, c'est désactivé. Utilisez la saisie manuelle.
- Sur **mobile** : Cliquez sur le bouton "🔍 Autocomplétion" sous le champ d'adresse.

### "Rien ne se passe quand je clique sur Autocomplétion"

**Sur mobile :**
1. Vérifiez que la clé API Google Places est valide
2. Vérifiez que l'API Places est activée dans Google Cloud Console
3. Vérifiez que la restriction d'API est correcte (voir `GOOGLE_PLACES_SETUP.md`)
4. Regardez les logs dans la console : `console.log('✅ Address autocomplete:', { address, city });`

### "J'ai une erreur '_request' before initialization"

C'est normal sur le web. L'autocomplétion Google Places n'est pas compatible avec React Native Web.

---

## 📚 Fichiers concernés

1. **`src/screens/vet/EditVetProfileScreen.tsx`**
   - Écran d'édition du profil vétérinaire
   - Gère l'affichage conditionnel (web vs mobile)
   - Ligne 186-246 : Section "Clinique" avec autocomplétion

2. **`src/components/AddressAutocomplete.tsx`**
   - Composant d'autocomplétion Google Places
   - Utilise `fetch` natif pour appeler l'API Google Places
   - Gère les prédictions et les détails d'adresse

3. **`GOOGLE_PLACES_SETUP.md`**
   - Guide complet pour configurer Google Places API

4. **`SECURISER_CLE_API_GOOGLE.md`**
   - Guide pour sécuriser la clé API

---

## ✅ Résumé

| Plateforme | Autocomplétion Google Places | Saisie manuelle |
|------------|------------------------------|-----------------|
| **Web** (Chrome, Firefox, Safari) | ❌ Non disponible (incompatibilité) | ✅ Disponible |
| **Mobile** (iOS/Android) | ✅ Disponible (via bouton) | ✅ Disponible |

**Sur le web, vous DEVEZ saisir manuellement l'adresse.**

**Sur mobile, vous POUVEZ utiliser l'autocomplétion Google Places.**

---

## 🚀 Prochaines étapes

1. ✅ Saisie manuelle fonctionne sur web et mobile
2. ✅ Autocomplétion Google Places fonctionne sur mobile
3. 🔲 Migrer la clé API vers `.env` (sécurité)
4. 🔲 Tester l'autocomplétion sur un appareil mobile réel (iOS/Android)
5. 🔲 Vérifier les logs lors de l'utilisation de l'autocomplétion

---

**Dernière mise à jour :** 3 janvier 2025




