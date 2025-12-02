# 🌐 Guide du Système de Changement de Langue

## Vue d'ensemble

L'application PetCare+ supporte maintenant **deux langues** : **Français (FR)** et **Anglais (EN)**.

Le système permet aux utilisateurs de basculer instantanément entre les deux langues, avec persistance de leur choix.

---

## ✨ Fonctionnalités

✅ **Support complet FR/EN** - Tous les écrans et textes de l'application sont traduits
✅ **Changement instantané** - Pas besoin de redémarrer l'app
✅ **Persistance** - La langue choisie est sauvegardée et restaurée au prochain lancement
✅ **UI intuitive** - Bouton de changement de langue visible dans les écrans clés
✅ **Fallback intelligent** - Français par défaut si aucune langue n'est définie

---

## 🎯 Où trouver le Language Switcher

Le bouton de changement de langue (FR | EN) est disponible dans :

1. **Écran Splash** - En haut à droite (première chose visible au lancement)
2. **Écran Profil** - En haut à droite (à côté du bouton paramètres)

Le bouton affiche :
- **FR | EN** avec la langue active en gras et en couleur navy
- La langue inactive en gris
- Design cohérent avec le reste de l'app (lightBlue background, coins arrondis)

---

## 📁 Structure des fichiers

### Nouveaux fichiers créés

```
src/
├── i18n/
│   ├── config.ts                    # Configuration i18next
│   └── locales/
│       ├── fr.json                  # Traductions françaises
│       └── en.json                  # Traductions anglaises
├── context/
│   └── LanguageContext.tsx          # Context pour la gestion de langue
└── components/
    └── LanguageSwitcher.tsx         # Composant bouton de changement
```

### Fichiers modifiés

- **`App.tsx`** - Ajout du LanguageProvider
- **`src/components/index.ts`** - Export du LanguageSwitcher
- **Tous les écrans (20+ fichiers)** - Remplacement des textes hardcodés par des clés de traduction

---

## 🔧 Comment ça marche

### 1. Configuration i18n (`src/i18n/config.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Détecte et sauvegarde automatiquement la langue choisie
// Français par défaut
```

### 2. Fichiers de traduction

**`fr.json`** et **`en.json`** contiennent toutes les traductions organisées par section :

```json
{
  "auth": { ... },      // Authentification (Splash, Login, Signup)
  "home": { ... },      // Écrans d'accueil
  "profile": { ... },   // Écrans de profil
  "health": { ... },    // Écrans de santé
  "emergency": { ... }, // Écrans d'urgence
  "premium": { ... },   // Écran premium
  "common": { ... }     // Textes communs (boutons, messages)
}
```

### 3. Context de langue (`LanguageContext.tsx`)

Gère l'état global de la langue avec :
- `currentLanguage`: Langue actuelle ('fr' ou 'en')
- `changeLanguage(lang)`: Fonction pour changer de langue
- `isLoading`: État de chargement

### 4. Utilisation dans les écrans

**Avant :**
```tsx
<Text style={styles.title}>Se connecter</Text>
```

**Après :**
```tsx
import { useTranslation } from 'react-i18next';

const MyScreen = () => {
  const { t } = useTranslation();
  
  return (
    <Text style={styles.title}>{t('auth.login.title')}</Text>
  );
};
```

---

## 📝 Ajouter une nouvelle traduction

### Étape 1 : Ajouter la clé dans les fichiers JSON

**`src/i18n/locales/fr.json`** :
```json
{
  "mySection": {
    "myKey": "Mon texte en français"
  }
}
```

**`src/i18n/locales/en.json`** :
```json
{
  "mySection": {
    "myKey": "My text in English"
  }
}
```

### Étape 2 : Utiliser dans votre écran

```tsx
import { useTranslation } from 'react-i18next';

export const MyScreen = () => {
  const { t } = useTranslation();
  
  return (
    <Text>{t('mySection.myKey')}</Text>
  );
};
```

### Étape 3 : Avec interpolation (variables dynamiques)

**JSON :**
```json
{
  "greeting": "Bonjour {name} !"
}
```

**Usage :**
```tsx
<Text>{t('greeting', { name: 'Alice' })}</Text>
// Résultat : "Bonjour Alice !"
```

---

## 🎨 Personnaliser le Language Switcher

Le composant `LanguageSwitcher.tsx` peut être personnalisé :

```tsx
// Styles actuels
const styles = StyleSheet.create({
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,  // Couleur de fond
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,                   // Coins arrondis
    gap: spacing.xs,
  },
  activeLanguage: {
    color: colors.navy,                  // Couleur langue active
    fontWeight: typography.fontWeight.bold,
  },
});
```

---

## 🐛 Dépannage

### La langue ne change pas

1. Vérifier que la clé existe dans les deux fichiers JSON
2. Vérifier l'orthographe de la clé : `t('auth.login.title')` est sensible à la casse
3. Relancer l'app si le problème persiste

### Texte non traduit qui apparaît

Si un texte apparaît non traduit (ex: "auth.login.title" au lieu de "Se connecter") :
- La clé n'existe pas dans le fichier JSON
- Vérifier le chemin de la clé dans le fichier de traduction

### Réinitialiser la langue

Pour forcer la réinitialisation :
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.removeItem('@petcare_language');
// Puis redémarrer l'app
```

---

## 📊 Statistiques

- **2 langues supportées** : Français, Anglais
- **20+ écrans traduits**
- **200+ clés de traduction**
- **5 fichiers principaux créés**
- **25+ fichiers modifiés**

---

## 🚀 Prochaines étapes possibles

- [ ] Ajouter d'autres langues (néerlandais, allemand, espagnol...)
- [ ] Détection automatique de la langue du système
- [ ] Traduction des données dynamiques (noms de vaccins, spécialités vétérinaires)
- [ ] Export/import des fichiers de traduction pour les traducteurs
- [ ] Tests unitaires pour les traductions manquantes

---

## 💡 Bonnes pratiques

✅ **DO:**
- Toujours utiliser `t('key')` pour les textes affichés
- Organiser les clés par section logique
- Utiliser des noms de clés descriptifs
- Tester dans les deux langues après chaque modification

❌ **DON'T:**
- Ne jamais hardcoder du texte directement dans les composants
- Ne pas oublier de traduire les alerts et messages d'erreur
- Ne pas dupliquer les clés de traduction

---

## 📞 Support

Pour toute question ou problème avec le système de traduction :
1. Consulter ce guide
2. Vérifier les fichiers de traduction dans `src/i18n/locales/`
3. Vérifier l'implémentation dans `LanguageContext.tsx`

---

**Date de création** : 20 novembre 2024
**Version** : 1.0.0
**Status** : ✅ Implémenté et fonctionnel

