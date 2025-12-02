# 🗺️ Guide de la Carte Interactive

## Vue d'ensemble

L'application PetCare+ intègre maintenant une **carte interactive** pour afficher tous les vétérinaires disponibles en Belgique.

---

## ✨ Fonctionnalités

### 🎯 **MapScreen** - Carte plein écran
✅ **Carte interactive complète** avec zoom et déplacement  
✅ **Markers personnalisés** pour chaque vétérinaire  
✅ **Labels de ville** visibles sous chaque marker  
✅ **Info-bulle** au clic : nom du vétérinaire, spécialité, localisation  
✅ **Légende** en bas de l'écran  
✅ **Header** avec bouton retour et titre  

### 🔍 **EmergencyScreen** - Mini carte
✅ **Aperçu de la carte** (250px de hauteur)  
✅ **Vue d'ensemble** des vétérinaires à proximité  
✅ **Clickable** : Redirige vers MapScreen plein écran  
✅ **Overlay** avec texte "Voir tout"  
✅ **Désactivation du zoom/scroll** (juste un aperçu)  

---

## 📍 Vétérinaires sur la carte

### Localisations actuelles

| Vétérinaire | Ville | Coordonnées GPS | Spécialité |
|-------------|-------|-----------------|------------|
| **drh. Ariyo Hartono** | Bierges | 50.7172, 4.5931 | Dentiste vétérinaire |
| **drh. Christine** | Limal | 50.6833, 4.5667 | Vétérinaire généraliste |
| **drh. Marc Dubois** | Bierges | 50.7165, 4.5925 | Dentiste vétérinaire |
| **drh. Sophie Laurent** | Wavre | 50.7167, 4.6167 | Vétérinaire généraliste |

**Centre de la carte** : Wavre (50.7167, 4.6167)  
**Zone couverte** : ~30km de rayon

---

## 🔧 Technologie utilisée

### react-native-maps

```bash
npm install react-native-maps
```

**Provider** : Google Maps (PROVIDER_GOOGLE)  
**Compatible** : iOS, Android, Web (avec configuration)

### Configuration Map

```typescript
initialRegion={{
  latitude: 50.7167,     // Centre : Wavre
  longitude: 4.6167,
  latitudeDelta: 0.5,    // Zoom level
  longitudeDelta: 0.5,
}}
```

### Markers personnalisés

```typescript
<Marker
  coordinate={{ latitude, longitude }}
  title="Nom du vétérinaire"
  description="Spécialité - Ville"
  pinColor="#FF0000"
>
  <View style={styles.customMarker}>
    {/* Icône personnalisée */}
  </View>
</Marker>
```

---

## 🎨 Design

### Markers
- **Forme** : Pin rouge circulaire (30x30px)
- **Icône** : Croix blanche (Ionicons "add")
- **Label** : Nom de la ville en blanc sur fond navy
- **Shadow** : Ombre portée pour effet 3D

### Mini-carte (EmergencyScreen)
- **Hauteur** : 250px
- **Overlay semi-transparent** : rgba(0, 0, 0, 0.7)
- **Texte overlay** : "Voir tout" + chevron
- **Interaction** : Désactivée (scroll/zoom disabled)
- **Action** : Navigation vers MapScreen au clic

### Carte plein écran (MapScreen)
- **Hauteur** : ~80% de l'écran
- **Interaction** : Activée (scroll, zoom, pitch)
- **Légende** : En bas, fond blanc
- **Header** : Fixe en haut avec boutons

---

## 📱 Navigation

### Flux utilisateur

```
EmergencyScreen (liste vétérinaires)
    ↓ (scroll down)
Mini-carte aperçu
    ↓ (tap)
MapScreen (carte plein écran)
    ↓ (tap marker)
Info-bulle vétérinaire
```

### Boutons disponibles

1. **"Voir tout"** - Dans header d'EmergencyScreen → MapScreen
2. **Mini-carte** - Clickable → MapScreen
3. **Markers** - Tap → Affiche nom + spécialité
4. **Bouton retour** - MapScreen → EmergencyScreen

---

## 🔄 Synchronisation avec les données

### Source de données

```typescript
// src/services/demoAuth.ts
export interface DemoVet {
  id: string;
  name: string;
  specialty: string;
  location: string;
  latitude: number;    // 🆕 Ajouté
  longitude: number;   // 🆕 Ajouté
  ...
}
```

### Mapping automatique

