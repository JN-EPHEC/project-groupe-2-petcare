# Guide d'Upload d'Images pour les Animaux 📸

## Vue d'ensemble

La fonctionnalité d'upload d'images permet aux propriétaires d'animaux d'ajouter des photos de leurs compagnons lors de la création ou de la modification de leur profil.

## Architecture

### 1. Service d'Upload (`imageUploadService.ts`)

Le service gère l'upload des images vers Firebase Storage :

```typescript
// Upload une image d'animal
uploadPetImage(uri: string, userId: string, petId?: string): Promise<string>

// Upload un avatar utilisateur
uploadUserAvatar(uri: string, userId: string): Promise<string>

// Fonction générique d'upload
uploadImage(uri: string, path: string): Promise<string>
```

**Organisation dans Firebase Storage :**
- Images d'animaux : `pets/{userId}/{petId}.jpg`
- Avatars utilisateurs : `avatars/{userId}/{timestamp}.jpg`

### 2. Configuration Firebase

Le module Firebase Storage a été ajouté à la configuration :

```typescript
// src/config/firebase.ts
import { getStorage } from 'firebase/storage';
export const storage = getStorage(app);
```

### 3. Sélection d'Images

Utilise `expo-image-picker` pour :
- **Prendre une photo** avec la caméra
- **Choisir depuis la galerie** une image existante

**Permissions requises :**
- `MediaLibrary` pour accéder à la galerie
- `Camera` pour prendre des photos

### 4. Écrans Modifiés

#### AddPetScreen
- Affiche un placeholder avec icône caméra
- Permet de sélectionner/prendre une photo
- Upload l'image avant de créer l'animal
- Affiche un indicateur de chargement pendant l'upload
- Gère les erreurs d'upload gracieusement

**Fonctionnalités :**
```typescript
pickImage()      // Ouvrir la galerie
takePhoto()      // Ouvrir la caméra
showImageOptions() // Afficher le choix (galerie/caméra)
```

#### PetProfileScreen
- Affiche l'image de l'animal si disponible
- Sinon, affiche l'emoji par défaut
- Image avec bordure blanche et ombre

#### OwnerProfileScreen
- Affiche les images miniatures des animaux dans la liste
- Fallback sur emoji si pas d'image

## Flux d'Utilisation

### 1. Ajout d'un Animal avec Photo

```
1. Utilisateur clique sur "Ajouter un animal"
2. Remplit les informations (nom, espèce, etc.)
3. Clique sur le placeholder d'image
4. Choisit "Prendre une photo" ou "Choisir de la galerie"
5. Sélectionne/prend la photo
6. L'image s'affiche dans le placeholder
7. Clique sur "Enregistrer"
8. L'image est uploadée vers Firebase Storage
9. L'URL de l'image est sauvegardée dans Firestore
10. L'animal est créé avec son image
```

### 2. Affichage des Images

```
OwnerProfileScreen
  ↓
Liste des animaux avec miniatures
  ↓
Clic sur un animal
  ↓
PetProfileScreen avec image en grand
```

## Gestion des Erreurs

### Upload Échoué
Si l'upload échoue :
- Un message d'avertissement est affiché
- L'animal est créé sans photo
- L'utilisateur peut réessayer plus tard

### Permissions Refusées
Si l'utilisateur refuse les permissions :
- Un message explicatif est affiché
- L'utilisateur peut continuer sans photo

### Image Invalide
Si l'image est corrompue ou invalide :
- L'erreur est capturée
- Un message d'erreur est affiché
- L'utilisateur peut réessayer

## Optimisations

### Compression d'Image
`expo-image-picker` est configuré avec :
- `quality: 0.8` (80% de qualité)
- `aspect: [1, 1]` (format carré)
- `allowsEditing: true` (permet de recadrer)

### Performance
- Upload asynchrone (ne bloque pas l'UI)
- Indicateur de chargement pendant l'upload
- Mise en cache des images par React Native

## Structure de Données

### Firestore (Collection `pets`)
```typescript
{
  id: string,
  name: string,
  type: string,
  breed: string,
  age: number,
  weight: number,
  emoji: string,
  ownerId: string,
  gender: string,
  avatarUrl: string | null,  // ← URL de l'image
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Firebase Storage
```
petcare-2a317.firebasestorage.app/
├── pets/
│   ├── {userId1}/
│   │   ├── {petId1}.jpg
│   │   └── {petId2}.jpg
│   └── {userId2}/
│       └── {petId3}.jpg
└── avatars/
    └── {userId}/
        └── {timestamp}.jpg
```

## Sécurité

### Règles Firebase Storage (à configurer)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images d'animaux
    match /pets/{userId}/{petId} {
      allow read: if true;  // Lecture publique
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024  // Max 5MB
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Avatars utilisateurs
    match /avatars/{userId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### Validation
- Taille maximale : 5 MB
- Types acceptés : images uniquement
- Authentification requise pour l'upload
- Seul le propriétaire peut uploader

## Dépendances Installées

```json
{
  "expo-image-picker": "^14.x.x",
  "firebase": "^10.x.x"
}
```

## Prochaines Améliorations Possibles

1. **Édition d'Image**
   - Permettre de changer la photo d'un animal existant
   - Ajouter des filtres ou des stickers

2. **Galerie Multiple**
   - Permettre plusieurs photos par animal
   - Carrousel d'images dans PetProfileScreen

3. **Compression Avancée**
   - Utiliser `expo-image-manipulator` pour plus de contrôle
   - Générer des thumbnails automatiquement

4. **Upload Progressif**
   - Afficher la progression de l'upload (%)
   - Permettre d'annuler l'upload

5. **Stockage Local**
   - Mettre en cache les images localement
   - Mode hors ligne avec synchronisation

## Tests

### Test Manuel
1. ✅ Créer un animal sans photo
2. ✅ Créer un animal avec photo (galerie)
3. ✅ Créer un animal avec photo (caméra)
4. ✅ Vérifier l'affichage dans OwnerProfileScreen
5. ✅ Vérifier l'affichage dans PetProfileScreen
6. ✅ Tester le refus de permissions
7. ✅ Tester avec une connexion lente

### Points de Vérification
- [ ] Les images sont correctement uploadées
- [ ] Les URLs sont sauvegardées dans Firestore
- [ ] Les images s'affichent correctement
- [ ] Les erreurs sont gérées gracieusement
- [ ] Les permissions sont demandées correctement
- [ ] Le loading est visible pendant l'upload

## Support

Pour toute question ou problème :
1. Vérifier les logs de la console
2. Vérifier les règles Firebase Storage
3. Vérifier les permissions de l'app
4. Vérifier la connexion internet

---

**Note :** Cette fonctionnalité nécessite que Firebase Storage soit activé dans votre projet Firebase et que les règles de sécurité soient correctement configurées.




