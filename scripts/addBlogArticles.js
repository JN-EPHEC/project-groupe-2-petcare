const admin = require('firebase-admin');
const path = require('path');

// Initialiser Firebase Admin
const serviceAccount = require('../petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const articles = [
  {
    title: "Comment gérer une urgence vétérinaire : Le guide complet",
    category: "emergency",
    species: ["dog", "cat"],
    excerpt: "Apprenez à reconnaître les signes d'urgence chez votre animal et les premiers gestes qui peuvent sauver des vies.",
    content: `# Comment gérer une urgence vétérinaire

## Reconnaître les signes d'urgence

### Signes critiques nécessitant une intervention immédiate :

1. **Difficultés respiratoires**
   - Respiration rapide ou laborieuse
   - Gencives bleues ou pâles
   - Halètement excessif

2. **Traumatismes**
   - Saignements abondants
   - Fractures évidentes
   - Impossibilité de se lever

3. **Intoxications**
   - Vomissements répétés
   - Convulsions
   - Perte de conscience

## Premiers gestes à adopter

### En cas de saignement :
- Appliquez une pression ferme avec un linge propre
- Ne retirez pas les objets plantés
- Surélevez la zone si possible

### En cas de convulsions :
- Éloignez les objets dangereux
- Ne mettez rien dans la gueule
- Chronométrez la durée

⚠️ **En cas de doute, contactez TOUJOURS votre vétérinaire.**`,
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    tags: ["urgence", "premiers secours", "sécurité"],
    authorName: "Dr. Sophie Martin",
    readTime: 8,
    isPremium: true,
    status: "published",
    views: 0,
    likes: 0,
    publishedAt: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "Alimentation du chien : Les 10 erreurs à éviter",
    category: "nutrition",
    species: ["dog"],
    excerpt: "Découvrez les erreurs alimentaires les plus courantes et comment les éviter pour garder votre chien en bonne santé.",
    content: `# Alimentation du chien : Les 10 erreurs à éviter

## 1. Donner des restes de table
- Déséquilibre nutritionnel
- Risque d'obésité
- Mauvaises habitudes

## 2. Changer brusquement d'alimentation
- Problèmes digestifs
- Transition progressive recommandée sur 7 jours

## 3. Eau non disponible en permanence
- Déshydratation
- Problèmes rénaux

## 4. Aliments toxiques

⚠️ **JAMAIS** :
- 🍫 Chocolat
- 🍇 Raisins/raisins secs
- 🧅 Oignons/ail
- 🥑 Avocat
- 🍬 Xylitol (édulcorant)

## 5. Portions inadaptées
- Suivre les recommandations selon le poids
- Adapter selon l'activité physique`,
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
    tags: ["nutrition", "chien", "santé"],
    authorName: "Dr. Marc Dubois",
    readTime: 12,
    isPremium: true,
    status: "published",
    views: 0,
    likes: 0,
    publishedAt: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "Comportement du chat : 15 signaux essentiels à comprendre",
    category: "behavior",
    species: ["cat"],
    excerpt: "Apprenez à comprendre le langage corporel de votre chat et à décoder ses signaux pour une meilleure communication.",
    content: `# Décoder le comportement du chat

## Le langage de la queue

### Queue dressée verticalement
✅ Signe de confiance et de joie
🐱 Votre chat est heureux de vous voir

### Queue gonflée (en "brosse")
⚠️ Peur ou menace
🐱 Donnez-lui de l'espace

### Queue qui fouette rapidement
😾 Agacement, irritation
🐱 Arrêtez ce que vous faites

## Les oreilles

### Oreilles dressées vers l'avant
✅ Alerte, curieux, attentif

### Oreilles aplaties sur les côtés
⚠️ Peur, stress, agressivité défensive

## Le langage vocal

### Ronronnement
❤️ Généralement contentement
⚠️ Parfois stress ou douleur

### Miaulement
🗣️ Communication avec les humains
🐱 Les chats adultes ne miaulent qu'aux humains

## Comportements spéciaux

### Clignement lent des yeux
❤️ "Je t'aime" en langage chat
🐱 Retournez-lui ce signe de confiance

### Pétrissage (faire du pain)
😊 Contentement extrême
🐱 Comportement hérité du chaton`,
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
    tags: ["chat", "comportement", "éducation"],
    authorName: "Dr. Claire Rousseau",
    readTime: 15,
    isPremium: true,
    status: "published",
    views: 0,
    likes: 0,
    publishedAt: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "Santé des NAC : Guide complet pour Nouveaux Animaux de Compagnie",
    category: "health",
    species: ["bird", "reptile", "other"],
    excerpt: "Guide complet pour prendre soin de vos Nouveaux Animaux de Compagnie : lapins, reptiles, oiseaux et rongeurs.",
    content: `# Santé des NAC : Guide Complet

## Qu'est-ce qu'un NAC ?

Les NAC (Nouveaux Animaux de Compagnie) incluent :
- 🐰 Lapins
- 🦎 Reptiles (lézards, serpents, tortues)
- 🦜 Oiseaux
- 🐭 Rongeurs (hamsters, cochons d'Inde, rats)
- 🦔 Hérissons
- 🐸 Amphibiens

## Soins spécifiques par espèce

### 🐰 Lapins

**Alimentation** :
- 80% de foin (essentiel pour les dents)
- Légumes frais quotidiens
- Granulés avec modération

**Santé** :
- Vaccins : myxomatose, VHD
- Stérilisation recommandée
- Surveillance dentaire

### 🦎 Reptiles

**Environnement** :
- Température contrôlée (gradient thermique)
- UV-B essentiel pour la synthèse de vitamine D3
- Hygrométrie adaptée à l'espèce

**Alimentation** :
- Varie selon l'espèce (carnivore, herbivore, omnivore)
- Supplémentation en calcium

### 🦜 Oiseaux

**Environnement** :
- Cage spacieuse
- Jouets et perchoirs variés
- Temps hors cage quotidien

**Alimentation** :
- Mélange de graines adapté
- Fruits et légumes frais
- Eau propre renouvelée

### 🐭 Rongeurs

**Habitat** :
- Espace adapté à l'espèce
- Litière appropriée
- Enrichissement (tunnels, roue, cachettes)

**Social** :
- Certains sont sociaux (rats, cochons d'Inde)
- D'autres solitaires (hamsters)`,
    imageUrl: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800",
    tags: ["NAC", "reptiles", "santé", "lapins"],
    authorName: "Dr. Thomas Legrand",
    readTime: 18,
    isPremium: true,
    status: "published",
    views: 0,
    likes: 0,
    publishedAt: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now(),
  },
  {
    title: "Vaccination : Calendrier 2026 et protocoles essentiels",
    category: "health",
    species: ["dog", "cat"],
    excerpt: "Guide complet des vaccins essentiels pour chiens et chats avec le calendrier vaccinal 2026.",
    content: `# Vaccination 2026 : Guide Complet

## 🐕 Vaccination du chien

### Primo-vaccination (chiot)
- **8 semaines** : CHPL (Carré, Hépatite, Parvovirose, Leptospirose)
- **12 semaines** : CHPL + Rage (si voyage)
- **16 semaines** : CHPL + Rage

### Rappels
- **1 an** : CHPL + Rage
- **Puis tous les ans** : CHPL
- **Tous les 3 ans** : Rage (selon réglementation)

### Vaccins optionnels
- 🦠 Toux de chenil (pensions, expositions)
- 🦟 Leishmaniose (régions à risque)
- 🐛 Piroplasmose (zones endémiques de tiques)

## 🐱 Vaccination du chat

### Primo-vaccination (chaton)
- **8 semaines** : TCL (Typhus, Coryza, Leucose)
- **12 semaines** : TCL + Rage (si voyage)

### Rappels
- **1 an** : TCL + Rage
- **Puis tous les ans** : TCL
- **Tous les 3 ans** : Rage (selon réglementation)

### Vaccins selon le mode de vie
- **Chat d'intérieur** : Minimum Typhus + Coryza
- **Chat d'extérieur** : Tous les vaccins recommandés

## ⚠️ Important

### Conditions pour vacciner
✅ Animal en bonne santé
✅ Vermifugé récemment
✅ Sans fièvre

### Effets secondaires possibles
- Fatigue passagère (24-48h)
- Petite boule au point d'injection
- Rarement : réaction allergique

🏥 **Consultez votre vétérinaire pour un protocole personnalisé**`,
    imageUrl: "https://images.unsplash.com/photo-1530126483408-aa533e55bdb2?w=800",
    tags: ["vaccination", "prévention", "santé"],
    authorName: "Dr. Sophie Martin",
    readTime: 16,
    isPremium: true,
    status: "published",
    views: 0,
    likes: 0,
    publishedAt: admin.firestore.Timestamp.now(),
    createdAt: admin.firestore.Timestamp.now(),
  },
];

async function addArticles() {
  console.log('\n🚀 Ajout des articles de blog dans Firestore...\n');
  
  try {
    const batch = db.batch();
    
    articles.forEach((article) => {
      const docRef = db.collection('blog_articles').doc();
      batch.set(docRef, article);
      console.log(`✅ Article préparé: "${article.title}"`);
    });
    
    await batch.commit();
    
    console.log('\n🎉 ✅ Les 5 articles ont été ajoutés avec succès !');
    console.log('\n📱 Testez maintenant dans l\'app : Blog Exclusif\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'ajout des articles:', error);
    process.exit(1);
  }
}

addArticles();