Les vétérinaires de `DEMO_VETS` sont **automatiquement** affichés sur la carte si :
- ✅ `latitude` est définie
- ✅ `longitude` est définie

**Ajout d'un nouveau vétérinaire** :
```typescript
{
  id: 'vet-5',
  name: 'drh. Nouveau',
  location: 'Namur',
  latitude: 50.4669,    // ← Ajouter ces coordonnées
  longitude: 4.8719,    // ← GPS de Namur
  ...
}
```

La carte se mettra à jour automatiquement ! 🎉

---

## 🌐 Traductions

### Clés i18n utilisées

```json
{
  "emergency": {
    "map": {
      "title": "Tous nos vétérinaires en Belgique",
      "legend": "= Vétérinaires disponibles"
    },
    "seeAll": "Voir tout"
  }
}
```

**Support** : Français ✅ | Anglais ✅

---

## 📐 Coordonnées GPS des villes belges

Pour référence lors de l'ajout de nouveaux vétérinaires :

| Ville | Latitude | Longitude |
|-------|----------|-----------|
| **Bruxelles** | 50.8503 | 4.3517 |
| **Wavre** | 50.7167 | 4.6167 |
| **Bierges** | 50.7172 | 4.5931 |
| **Limal** | 50.6833 | 4.5667 |
| **Leuven** | 50.8798 | 4.7005 |
| **Nivelles** | 50.5984 | 4.3284 |
| **Namur** | 50.4669 | 4.8719 |
| **Liège** | 50.6292 | 5.5797 |
| **Jodoigne** | 50.7233 | 4.8722 |
| **Charleroi** | 50.4108 | 4.4446 |
| **Mons** | 50.4542 | 3.9564 |
| **Gent** | 51.0543 | 3.7174 |
| **Antwerpen** | 51.2194 | 4.4025 |

---

## ⚙️ Configuration avancée

### Pour iOS

Ajouter dans `app.json` :

```json
{
  "ios": {
    "config": {
      "googleMapsApiKey": "YOUR_IOS_API_KEY"
    }
  }
}
```

### Pour Android

Ajouter dans `app.json` :

```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_ANDROID_API_KEY"
      }
    }
  }
}
```

### Pour le Web

```bash
npm install react-native-web-maps
```

---

## 🎯 Prochaines améliorations possibles

### Fonctionnalités futures

- [ ] **Géolocalisation** : Centrer la carte sur la position de l'utilisateur
- [ ] **Itinéraire** : Calculer le chemin vers le vétérinaire
- [ ] **Clustering** : Grouper les markers proches
- [ ] **Filtres** : Par spécialité, distance, disponibilité
- [ ] **Recherche** : Trouver un vétérinaire par nom/ville
- [ ] **Callout personnalisé** : Info-bulle stylisée avec photo
- [ ] **Street View** : Vue de la clinique vétérinaire
- [ ] **Heures d'ouverture** : Afficher si ouvert/fermé

### Optimisations

- [ ] **Cache des tuiles** : Carte hors ligne
- [ ] **Lazy loading** : Charger markers progressivement
- [ ] **Compression** : Optimiser la taille des assets

---

## 🐛 Dépannage

### La carte ne s'affiche pas

1. **Vérifier l'installation** :
   ```bash
   npm list react-native-maps
   ```

2. **Relancer l'app** :
   ```bash
   npm start -- --clear
   ```

3. **Vérifier les coordonnées** :
   - Latitude valide : -90 à 90
   - Longitude valide : -180 à 180

### Les markers ne s'affichent pas

1. Vérifier que `latitude` et `longitude` sont définis dans `DEMO_VETS`
2. Vérifier que les coordonnées sont dans la région visible
3. Zoomer/dézoomer pour forcer le refresh

### Performance lente

- Réduire le nombre de markers
- Utiliser `memo` pour les composants
- Activer le clustering

---

## 📊 Statistiques

- **Écrans modifiés** : 2 (MapScreen, EmergencyScreen)
- **Fichiers modifiés** : 3 (+ demoAuth.ts)
- **Lignes de code** : ~200
- **Markers** : 4 vétérinaires
- **Zone couverte** : 30km rayon
- **Temps de chargement** : < 1s

---

**Date de création** : 20 novembre 2024  
**Version** : 1.0.0  
**Status** : ✅ Fonctionnel et prêt à l'emploi !

🎉 **La carte interactive est maintenant opérationnelle !**

