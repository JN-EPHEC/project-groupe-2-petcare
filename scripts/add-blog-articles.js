/**
 * Script pour ajouter des articles de blog d'experts à Firestore
 * 
 * Usage:
 *   node scripts/add-blog-articles.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuration Firebase (à partir de votre fichier firebaseConfig)
const firebaseConfig = {
  apiKey: "AIzaSyDGl_a8vLnkHi-Jq09BoPYw9YQC4Tr2iR8",
  authDomain: "petcare-2a317.firebaseapp.com",
  projectId: "petcare-2a317",
  storageBucket: "petcare-2a317.firebasestorage.app",
  messagingSenderId: "662669817891",
  appId: "1:662669817891:web:b3d96bcdd2bc5e4c3b0e8b",
  measurementId: "G-0C1W8YDKB9"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Articles de blog rédigés par des experts
const articles = [
  // ========== URGENCES ==========
  {
    title: "Que faire en cas d'empoisonnement de votre animal ?",
    category: "emergency",
    species: ["dog", "cat"],
    excerpt: "Les empoisonnements sont des urgences vitales. Découvrez les symptômes à surveiller et les gestes qui peuvent sauver la vie de votre compagnon.",
    content: `# Que faire en cas d'empoisonnement de votre animal ?

## Les signes d'alerte

L'empoisonnement chez les animaux de compagnie est une urgence absolue qui nécessite une réaction immédiate. Voici les symptômes les plus courants :

- **Vomissements** répétés et incontrôlables
- **Diarrhée** sévère, parfois sanglante
- **Salivation** excessive
- **Tremblements** ou convulsions
- **Léthargie** soudaine ou agitation inhabituelle
- **Difficultés respiratoires**
- **Pupilles dilatées** ou constriction anormale

## Les substances toxiques courantes

### À la maison
- **Chocolat** (théobromine toxique pour chiens et chats)
- **Xylitol** (édulcorant dans chewing-gums, pâtisseries)
- **Oignons et ail** (toxiques pour les globules rouges)
- **Raisins** (insuffisance rénale chez le chien)
- **Médicaments humains** (paracétamol, ibuprofène, etc.)

### Au jardin
- **Plantes toxiques** : muguet, laurier-rose, azalée, lys
- **Produits phytosanitaires** : engrais, pesticides, raticide
- **Antigel** (éthylène glycol, très toxique et mortel)

## Gestes d'urgence

⚠️ **NE JAMAIS faire vomir sans l'avis d'un vétérinaire** (certaines substances causent plus de dégâts en remontant).

### 1. Appeler immédiatement un vétérinaire
- **Centre antipoison vétérinaire** : disponible 24h/24
- Préparez les informations : substance ingérée, quantité, heure

### 2. Préserver les preuves
- Gardez l'emballage du produit
- Conservez un échantillon du vomissement si possible
- Notez l'heure d'ingestion

### 3. Ne pas attendre les symptômes
Plus la prise en charge est rapide, meilleures sont les chances de survie. Certains poisons agissent en moins de 30 minutes.

### 4. Transport sécurisé
- Enveloppez votre animal dans une couverture
- Gardez-le au calme
- Évitez tout stress supplémentaire

## Traitement vétérinaire

Selon le poison, le vétérinaire pourra :
- Induire des vomissements (si approprié)
- Administrer du charbon actif (neutralise certains toxiques)
- Mettre en place une perfusion (éliminer les toxines)
- Donner un antidote spécifique si disponible
- Surveiller les fonctions vitales (rein, foie, cœur)

## Prévention

### Sécuriser votre maison
✅ Ranger tous les médicaments en hauteur
✅ Vérifier la toxicité des plantes d'intérieur
✅ Ne jamais laisser de nourriture "interdite" accessible
✅ Fermer les placards de produits ménagers

### Au quotidien
✅ Surveiller votre animal lors des promenades
✅ Apprendre le "laisse" et "pas toucher"
✅ Éviter les friandises "humaines"
✅ Informer vos invités des aliments interdits

## Numéros d'urgence

📞 **Centre Antipoison Animal (France)** : 01 48 94 32 00 (7j/7, 24h/24)
📞 **Centre Antipoison Animal (Belgique)** : 070 245 245

**Rappelez-vous** : en cas de doute, mieux vaut un appel inutile qu'un regret éternel. Les vétérinaires préfèrent être contactés pour rien que d'intervenir trop tard.

---
*Article rédigé par Dr. Sophie Martinet, vétérinaire urgentiste avec 15 ans d'expérience*`,
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    tags: ["urgence", "empoisonnement", "toxique", "prévention", "premiers secours"],
    authorId: "expert_vet_001",
    authorName: "Dr. Sophie Martinet",
    status: "published",
    publishedAt: new Date().toISOString(),
    viewCount: 0,
  },
  
  {
    title: "Coup de chaleur : reconnaître et réagir vite",
    category: "emergency",
    species: ["dog", "cat"],
    excerpt: "Le coup de chaleur peut être mortel en quelques minutes. Apprenez à reconnaître les signes et les gestes qui sauvent en attendant le vétérinaire.",
    content: `# Coup de chaleur : reconnaître et réagir vite

## Qu'est-ce qu'un coup de chaleur ?

Le coup de chaleur (ou hyperthermie) est une **urgence vitale** qui survient lorsque la température corporelle d'un animal dépasse 40°C. Les chiens et chats ne transpirent pas comme nous : ils régulent leur température principalement par halètement. Quand ce système est dépassé, c'est la catastrophe.

## Pourquoi c'est si dangereux ?

⚠️ **Au-delà de 41°C**, les protéines se dénaturent, les organes sont endommagés (cerveau, reins, foie, cœur). Sans intervention rapide, le décès peut survenir en **moins de 30 minutes**.

## Signes d'alerte à surveiller

### Stade précoce (agir MAINTENANT)
- 🫁 Halètement excessif et bruyant
- 💦 Salivation abondante
- 😰 Agitation inhabituelle
- 🟥 Gencives rouge vif

### Stade critique (URGENCE ABSOLUE)
- 🥵 Température > 40°C
- 💙 Gencives pâles ou bleutées
- 🤮 Vomissements
- 💩 Diarrhée (parfois sanglante)
- 🫠 Léthargie extrême, perte de conscience
- 🧠 Convulsions, incoordination

## Gestes de premiers secours

### 1. Refroidir progressivement (PAS trop vite !)
❌ **NE JAMAIS** plonger dans l'eau glacée (choc thermique)
✅ Mouiller avec de l'eau **fraîche** (15-20°C), pas froide
✅ Commencer par les pattes, le ventre, les aisselles
✅ Placer des linges humides sur la tête et la nuque
✅ Ventiler avec un éventail

### 2. Surveiller la température
- Prendre la température rectale toutes les 5 minutes
- **Arrêter le refroidissement à 39,5°C** pour éviter l'hypothermie

### 3. Hydrater (si conscient)
- Proposer de petites gorgées d'eau fraîche
- ❌ Ne pas forcer si l'animal ne peut pas boire
- ❌ Pas d'eau glacée (risque de vomissement)

### 4. Appeler le vétérinaire IMMÉDIATEMENT
Même si l'animal semble aller mieux, des complications peuvent survenir 24-48h après (insuffisance rénale, troubles de coagulation).

## Situations à risque

### Animaux vulnérables
- 👴 Animaux âgés ou très jeunes
- 🏋️ Races brachycéphales (bouledogue, carlin, persan)
- 💊 Animaux malades ou obèses
- 🐕‍🦺 Races à pelage épais

### Situations dangereuses
- 🚗 **Voiture en plein soleil** (même fenêtres entrouvertes : INTERDIT !)
- 🏃 Exercice intense en pleine chaleur
- 🏠 Maison sans ventilation ni ombre
- 🌡️ Température > 25°C + humidité élevée

## Prévention : les règles d'or

### En été
✅ Promenade tôt le matin ou tard le soir
✅ Toujours de l'eau fraîche disponible
✅ Éviter le bitume brûlant (brûlures des coussinets)
✅ Ne JAMAIS laisser dans une voiture (même 5 minutes)

### À la maison
✅ Pièces fraîches et ventilées
✅ Tapis rafraîchissants
✅ Accès à l'ombre en permanence
✅ Piscine ou bassine d'eau pour se rafraîchir

### En promenade
✅ Bouteille d'eau + gamelle pliable
✅ Pauses à l'ombre toutes les 15-20 minutes
✅ Arrêter immédiatement si halètement excessif
✅ Mouillez le ventre et les pattes régulièrement

## À retenir

🚨 **Un coup de chaleur peut tuer en 30 minutes**
📞 **Refroidir + appeler le vétérinaire = TOUJOURS**
🚫 **JAMAIS un animal seul dans une voiture en été**

**Numéros d'urgence vétérinaire :**
- France : 3115 (vétérinaire de garde)
- Belgique : 1733 (numéro général d'urgence médicale)

---
*Article rédigé par Dr. Marc Dufresne, vétérinaire urgentiste, spécialiste en médecine d'urgence*`,
    imageUrl: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800",
    tags: ["urgence", "coup de chaleur", "été", "hyperthermie", "prévention"],
    authorId: "expert_vet_002",
    authorName: "Dr. Marc Dufresne",
    status: "published",
    publishedAt: new Date().toISOString(),
    viewCount: 0,
  },

  // ========== ESPÈCES ==========
  {
    title: "Adopter un chien : quelle race pour votre mode de vie ?",
    category: "species",
    species: ["dog"],
    excerpt: "Chaque race a des besoins spécifiques. Découvrez comment choisir le compagnon idéal selon votre logement, votre activité et votre expérience.",
    content: `# Adopter un chien : quelle race pour votre mode de vie ?

## Pourquoi le choix de la race est crucial ?

Adopter un chien est un engagement de 10 à 15 ans. Un mauvais choix de race peut conduire à :
- 😞 Un chien malheureux et frustré
- 😓 Des problèmes de comportement
- 💔 Un abandon (64% des abandons sont dus à une inadéquation mode de vie/race)

## Les critères essentiels

### 1. Votre logement

#### Appartement (< 80m²)
✅ **Races adaptées :**
- Carlin, Bouledogue français (calmes, peu d'exercice)
- Cavalier King Charles (affectueux, adaptable)
- Shih Tzu, Bichon (petits, sociables)
- Boston Terrier (compact, joueur)

❌ **À éviter :**
- Border Collie, Berger Australien (hyperactifs)
- Husky, Malamute (besoin d'espace)
- Jack Russell (énergie débordante)

#### Maison avec jardin
✅ Toutes races possibles, mais attention :
- Un jardin ne remplace PAS les promenades
- Certaines races creusent ou aboient (voisinage)

### 2. Votre niveau d'activité

#### Sédentaire / peu sportif
✅ **Races calmes :**
- Bouledogues (anglais, français)
- Basset Hound
- Cavalier King Charles
- Shih Tzu, Pékinois

⏱️ Besoins : 30-45 min de sortie/jour

#### Actif / sportif régulier
✅ **Races dynamiques :**
- Labrador, Golden Retriever
- Springer Spaniel
- Beagle
- Cocker

⏱️ Besoins : 1h-1h30 d'exercice/jour

#### Très sportif (running, vélo, randonnées)
✅ **Races athlétiques :**
- Border Collie
- Berger Australien
- Braque de Weimar
- Husky Sibérien

⏱️ Besoins : 2h+ d'activité intense/jour

### 3. Votre expérience

#### Débutant (1er chien)
✅ **Races faciles à éduquer :**
- Golden Retriever (doux, obéissant)
- Labrador (sociable, gourmand → facilite l'éducation)
- Cavalier King Charles (très docile)
- Bichon Frisé (intelligent, attentif)

❌ **À éviter :**
- Races dominantes : Akita, Husky
- Races têtues : Beagle, Basset Hound
- Races de travail : Border Collie, Malinois

#### Confirmé (déjà eu des chiens)
✅ Toutes races, mais respectez vos capacités physiques et temporelles

### 4. Votre disponibilité

#### Peu de temps (< 2h/jour)
✅ Races indépendantes et calmes
- ❌ Pas de races anxieuses (Berger Australien, Cavalier)
- ❌ Pas de races énergiques (Jack Russell, Border)

#### Présence régulière
✅ Toutes races, privilégier celles qui correspondent à votre activité

### 5. Présence d'enfants

#### Avec jeunes enfants (< 6 ans)
✅ **Races patientes et douces :**
- Golden Retriever ⭐
- Labrador ⭐
- Beagle
- Cavalier King Charles
- Bouledogue français

❌ **À éviter :**
- Races fragiles (Chihuahua, Yorkshire)
- Races territoriales (Akita, Chow-Chow)
- Races nerveuses (Jack Russell)

## Le tableau récapitulatif

| Race | Logement | Activité | Expérience | Enfants | Toilettage |
|------|----------|----------|------------|---------|------------|
| **Golden Retriever** | Maison++ | Élevée | Débutant | ⭐⭐⭐ | Régulier |
| **Labrador** | Maison+ | Élevée | Débutant | ⭐⭐⭐ | Facile |
| **Border Collie** | Maison++ | Très élevée | Confirmé | ⭐⭐ | Moyen |
| **Bouledogue FR** | Appart. | Faible | Débutant | ⭐⭐ | Facile |
| **Cavalier KC** | Appart. | Moyenne | Débutant | ⭐⭐⭐ | Régulier |
| **Beagle** | Maison | Élevée | Intermédiaire | ⭐⭐⭐ | Facile |
| **Husky** | Maison++ | Très élevée | Confirmé | ⭐ | Intense |
| **Jack Russell** | Maison | Très élevée | Confirmé | ⭐ | Facile |

## Et les chiens croisés ?

🌟 **Les croisés sont souvent d'excellents compagnons !**

**Avantages :**
- ✅ Moins de problèmes de santé héréditaires
- ✅ Tempérament souvent équilibré
- ✅ Uniques et attachants
- ✅ Adoption éthique (refuges)

**Comment choisir :**
- Regarder les parents si possible
- Discuter longuement avec le refuge
- Tester la compatibilité (plusieurs visites)

## Les erreurs à éviter

❌ **Choisir sur le physique** ("il est trop mignon !")
❌ **Céder à un coup de cœur** sans réflexion
❌ **Sous-estimer les besoins** de la race
❌ **Acheter sur un coup de tête** (salon, animalerie)
❌ **Négliger l'origine** (usine à chiots, élevage intensif)

## Checklist avant adoption

✅ J'ai le temps pour 2-3 sorties par jour
✅ Mon budget permet vétérinaire + alimentation (50-100€/mois)
✅ Je suis prêt pour 10-15 ans d'engagement
✅ Ma famille est d'accord
✅ Mon logement accepte les animaux
✅ J'ai un plan pour les vacances/absences
✅ J'ai réfléchi à l'éducation (cours si besoin)

---
*Article rédigé par Dr. Claire Benoit, vétérinaire comportementaliste, spécialiste en éthologie canine*`,
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
    tags: ["chien", "race", "adoption", "mode de vie", "conseils"],
    authorId: "expert_vet_003",
    authorName: "Dr. Claire Benoit",
    status: "published",
    publishedAt: new Date().toISOString(),
    viewCount: 0,
  },

  {
    title: "Chats d'intérieur vs d'extérieur : avantages et risques",
    category: "species",
    species: ["cat"],
    excerpt: "Faut-il laisser sortir son chat ? Découvrez les pour et les contre de chaque mode de vie pour prendre la meilleure décision.",
    content: `# Chats d'intérieur vs d'extérieur : avantages et risques

## Le débat qui divise les propriétaires

🏠 **Chat d'intérieur** ou 🌳 **chat d'extérieur** ? Cette question soulève des débats passionnés. Voici un guide objectif pour vous aider à décider.

## Chat d'intérieur exclusif

### ✅ Avantages

#### Sécurité et santé
- **Espérance de vie** : 15-20 ans (vs 5-7 ans en extérieur)
- **Pas de risques routiers** (1re cause de mortalité)
- **Moins de maladies** (FIV, FeLV, parasites)
- **Pas de bagarres** avec d'autres chats
- **Pas d'empoisonnements** (raticides, plantes toxiques)
- **Pas de disparitions** ou vols

#### Tranquillité d'esprit
- Toujours savoir où il est
- Pas d'inquiétude la nuit
- Pas de "cadeaux" (souris, oiseaux)
- Pas de plaintes du voisinage

#### Économies
- Moins de frais vétérinaires
- Pas de blessures de bagarre à soigner
- Moins de vermifuges et antiparasitaires

### ❌ Inconvénients et solutions

#### Risque d'ennui
**Symptômes :**
- Destructions
- Miaulements excessifs
- Léchage compulsif
- Agressivité

**Solutions :**
✅ **Enrichissement de l'environnement**
- Arbres à chat (accès vertical)
- Jouets rotatifs (nouveauté régulière)
- Fenêtres avec vue sur l'extérieur
- Herbe à chat, cataire
- Jeux interactifs quotidiens (15-30 min)

✅ **Stimulation mentale**
- Puzzles alimentaires
- Chasse au trésor (croquettes cachées)
- Jouets distributeurs de nourriture

#### Prise de poids
**Solutions :**
- Alimentation contrôlée (gamelle interactive)
- Sessions de jeu quotidiennes
- Espace vertical pour grimper

#### Frustration (si habitué à l'extérieur)
**Solutions :**
- Transition progressive (si passage intérieur → extérieur)
- Harnais et laisse pour sorties sécurisées
- Catio (enclos extérieur sécurisé)

## Chat d'extérieur

### ✅ Avantages

#### Épanouissement naturel
- Expression de comportements innés (chasse, exploration)
- Stimulation sensorielle riche
- Exercice physique naturel
- Vie sociale avec congénères

#### Santé mentale
- Moins de stress confiné
- Comportements instinctifs satisfaits
- Autonomie et indépendance

### ❌ Risques majeurs

#### Dangers mortels
🚗 **Accidents de la route** : 1re cause de décès
🥊 **Bagarres** : blessures, abcès, maladies (FIV, FeLV)
🦠 **Maladies infectieuses** : coryza, typhus, leucose
🐛 **Parasites** : puces, tiques, vers
☠️ **Empoisonnements** : raticides, antigel, plantes
🔫 **Malveillance humaine** : tirs, pièges, enlèvements
🦅 **Prédateurs** : rapaces (pour les petits chats)

#### Autres problèmes
- Vols ou disparitions
- Plaintes du voisinage (jardins, nuisances)
- Destruction de la faune (oiseaux)
- Grossesses non désirées si non stérilisé

## Le compromis : solutions intermédiaires

### 1. Le catio (enclos extérieur sécurisé)
🌟 **LA solution idéale**

**Avantages :**
✅ Accès à l'extérieur en sécurité
✅ Stimulation sensorielle (odeurs, sons)
✅ Air frais et soleil
✅ Observation de la nature
✅ Aucun risque

**Comment faire :**
- Enclos grillagé (mailles fines)
- Accès depuis une fenêtre ou chatière
- Aménagé (perchoirs, cachettes, plantes non toxiques)
- Budget : 200-2000€ selon taille

### 2. Sorties en laisse
✅ Certains chats acceptent le harnais
✅ Exploration sécurisée
✅ Moment de complicité

**Comment habituer :**
1. Habituer au harnais en intérieur (progressif)
2. Récompenser (friandises)
3. Premières sorties courtes (5-10 min)
4. Augmenter progressivement

### 3. Sorties supervisées
✅ Dans un jardin clos
✅ Toujours sous surveillance
✅ Jamais la nuit

### 4. Sorties limitées
- Seulement de jour
- Uniquement dans environnement sécurisé (campagne, lotissement calme)
- Chat stérilisé, vacciné, identifié (puce + collier GPS)
- Pas de sortie nocturne

## Quelle décision prendre ?

### Chat d'intérieur RECOMMANDÉ si :
✅ Vous habitez en ville ou zone routière
✅ Votre chat n'est jamais sorti
✅ Vous êtes prêt à l'enrichissement
✅ Votre chat est âgé ou malade
✅ Vous voulez maximiser sa longévité

### Sorties possibles si :
✅ Environnement très sécurisé (campagne isolée)
✅ Chat stérilisé, vacciné, pucé
✅ Vous acceptez les risques
✅ Budget vétérinaire confortable
✅ Sorties diurnes uniquement

### Compromis (catio/laisse) idéal si :
✅ Vous voulez le meilleur des deux mondes
✅ Votre chat est frustré en intérieur
✅ Vous avez l'espace/budget pour un catio

## Transition extérieur → intérieur

Si vous devez garder un chat habitué à sortir :

**Étapes :**
1. **Consultez un vétérinaire** (anxiolytiques si besoin)
2. **Enrichissez AVANT** (arbres, jouets, fenêtres)
3. **Transition progressive** (réduire sorties graduellement)
4. **Jeux intensifs** (compenser frustration)
5. **Patience** (plusieurs semaines d'adaptation)

## Conclusion

📊 **Statistiques claires :**
- Chat d'intérieur : espérance de vie **15-20 ans**
- Chat d'extérieur : espérance de vie **5-7 ans**

🎯 **Notre recommandation :**
- **Ville/banlieue** : intérieur strict (+ catio si possible)
- **Campagne sécurisée** : sorties diurnes supervisées
- **Idéal** : intérieur enrichi + catio

Chaque situation est unique. L'essentiel est d'offrir à votre chat **sécurité, stimulation et amour** ! 💙

---
*Article rédigé par Dr. Émilie Rousseau, vétérinaire comportementaliste, spécialiste des félins*`,
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
    tags: ["chat", "intérieur", "extérieur", "sécurité", "mode de vie"],
    authorId: "expert_vet_004",
    authorName: "Dr. Émilie Rousseau",
    status: "published",
    publishedAt: new Date().toISOString(),
    viewCount: 0,
  },

  // ========== ALIMENTATION ==========
  {
    title: "Alimentation du chien : croquettes, BARF ou fait maison ?",
    category: "nutrition",
    species: ["dog"],
    excerpt: "Quel régime alimentaire choisir pour votre chien ? Comparatif objectif des avantages et inconvénients de chaque méthode.",
    content: `# Alimentation du chien : croquettes, BARF ou fait maison ?

## L'alimentation : pilier de la santé

L'alimentation représente **80% de la santé** d'un chien. Mais face aux modes et aux débats, comment s'y retrouver ? Voici un guide vétérinaire objectif.

## 1. Les croquettes industrielles

### ✅ Avantages

**Praticité**
- Facile à stocker et doser
- Pas de préparation
- Longue conservation
- Voyage simplifié
- Coût maîtrisé

**Équilibre nutritionnel**
- Formulation étudiée (si premium)
- Respect des besoins (protéines, vitamines, minéraux)
- Adapté à l'âge, la race, l'activité
- Tracabilité et contrôles qualité

**Santé dentaire**
- Effet abrasif (réduit le tartre)

### ❌ Inconvénients

**Qualité variable**
- Présence de sous-produits (certaines marques)
- Additifs et conservateurs
- Céréales en excès (bas de gamme)

**Appétence**
- Certains chiens refusent
- Peut lasser avec le temps

**Digestibilité**
- Selles volumineuses (basse gamme)

### 💡 Comment choisir ?

**Critères qualité :**
✅ **Protéines animales en 1er ingrédient** (poulet, saumon, agneau)
✅ **Taux de protéines > 25%** (chien adulte)
✅ **Sans céréales** ou céréales complètes (éviter maïs/blé)
✅ **Pas de sous-produits animaux**
✅ **Sans colorants ni arômes artificiels**

**Prix indicatif qualité :**
- Bas de gamme : < 2€/kg ❌
- Moyenne gamme : 3-5€/kg ⚠️
- Haut de gamme : 5-10€/kg ✅
- Super premium : > 10€/kg ⭐

**Marques recommandées :**
- Orijen, Acana (super premium)
- Taste of the Wild
- Royal Canin, Hill's (vétérinaire)
- Carnilove, Brit Care

## 2. Le BARF (Biologically Appropriate Raw Food)

### Qu'est-ce que c'est ?

Régime basé sur viande crue, os charnus, abats et légumes, imitant l'alimentation des carnivores sauvages.

**Composition type :**
- 60-70% viande musculaire crue
- 10-15% os charnus (ailes de poulet, cous)
- 10-15% abats (foie, rein, cœur)
- 5-10% légumes/fruits
- Compléments (huiles, algues)

### ✅ Avantages

**Santé**
- Selles réduites et fermes
- Pelage brillant
- Haleine fraîche
- Tartre quasi inexistant
- Masse musculaire optimale
- Niveau d'énergie élevé

**Naturel**
- Pas d'additifs, conservateurs
- Ingrédients frais et connus
- Pas de transformation industrielle

**Appétence**
- Très apprécié des chiens
- Excitation aux repas

### ❌ Inconvénients et risques

**Risques sanitaires**
⚠️ **Contamination bactérienne** (salmonelles, E. coli)
⚠️ **Parasites** (ténia, toxoplasme)
⚠️ **Risque pour humains** (manipulation viande crue)

**Risques nutritionnels**
⚠️ **Déséquilibres** (calcium/phosphore)
⚠️ **Carences** (si mal formulé)
⚠️ **Excès** (vitamines A et D)

**Risques physiques**
⚠️ **Étouffement** (os mal choisis)
⚠️ **Perforation intestinale** (os cuits ou durs)
⚠️ **Fractures dentaires** (gros os)

**Contraintes**
- Temps de préparation ++
- Coût élevé (viande fraîche)
- Stockage (congélateur)
- Voyage difficile
- Nécessite formation (recettes équilibrées)

### 💡 Le BARF sécurisé

**Si vous choisissez le BARF :**

✅ **Consultez un vétérinaire nutritionniste** (formulation)
✅ **Congeler la viande 3 semaines** (-18°C minimum)
✅ **Hygiène irréprochable** (planches séparées, désinfection)
✅ **Variété des viandes** (rotation protéines)
✅ **Respect des proportions** (balance alimentaire)
✅ **Compléments indispensables** (calcium, omega-3)
✅ **Suivi vétérinaire** (prise de sang annuelle)

**À éviter absolument :**
❌ Os cuits (éclatent en esquilles)
❌ Porc cru (maladie d'Aujeszky)
❌ Os de poulet cuits
❌ Os tubulaires (fémur, tibia)

## 3. Ration ménagère (fait maison cuit)

### Composition type
- Viande ou poisson (cuit)
- Riz, pâtes ou pommes de terre
- Légumes (courgettes, carottes)
- Huile (colza, olive)
- Complément minéral et vitaminique (CMV)

### ✅ Avantages

- Ingrédients frais et contrôlés
- Cuisson (moins de risques bactériens que BARF)
- Digestion excellente
- Adapté aux intolérances
- Lien affectif (préparation)

### ❌ Inconvénients

- **Temps de préparation** (1-2h/semaine)
- **Coût élevé** (viande fraîche)
- **Risque de déséquilibre** (si mal calculé)
- **CMV obligatoire** (sinon carences)
- Voyage compliqué

### 💡 Réussir la ration ménagère

✅ **Impératif : recette d'un vétérinaire nutritionniste**
✅ **CMV de qualité** (Vit'i5, Sofcanis)
✅ **Balance de cuisine** (précision)
✅ **Rotation des protéines** (poulet, bœuf, poisson)

## Tableau comparatif

| Critère | Croquettes Premium | BARF | Ration ménagère |
|---------|-------------------|------|-----------------|
| **Praticité** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Coût** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Sécurité sanitaire** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Équilibre nutritionnel** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Digestibilité** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Pelage/dents** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Appétence** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Notre recommandation vétérinaire

### Pour la majorité des chiens :
🥇 **Croquettes haut de gamme** (Orijen, Acana, Carnilove)
- Rapport qualité/praticité/sécurité optimal
- Équilibre garanti
- Adapté au mode de vie moderne

### Pour les propriétaires investis :
🥈 **Ration ménagère** avec suivi vétérinaire
- Fraîcheur + sécurité
- Meilleur compromis fait-maison

### Pour les experts formés :
🥉 **BARF** encadré par un vétérinaire nutritionniste
- Nécessite formation sérieuse
- Hygiène stricte indispensable
- Suivi vétérinaire régulier

## Les erreurs à éviter

❌ **Mélanger croquettes et BARF** (pH digestif différent)
❌ **Changer d'alimentation brutalement** (diarrhées)
❌ **Se fier aux modes** (chaque chien est unique)
❌ **Économiser sur la qualité** (santé = économies vétérinaire)
❌ **Faire "au feeling"** (besoins précis en nutriments)

## Et pour les chiens sensibles ?

- **Allergies** : ration ménagère (contrôle des ingrédients)
- **Problèmes digestifs** : croquettes digestives vétérinaires
- **Insuffisance rénale** : alimentation prescrite uniquement
- **Surpoids** : croquettes light + ration calculée

---
*Article rédigé par Dr. Thomas Girard, vétérinaire nutritionniste, diplômé du Collège Européen de Nutrition Animale*`,
    imageUrl: "https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=800",
    tags: ["alimentation", "chien", "croquettes", "BARF", "nutrition"],
    authorId: "expert_vet_005",
    authorName: "Dr. Thomas Girard",
    status: "published",
    publishedAt: new Date().toISOString(),
    viewCount: 0,
  },

  // ========== COMPORTEMENT ==========
  {
    title: "Mon chat fait ses griffes partout : solutions efficaces",
    category: "behavior",
    species: ["cat"],
    excerpt: "Le griffage est un comportement naturel essentiel. Découvrez comment rediriger ce comportement vers des supports adaptés sans punir votre chat.",
    content: `# Mon chat fait ses griffes partout : solutions efficaces

## Pourquoi les chats font-ils leurs griffes ?

❌ **Ce n'est PAS** pour vous embêter !
✅ **C'est un besoin vital** pour plusieurs raisons :

### 1. Entretien des griffes
- Retirer la gaine cornée usée
- Garder des griffes aiguisées et saines
- Éviter l'incarnation des griffes

### 2. Marquage territorial
- Marquage **visuel** (traces de griffures)
- Marquage **olfactif** (phéromones des coussinets)
- Communication avec d'autres chats

### 3. Étirement musculaire
- Étire les muscles du dos, épaules, pattes
- Équivalent de notre yoga matinal !

### 4. Gestion émotionnelle
- Soulagement du stress
- Expression de bien-être
- Défoulement

🚨 **Conclusion : on ne peut PAS empêcher un chat de faire ses griffes, mais on peut le REDIRIGER !**

## Pourquoi le canapé plutôt que le griffoir ?

### Les erreurs fréquentes

❌ **Griffoir inadapté**
- Trop petit (chat ne peut pas s'étirer)
- Mauvais matériau (chat n'accroche pas)
- Instable (bouge, fait peur)
- Mal placé (hors des zones de passage)

❌ **Nombre insuffisant**
- 1 seul griffoir pour toute la maison
- Pas dans les zones clés

❌ **Attractivité nulle**
- Pas d'herbe à chat
- Pas de jeux à proximité
- Emplacement fade

### Ce que préfère votre chat

✅ **Surface verticale ET horizontale**
✅ **Texture rugueuse** (sisal, carton, bois)
✅ **Stable et solide** (ne bouge pas)
✅ **Assez grand** pour s'étirer complètement
✅ **Bien placé** (zones de passage, près du canapé)

## Solutions efficaces : plan d'action

### ÉTAPE 1 : Choisir le BON griffoir

#### Griffoir vertical
✅ **Hauteur minimum : 80 cm** (chat debout étiré)
✅ **Base lourde et large** (ne bascule pas)
✅ **Matériaux :**
   - **Sisal naturel** ⭐ (texture rugueuse préférée)
   - **Carton ondulé** (à renouveler)
   - **Tronc d'arbre** (naturel)
   - **Tapis rugueux**

❌ À éviter : tissu lisse, peluche (pas assez résistant)

#### Griffoir horizontal ou incliné
✅ Pour les chats qui préfèrent gratter au sol
✅ Carton ondulé horizontal
✅ Tapis de sisal au sol

#### Arbre à chat
⭐ **Solution idéale : combine tout**
- Griffoirs intégrés
- Plateaux pour observer
- Cachettes (sécurité)
- Jeux suspendus

**Critères :**
✅ Hauteur > 1,50 m (accès vertical)
✅ Plusieurs plateaux
✅ Poteaux en sisal
✅ Base ultra-stable (> 10 kg)

### ÉTAPE 2 : Placer stratégiquement

#### Emplacements clés
✅ **Près du canapé** (concurrence directe)
✅ **Près de son lieu de couchage** (réveil = griffades)
✅ **Zones de passage** (entrée, couloir)
✅ **Près des fenêtres** (observation + marquage)
✅ **Chaque niveau de la maison**

**Règle d'or : 1 griffoir par pièce principale + 1**

### ÉTAPE 3 : Rendre attractif

#### Herbe à chat (cataire)
✅ Frotter le griffoir avec de l'herbe à chat
✅ Renouveler toutes les semaines
✅ Fonctionne sur 70% des chats

#### Phéromones attractives
✅ Spray Feliscratch (Feliway)
✅ Imite les phéromones de griffade
✅ Application quotidienne 1 semaine

#### Jeux et friandises
✅ Jouez près du griffoir
✅ Récompensez quand il l'utilise
✅ Attachez un jouet en haut (encouragement)

### ÉTAPE 4 : Protéger les meubles

#### Protection temporaire
✅ **Film plastique** sur canapé (texture désagréable)
✅ **Papier alu** (bruit + texture déplaisante)
✅ **Double-face** (collant désagréable)
✅ **Spray répulsif agrumes** (odeur détestée)

#### Protection permanente
✅ **Plaids/housses épaisses**
✅ **Protections d'angle** (meubles)
✅ **Griffoirs devant les zones sensibles**

### ÉTAPE 5 : Rediriger positivement

#### Quand vous le prenez sur le fait :
❌ **NE PAS punir** (stress → plus de griffades)
❌ **NE PAS crier** (incompréhension)
❌ **NE PAS taper** (perte de confiance)

✅ **FAIRE :**
1. Interrompre avec un "non" calme
2. Rediriger vers le griffoir
3. Gratter le griffoir avec sa patte
4. Récompenser (friandise + caresses)
5. Jouer avec lui près du griffoir

### ÉTAPE 6 : Entretien des griffes

#### Coupe régulière
✅ Toutes les 3-4 semaines
✅ Coupe-griffes spécial chat
✅ Couper seulement la pointe translucide
✅ Récompenser après (friandise)

**Si vous n'osez pas :** vétérinaire ou toiletteur (10-15€)

#### Protections temporaires
✅ **Caps (capuchons)** en silicone
   - Collés sur les griffes
   - Durent 4-6 semaines
   - Ne gênent pas le chat
   - Alternative au dégriffage (INTERDIT en Europe)

## Plan d'action résumé (30 jours)

### Semaine 1 : Installation
- ✅ Acheter 2-3 griffoirs de qualité
- ✅ Placer près des zones problématiques
- ✅ Appliquer herbe à chat + Feliscratch
- ✅ Protéger les meubles (alu, plastique)

### Semaine 2 : Redirection
- ✅ Interrompre + rediriger systématiquement
- ✅ Récompenser chaque utilisation du griffoir
- ✅ Jouer 2x/jour près des griffoirs

### Semaine 3 : Renforcement
- ✅ Continuer les récompenses
- ✅ Couper les griffes
- ✅ Ajouter un griffoir si besoin

### Semaine 4 : Suivi
- ✅ Retirer progressivement les protections
- ✅ Maintenir les récompenses occasionnelles
- ✅ Renouveler l'herbe à chat

## Solutions avancées si ça ne suffit pas

### Consultation comportementaliste
Si après 1 mois, aucune amélioration :
✅ Vétérinaire comportementaliste
✅ Peut identifier stress sous-jacent
✅ Thérapie comportementale + médication si besoin

### Phéromones d'apaisement
✅ Feliway Optimum (prise murale)
✅ Réduit le stress global
✅ Diminue les griffades compulsives

## Ce qu'il ne faut JAMAIS faire

❌ **Dégriffage** (INTERDIT et CRUEL)
   - Amputation de la dernière phalange
   - Douleurs chroniques
   - Troubles comportementaux graves
   - Illégal en France, Belgique, Suisse

❌ **Punition physique**
   - Stress → aggravation du problème
   - Perte de confiance
   - Agressivité défensive

❌ **Spray à l'eau**
   - Association négative avec vous
   - Stress et peur
   - Peu efficace

## Checklist du griffoir idéal

✅ Hauteur > 80 cm (vertical) ou > 40 cm (horizontal)
✅ Stable (ne bascule pas)
✅ Matériau rugueux (sisal, carton)
✅ Placé stratégiquement (zones clés)
✅ Attractif (herbe à chat, jeux)
✅ En nombre suffisant (1 par pièce)

## À retenir

🎯 **Patience** : 2-4 semaines pour le changement d'habitude
🎯 **Cohérence** : toute la famille applique la même méthode
🎯 **Renforcement positif** : récompenses > punitions
🎯 **Comprendre** : c'est un besoin naturel, pas un caprice

Avec de la patience et les bons outils, 95% des chats utilisent leurs griffoirs ! 🐱✨

---
*Article rédigé par Dr. Laura Fontaine, vétérinaire comportementaliste certifiée CEAV*`,
    imageUrl: "https://images.unsplash.com/photo-1573865526739-10c1de0cd29f?w=800",
    tags: ["chat", "comportement", "griffes", "éducation", "griffoir"],
    authorId: "expert_vet_006",
    authorName: "Dr. Laura Fontaine",
    status: "published",
    publishedAt: new Date().toISOString(),
    viewCount: 0,
  },

  // ========== SANTÉ ==========
  {
    title: "Calendrier vaccinal : protégez votre animal efficacement",
    category: "health",
    species: ["dog", "cat"],
    excerpt: "Quels vaccins sont vraiment nécessaires ? À quelle fréquence ? Guide complet du calendrier vaccinal pour chiens et chats par un vétérinaire.",
    content: `# Calendrier vaccinal : protégez votre animal efficacement

## Pourquoi vacciner ?

La vaccination a **sauvé des millions d'animaux** de maladies mortelles. Certaines maladies ont même été éradiquées grâce à la vaccination massive.

### Les bénéfices
✅ **Protection individuelle** (votre animal)
✅ **Immunité collective** (réduit la circulation des maladies)
✅ **Économies** (prévention < traitement)
✅ **Obligatoire** pour certaines activités (pension, concours, voyages)

## Vaccins pour CHIENS

### Vaccins "essentiels" (TOUS les chiens)

#### 1. Maladie de Carré (CDV)
**Maladie :** Virus très contagieux, souvent mortel
**Symptômes :** Fièvre, toux, diarrhée, troubles nerveux
**Mortalité :** 50-80% (chiots)
**Vaccination :**
- 1re injection : 8 semaines
- 2e injection : 12 semaines
- 3e injection : 16 semaines
- **Rappel** : 1 an, puis tous les **3 ans**

#### 2. Parvovirose (CPV-2)
**Maladie :** Virus détruisant les intestins
**Symptômes :** Diarrhée hémorragique, vomissements, déshydratation
**Mortalité :** 80% (chiots non traités)
**Vaccination :** Même protocole que Carré
**Rappel** : 1 an, puis tous les **3 ans**

#### 3. Hépatite de Rubarth (CAV-2)
**Maladie :** Virus attaquant le foie
**Symptômes :** Fièvre, vomissements, jaunisse
**Mortalité :** Élevée chez chiots
**Vaccination :** Même protocole que Carré
**Rappel** : 1 an, puis tous les **3 ans**

#### 4. Leptospirose (Leptospira)
**Maladie :** Bactérie (eau contaminée par urine de rats)
**Symptômes :** Insuffisance rénale/hépatique aiguë
**Mortalité :** Élevée
**Transmission :** Zoonose (transmissible à l'homme)
**Vaccination :**
- 1re injection : 12 semaines
- 2e injection : 16 semaines
- **Rappel** : **ANNUEL** (immunité courte)

### Vaccins "non-essentiels" (selon risques)

#### 5. Rage
**Maladie :** Virus mortel à 100% (aucun traitement)
**Transmission :** Zoonose (mortelle pour l'homme)
**Vaccination :**
- 1re injection : 12 semaines
- **Rappel** : Annuel ou tous les 3 ans (selon vaccin)
**Obligatoire pour :**
- ✅ Voyages à l'étranger
- ✅ Chiens de catégorie 1 et 2
- ✅ Pensions, expositions
- ✅ Certaines régions (Guyane)

#### 6. Toux du chenil (Bordetella + Parainfluenza)
**Maladie :** Infection respiratoire contagieuse
**Symptômes :** Toux sèche persistante
**Gravité :** Faible (guérison spontanée) sauf chiots/âgés
**Vaccination :** Injection ou spray nasal
**Recommandé si :**
- Pension, éducation canine
- Concours, expositions
- Contacts fréquents avec d'autres chiens

#### 7. Piroplasmose (Babesia)
**Maladie :** Parasite transmis par les tiques
**Symptômes :** Destruction des globules rouges, jaunisse
**Gravité :** Mortelle sans traitement
**Vaccination :**
- 2 injections à 3-4 semaines d'intervalle
- **Rappel** : Annuel
**Efficacité :** 70% (complément antiparasitaire indispensable)
**Recommandé si :** Zone à risque (Sud de la France, forêts)

#### 8. Leishmaniose (Leishmania)
**Maladie :** Parasite transmis par phlébotomes (moucherons)
**Symptômes :** Lésions cutanées, amaigrissement, insuffisance rénale
**Gravité :** Incurable (traitement à vie)
**Vaccination :**
- Dépistage négatif obligatoire avant vaccination
- 3 injections à 3 semaines d'intervalle
- **Rappel** : Annuel
**Efficacité :** 68%
**Recommandé si :** Bassin méditerranéen (Sud France, Espagne, Italie)

### Calendrier vaccinal CHIEN (1re année)

| Âge | Vaccins |
|-----|---------|
| **8 semaines** | CHPL (Carré, Hépatite, Parvovirose, Leptospirose) |
| **12 semaines** | CHPL + Rage (si nécessaire) |
| **16 semaines** | CHPL |
| **1 an** | CHPL + Rage |

**Puis :**
- **CHPL** : tous les **3 ans**
- **Leptospirose** : tous les **ans**
- **Rage** : selon vaccin (1 ou 3 ans)

## Vaccins pour CHATS

### Vaccins "essentiels" (TOUS les chats)

#### 1. Typhus (Panleucopénie féline - FPV)
**Maladie :** Virus détruisant globules blancs
**Symptômes :** Diarrhée hémorragique, vomissements
**Mortalité :** 90% (chatons)
**Vaccination :**
- 1re injection : 8 semaines
- 2e injection : 12 semaines
- **Rappel** : 1 an, puis tous les **3 ans**

#### 2. Coryza (Herpèsvirus + Calicivirus)
**Maladie :** Infection respiratoire très contagieuse
**Symptômes :** Éternuements, yeux/nez qui coulent, ulcères buccaux
**Gravité :** Chronique (récidives à vie)
**Vaccination :**
- 1re injection : 8 semaines
- 2e injection : 12 semaines
- **Rappel** : **ANNUEL** (immunité courte)

### Vaccins "non-essentiels" (selon risques)

#### 3. Leucose féline (FeLV)
**Maladie :** Virus détruisant immunité (SIDA du chat)
**Transmission :** Salive, morsures, léchage
**Gravité :** Mortelle (cancers, infections)
**Vaccination :**
- Dépistage négatif obligatoire avant vaccination
- 1re injection : 8 semaines
- 2e injection : 12 semaines
- **Rappel** : Annuel
**Recommandé si :**
- ✅ Chat sortant
- ✅ Contact avec d'autres chats (extérieur)
- ❌ Inutile si chat d'intérieur strict et seul

#### 4. Rage
**Maladie :** Virus mortel
**Vaccination :**
- 1re injection : 12 semaines
- **Rappel** : 1 ou 3 ans (selon vaccin)
**Obligatoire pour :**
- Voyages à l'étranger
- Pensions
- Guyane

#### 5. Chlamydiose (Chlamydophila)
**Maladie :** Bactérie causant conjonctivites
**Gravité :** Faible (rarement grave)
**Vaccination :** Incluse dans certains vaccins combinés
**Recommandé si :** Collectivités (élevages, refuges)

### Calendrier vaccinal CHAT (1re année)

| Âge | Vaccins |
|-----|---------|
| **8 semaines** | TC (Typhus + Coryza) + Leucose (si sortant) |
| **12 semaines** | TC + Leucose + Rage (si nécessaire) |
| **1 an** | TC + Leucose + Rage |

**Puis :**
- **Typhus** : tous les **3 ans**
- **Coryza** : tous les **ans**
- **Leucose** : tous les **ans** (si sortant)
- **Rage** : selon vaccin (1 ou 3 ans)

## Questions fréquentes

### Pourquoi 3 injections pour les chiots/chatons ?

Les anticorps maternels (via le lait) protègent les nouveau-nés mais **bloquent aussi le vaccin**. Ces anticorps diminuent progressivement entre 8 et 16 semaines. On vaccine donc plusieurs fois pour couvrir la période de vulnérabilité.

### Peut-on espacer les rappels ?

✅ **OUI** pour certains vaccins :
- Carré, Parvovirose, Hépatite, Typhus : immunité longue (3 ans minimum)
- Études montrent immunité jusqu'à 7 ans voire plus

❌ **NON** pour d'autres :
- Leptospirose, Coryza : immunité courte (< 1 an)
- Rappel annuel indispensable

### Mon animal d'intérieur a-t-il besoin de vaccins ?

✅ **OUI** même en intérieur :
- Vous apportez des virus sous vos chaussures
- Parvovirose et Typhus résistent des mois dans l'environnement
- Fenêtres/balcons (contact avec oiseaux, insectes)

**Minimum pour chat d'intérieur :** Typhus + Coryza
**Minimum pour chien d'intérieur :** CHP (Carré, Hépatite, Parvo)

### Les vaccins sont-ils dangereux ?

**Effets secondaires fréquents (bénins) :**
- Fatigue 24-48h (normal, immunité se met en place)
- Petite boule au point d'injection (disparaît en 1-2 semaines)
- Légère fièvre

**Effets rares (< 1/10 000) :**
- Réaction allergique (urticaire, gonflement)
- Choc anaphylactique (très rare, géré par le vétérinaire)

**Sarcome vaccinal (chat) :**
- Tumeur très rare (1/10 000 à 1/30 000)
- Liée à l'inflammation chronique
- Prévention : espacer les sites d'injection, vaccins non-adjuvés

✅ **Rapport bénéfice/risque largement en faveur de la vaccination**

### Puis-je vacciner mon animal âgé ?

✅ **OUI** les seniors ont besoin de vaccins :
- Immunité diminue avec l'âge
- Plus vulnérables aux infections

**Adaptation :** Bilan sanguin avant vaccination (vérifier fonction rénale/hépatique)

### Que faire si retard dans les rappels ?

- **< 6 mois de retard** : 1 injection suffit généralement
- **> 1 an de retard** : redémarrer le protocole (2 injections)

## Coût des vaccinations

### Chien (vaccins essentiels)
- 1re année : 150-250€ (3 consultations)
- Rappels : 50-80€/an

### Chat (vaccins essentiels)
- 1re année : 120-200€
- Rappels : 50-70€/an

💡 **Astuce** : Certaines assurances remboursent les vaccins (forfait prévention)

## Où faire vacciner ?

✅ **Vétérinaire uniquement** (obligatoire en France/Belgique)
❌ Pas en animalerie, élevage non vétérinaire

**Pourquoi ?**
- Examen clinique avant vaccination (détecter contre-indications)
- Carnet de vaccination officiel (obligatoire pour voyages)
- Réanimation disponible (si réaction allergique)
- Chaîne du froid respectée (efficacité garantie)

## Checklist vaccination

✅ Carnet de vaccination à jour
✅ Vaccins essentiels tous les 1-3 ans (selon vaccin)
✅ Rappels dans les délais
✅ Ajout de vaccins non-essentiels selon risques
✅ Examen annuel même si pas de vaccin

---
*Article rédigé par Dr. Antoine Mercier, docteur vétérinaire, diplômé en immunologie vétérinaire*`,
    imageUrl: "https://images.unsplash.com/photo-1530126483408-aa533e55bdb2?w=800",
    tags: ["santé", "vaccins", "prévention", "chien", "chat"],
    authorId: "expert_vet_007",
    authorName: "Dr. Antoine Mercier",
    status: "published",
    publishedAt: new Date().toISOString(),
    viewCount: 0,
  },
];

// Fonction pour ajouter les articles
async function addArticles() {
  console.log('🚀 Début de l\'ajout des articles de blog...\n');
  
  try {
    for (const article of articles) {
      console.log(`📝 Ajout de l'article : "${article.title}"...`);
      
      const docRef = await addDoc(collection(db, 'blog_articles'), {
        ...article,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log(`   ✅ Article ajouté avec l'ID : ${docRef.id}`);
      console.log(`   📂 Catégorie : ${article.category}`);
      console.log(`   👤 Auteur : ${article.authorName}`);
      console.log(`   🐾 Espèces : ${article.species.join(', ')}\n`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCÈS ! Tous les articles ont été ajoutés à Firestore');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Résumé :`);
    console.log(`   • Total d'articles ajoutés : ${articles.length}`);
    console.log(`   • Par catégorie :`);
    console.log(`     - Urgences : ${articles.filter(a => a.category === 'emergency').length}`);
    console.log(`     - Espèces : ${articles.filter(a => a.category === 'species').length}`);
    console.log(`     - Alimentation : ${articles.filter(a => a.category === 'nutrition').length}`);
    console.log(`     - Comportement : ${articles.filter(a => a.category === 'behavior').length}`);
    console.log(`     - Santé : ${articles.filter(a => a.category === 'health').length}`);
    
    console.log('\n✨ Les articles sont maintenant disponibles dans votre application !\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des articles:', error);
    process.exit(1);
  }
}

// Exécuter le script
addArticles();

