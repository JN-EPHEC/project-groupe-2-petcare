# 🔧 FIX SCROLL WEB - INSTRUCTIONS COMPLÈTES

## ⚠️ PROBLÈME
Le scroll ne fonctionne pas en mode mobile Chrome / navigateur web

## ✅ SOLUTION APPLIQUÉE

### 1. Fichier CSS Global créé : `web-styles.css`
Contient les règles CSS pour forcer le scroll sur tous les ScrollView

### 2. Modifications App.tsx
Import du CSS uniquement sur web avec Platform.OS === 'web'

### 3. Écrans modifiés avec fix scroll :
- ✅ LoginScreen
- ✅ OnboardingWizardScreen  
- ✅ HomeScreen

### 4. Style ajouté sur tous ces écrans :
```typescript
container: {
  flex: 1,
  ...(Platform.OS === 'web' ? {
    height: '100vh',
    overflow: 'hidden',
  } : {}),
}
```

## 🚀 COMMENT TESTER

1. **Arrêtez le serveur** : Ctrl+C dans le terminal

2. **Nettoyez le cache** :
```bash
npx expo start -c
```

3. **Rechargez complètement le navigateur** :
   - Fermez l'onglet
   - Rouvrez http://localhost:8081
   - Ou faites Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

4. **Ouvrez Chrome DevTools** :
   - F12
   - Cliquez sur l'icône mobile 📱
   - Choisissez un appareil (iPhone, Pixel, etc.)

5. **Testez le scroll** :
   - Cliquez dans la page
   - Utilisez la molette
   - Ou faites glisser

## 🔍 SI ÇA NE MARCHE TOUJOURS PAS

Vérifiez dans la console du navigateur (F12 → Console) :
- Pas d'erreurs JavaScript ?
- Le fichier web-styles.css est-il chargé ?

Essayez aussi en mode navigateur normal (pas en mode mobile) pour voir si le scroll fonctionne.

## 📱 ALTERNATIVE

Si le problème persiste sur web, testez sur :
- **Expo Go** (app mobile) : Le scroll marche parfaitement
- **Build Android/iOS** : Aucun problème de scroll
- Le problème est UNIQUEMENT sur React Native Web

