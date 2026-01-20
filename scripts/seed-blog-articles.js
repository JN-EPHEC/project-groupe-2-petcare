// Script pour ajouter des articles de blog dans Firestore
// Exécuter avec: node scripts/seed-blog-articles.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuration Firebase (même que config/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyDNShGqaDO-7JxC8aLUhqW7IGrOd9m1kdQ",
  authDomain: "petcare-2a317.firebaseapp.com",
  projectId: "petcare-2a317",
  storageBucket: "petcare-2a317.firebasestorage.app",
  messagingSenderId: "1007959336663",
  appId: "1:1007959336663:web:e15d0a9bb5f70f9e3f3df7",
  measurementId: "G-XMJMNFN9KE"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Articles de blog à ajouter
const articles = [
  {
    title: "Comment reconnaître une urgence vétérinaire chez votre animal ?",
    slug: "reconnaitre-urgence-veterinaire",
    category: "emergency",
    excerpt: "Savoir identifier les signes d'une urgence peut sauver la vie de votre compagnon. Découvrez les symptômes à surveiller et quand consulter en urgence.",
    content: `
# Comment reconnaître une urgence vétérinaire ?

Les urgences vétérinaires peuvent survenir à tout moment. Savoir les reconnaître rapidement peut faire la différence entre la vie et la mort de votre animal.

## Les signes d'urgence absolue

### Difficultés respiratoires
- Respiration rapide ou laborieuse
- Gencives bleues ou pâles
- Halètement excessif sans raison apparente

### Traumatismes graves
- Accident de la route
- Chute d'une hauteur importante
- Blessures ouvertes avec saignement important

### Symptômes neurologiques
- Convulsions
- Perte de conscience
- Désorientation soudaine
- Paralysie

## Quand consulter dans les 24 heures

Certains symptômes nécessitent une consultation rapide mais pas nécessairement urgente :

- Vomissements répétés (plus de 3 fois)
- Diarrhée sanglante
- Refus de manger pendant plus de 24h
- Léthargie inhabituelle

## Que faire en attendant ?

1. **Restez calme** : votre stress se transmet à votre animal
2. **Appelez votre vétérinaire** : décrivez les symptômes
3. **Sécurisez votre animal** : évitez qu'il ne se blesse davantage
4. **Gardez-le au chaud** : une couverture peut aider en cas de choc

## Numéros d'urgence

Gardez toujours à portée de main :
- Le numéro de votre vétérinaire habituel
- Le numéro d'une clinique d'urgence 24h/24
- Le centre antipoison vétérinaire

> **Important** : En cas de doute, il vaut mieux consulter trop tôt que trop tard.
`,
    tags: ["urgence", "premiers secours", "santé", "prévention"],
    authorName: "Dr. Sophie Martin",
    authorTitle: "Vétérinaire urgentiste",
    status: "published",
    featured: true,
    imageUrl: null,
  },
  
  {
    title: "Alimentation du chat : les erreurs à éviter",
    slug: "alimentation-chat-erreurs-eviter",
    category: "nutrition",
    excerpt: "Une bonne alimentation est la clé de la santé de votre chat. Découvrez les erreurs courantes et comment les éviter pour garantir une vie longue et saine à votre félin.",
    content: `
# Alimentation du chat : les erreurs à éviter

L'alimentation est un pilier fondamental de la santé de votre chat. Malheureusement, certaines erreurs courantes peuvent avoir des conséquences graves sur son bien-être.

## Erreur #1 : Donner du lait

**Contrairement à la croyance populaire, le lait n'est pas bon pour les chats adultes.**

Les chats adultes sont généralement intolérants au lactose. Le lait peut provoquer :
- Diarrhées
- Vomissements
- Troubles digestifs

## Erreur #2 : Alimentation végétarienne

Les chats sont des **carnivores stricts**. Ils ont besoin de nutriments essentiels qu'on ne trouve que dans la viande :

- **Taurine** : essentielle pour le cœur et la vision
- **Vitamine A préformée** : uniquement dans les tissus animaux
- **Acide arachidonique** : un acide gras essentiel

## Erreur #3 : Nourriture pour chien

La nourriture pour chien ne convient pas aux chats car :
- Elle manque de taurine
- Le rapport protéines/graisses est inadéquat
- Les vitamines ne sont pas adaptées

## Erreur #4 : Suralimentation

**L'obésité est un problème croissant chez les chats domestiques.**

Conséquences :
- Diabète félin
- Problèmes articulaires
- Maladies cardiaques
- Réduction de l'espérance de vie

### Comment l'éviter ?
- Pesez les portions
- Évitez les friandises excessives
- Encouragez l'exercice
- Consultez votre vétérinaire pour le poids idéal

## Erreur #5 : Changement brusque d'alimentation

Un changement trop rapide peut causer des troubles digestifs.

### Transition progressive (7-10 jours) :
- Jours 1-3 : 75% ancienne / 25% nouvelle
- Jours 4-6 : 50% / 50%
- Jours 7-10 : 25% / 75%
- Après : 100% nouvelle alimentation

## Les bons réflexes

✅ Choisir une alimentation adaptée à l'âge  
✅ Eau fraîche toujours disponible  
✅ Portions contrôlées  
✅ Alimentation de qualité premium  
✅ Consultation vétérinaire annuelle  

> **Conseil de pro** : Privilégiez la nourriture humide qui apporte l'hydratation nécessaire, surtout si votre chat boit peu.
`,
    tags: ["chat", "alimentation", "nutrition", "prévention"],
    authorName: "Dr. Marie Dubois",
    authorTitle: "Vétérinaire nutritionniste",
    status: "published",
    featured: true,
    imageUrl: null,
  },

  {
    title: "Comprendre le langage corporel de votre chien",
    slug: "langage-corporel-chien",
    category: "behavior",
    excerpt: "Votre chien communique constamment avec vous à travers son langage corporel. Apprenez à décoder ses signaux pour mieux le comprendre et renforcer votre complicité.",
    content: `
# Comprendre le langage corporel de votre chien

Les chiens sont des maîtres de la communication non-verbale. Chaque position de queue, chaque mouvement d'oreille a une signification. Apprendre à les lire vous aidera à mieux comprendre votre compagnon.

## La queue : un indicateur émotionnel

### Queue haute et qui remue rapidement
- **Signification** : Excitation, joie, confiance
- **Contexte** : Vous rentrez à la maison, heure de la promenade

### Queue basse ou entre les pattes
- **Signification** : Peur, soumission, inconfort
- **Contexte** : Environnement effrayant, situation stressante

### Queue haute et rigide
- **Signification** : Alerte, tension, possible agressivité
- **Action** : Rester vigilant, évaluer la situation

## Les oreilles : des antennes émotionnelles

### Oreilles dressées vers l'avant
- Attention, curiosité
- Votre chien est concentré sur quelque chose

### Oreilles plaquées en arrière
- Peur, anxiété
- Peut précéder un comportement défensif

### Oreilles détendues sur les côtés
- Calme, décontraction
- Votre chien se sent en sécurité

## Les yeux : le miroir de l'âme canine

### Contact visuel direct et soutenu
- **Entre chiens** : Peut être un défi, une menace
- **Avec l'humain** : Connexion, attention, affection

### Yeux mi-clos
- Détente, confiance
- Signe de bien-être

### "Yeux de baleine" (on voit le blanc)
- Stress, inconfort
- Votre chien se sent menacé

## La posture générale

### Posture d'invitation au jeu
- Avant-train au sol, arrière-train en l'air
- Queue qui remue
- C'est le signal universel "viens jouer !"

### Posture de soumission
- Ventre exposé
- Pattes repliées
- Évitement du contact visuel

### Posture d'intimidation
- Corps penché en avant
- Poils hérissés (piloérection)
- Gueule plissée, dents visibles

## Les signaux d'apaisement

Votre chien utilise ces signaux pour calmer une situation :

1. **Bâillement** (hors fatigue)
2. **Se lécher les babines**
3. **Détourner le regard**
4. **Se secouer** (comme après un bain, mais à sec)
5. **Renifler le sol**

## Que faire face à un chien stressé ?

✅ **À FAIRE :**
- Donnez de l'espace
- Parlez calmement
- Détournez-vous légèrement
- Laissez le chien s'approcher de lui-même

❌ **À ÉVITER :**
- Contact visuel direct prolongé
- Approche frontale rapide
- Mouvements brusques
- Caresses non désirées

## Cas pratiques

### Scénario 1 : Mon chien se lèche les babines quand je le gronde
**Interprétation** : Signal d'apaisement, il essaie de calmer la situation. Il a compris que vous n'êtes pas content.

### Scénario 2 : Queue qui remue mais corps tendu
**Interprétation** : Excitation mais aussi stress. Attention, ce n'est pas forcément de la joie. Évaluez le contexte global.

### Scénario 3 : Mon chien détourne la tête quand je m'approche
**Interprétation** : Signal de politesse canine. Il montre qu'il n'est pas une menace et attend que vous respectiez son espace.

> **Important** : Le contexte est essentiel. Un même signal peut avoir des significations différentes selon la situation.

## Conclusion

En apprenant à lire le langage corporel de votre chien, vous :
- Renforcez votre lien
- Prévenez les situations de stress
- Évitez les morsures
- Comprenez mieux ses besoins

**Observez, écoutez (avec les yeux !), et communiquez avec bienveillance.**
`,
    tags: ["chien", "comportement", "communication", "éducation"],
    authorName: "Dr. Thomas Lefèvre",
    authorTitle: "Vétérinaire comportementaliste",
    status: "published",
    featured: false,
    imageUrl: null,
  },

  {
    title: "Vaccins essentiels pour chiens et chats : calendrier et importance",
    slug: "vaccins-essentiels-chiens-chats",
    category: "health",
    excerpt: "La vaccination est la meilleure protection contre les maladies infectieuses graves. Découvrez le calendrier vaccinal et pourquoi chaque injection compte.",
    content: `
# Vaccins essentiels pour chiens et chats

La vaccination est l'un des actes préventifs les plus importants pour protéger votre animal contre des maladies potentiellement mortelles.

## Pourquoi vacciner ?

La vaccination permet de :
- **Protéger** votre animal contre des maladies graves
- **Économiser** les coûts de traitement de maladies évitables
- **Contribuer** à la santé publique (rage, leptospirose)
- **Permettre** les voyages et la garde en pension

## Vaccins essentiels pour le CHIEN

### CHPPiL - Le vaccin de base

Ce vaccin protège contre 5 maladies :

1. **C - Carré (Distemper)**
   - Maladie virale très contagieuse
   - Symptômes : fièvre, troubles respiratoires, neurologiques
   - Souvent mortel

2. **H - Hépatite de Rubarth**
   - Infection du foie
   - Peut causer une hépatite aiguë

3. **P - Parvovirose**
   - Très contagieux et résistant
   - Gastro-entérite hémorragique sévère
   - Taux de mortalité élevé chez les chiots

4. **Pi - Parainfluenza**
   - Toux de chenil
   - Infection respiratoire

5. **L - Leptospirose**
   - Transmissible à l'homme (zoonose)
   - Infection bactérienne grave
   - Contamination par l'urine de rongeurs

### Rage (obligatoire pour voyager)
- Vaccination obligatoire pour :
  - Voyages à l'étranger
  - Camping, expositions
  - Pension canine
- Rappel tous les 3 ans

## Vaccins essentiels pour le CHAT

### TCL - La base

1. **T - Typhus (Panleucopénie féline)**
   - Gastro-entérite virale sévère
   - Très contagieux
   - Mortel chez les chatons

2. **C - Coryza (Herpèsvirus + Calicivirus)**
   - Syndrome respiratoire
   - Éternuements, écoulement nasal/oculaire
   - Chronique chez les chats non vaccinés

3. **L - Leucose féline (FeLV)**
   - Virus de l'immunodéficience
   - Cancer, anémie, infections
   - Recommandé pour les chats sortant

### Rage (chat)
- Obligatoire pour voyages
- Recommandé pour chats sortant en zone rurale

## Calendrier vaccinal

### CHIOT
- **8 semaines** : Première injection CHPPi
- **12 semaines** : Deuxième injection CHPPiL
- **16 semaines** : Troisième injection + Rage
- **15 mois** : Premier rappel complet

### CHIEN ADULTE
- Rappel annuel Leptospirose
- Rappel tous les 3 ans CHPPi et Rage

### CHATON
- **8 semaines** : Première injection TC
- **12 semaines** : Deuxième injection TCL + test Leucose
- **16 semaines** : Rage si nécessaire
- **15 mois** : Premier rappel

### CHAT ADULTE
- Rappel annuel TC
- Rappel leucose tous les 2-3 ans
- Rage tous les 3 ans

## Idées reçues sur la vaccination

### ❌ "Mon animal ne sort pas, pas besoin de vaccin"
**FAUX** : Certains virus (comme la parvovirose) peuvent être apportés par vos chaussures.

### ❌ "Les vaccins sont dangereux"
**FAUX** : Les réactions graves sont extrêmement rares. Les bénéfices dépassent largement les risques.

### ❌ "Mon chat âgé n'a plus besoin de vaccins"
**FAUX** : Le système immunitaire s'affaiblit avec l'âge. Les vaccins restent importants.

### ❌ "Un seul vaccin suffit"
**FAUX** : Le protocole initial nécessite plusieurs injections pour une immunité solide.

## Effets secondaires possibles

### Réactions légères (normales)
- Légère fièvre 24-48h
- Fatigue temporaire
- Petite bosse au point d'injection (1-2 semaines)

### Réactions graves (rares)
- Réaction allergique (dans l'heure qui suit)
- Vomissements répétés
- Gonflement du visage

⚠️ **En cas de réaction grave, contactez immédiatement votre vétérinaire.**

## Conseils pratiques

✅ Vaccinez à jour avant les périodes à risque (pension, vacances)  
✅ Gardez le carnet de vaccination  
✅ Surveillez votre animal 24h après le vaccin  
✅ Reportez si votre animal est malade  
✅ Combinez avec le bilan de santé annuel  

## Coût vs bénéfice

- **Coût d'un vaccin** : 40-70€
- **Coût du traitement d'une parvovirose** : 500-2000€ (souvent mortel)
- **Coût du traitement d'une leptospirose** : 1000-3000€

> La vaccination est un investissement dans la santé de votre compagnon, pas une dépense.

## Cas particuliers

### Animaux adoptés adultes sans historique
- Protocole de vaccination complet
- 2 injections à 3-4 semaines d'intervalle

### Animaux immunodéprimés
- Discuter avec votre vétérinaire
- Évaluation individuelle du rapport bénéfice/risque

### Voyages à l'étranger
- Rage obligatoire (3 semaines avant le départ)
- Passeport européen
- Parfois autres vaccins selon la destination

## Conclusion

**La vaccination sauve des vies.** Elle protège votre animal, votre famille et les autres animaux. Respecter le calendrier vaccinal est l'un des actes de prévention les plus importants que vous puissiez faire pour votre compagnon.

N'hésitez pas à discuter avec votre vétérinaire du protocole le plus adapté à votre situation.
`,
    tags: ["vaccins", "prévention", "santé", "chien", "chat"],
    authorName: "Dr. Claire Rousseau",
    authorTitle: "Vétérinaire généraliste",
    status: "published",
    featured: true,
    imageUrl: null,
  },

  {
    title: "Les besoins spécifiques du lapin domestique",
    slug: "besoins-specifiques-lapin",
    category: "species",
    excerpt: "Les lapins ont des besoins très particuliers souvent méconnus. Découvrez comment offrir une vie épanouie et saine à votre compagnon aux longues oreilles.",
    content: `
# Les besoins spécifiques du lapin domestique

Le lapin est devenu un animal de compagnie très populaire, mais ses besoins sont souvent sous-estimés. C'est un animal complexe qui mérite une attention particulière.

## Habitat et espace

### Espace minimum
- **JAMAIS en cage 24h/24**
- Minimum 4m² pour un lapin seul
- Idéal : accès à un grand enclos + sorties quotidiennes libres

### Aménagement
✅ Sol non glissant (tapis, lino)  
✅ Cachettes (tunnels, maisons)  
✅ Plate-forme surélevée  
✅ Zone de jeu  
✅ Bac à litière (oui, les lapins peuvent être propres !)  

❌ Cage métallique nue  
❌ Fond de cage grillagé (risque de pododermatite)  
❌ Isolation sociale  

## Alimentation : la clé de la santé

### Les 3 piliers alimentaires

**1. FOIN À VOLONTÉ (80% de l'alimentation)**
- Essential pour l'usure des dents
- Favorise le transit intestinal
- Foin de prairie de qualité
- Toujours disponible, renouvelé quotidiennement

**2. LÉGUMES FRAIS (15-20%)**
Légumes recommandés :
- Fanes de carottes
- Endive
- Céleri branche
- Fenouil
- Herbes aromatiques (persil, basilic, menthe)

Introduction progressive : 1 nouveau légume tous les 3 jours

**3. GRANULÉS (facultatif, 5%)**
- 25g par kg de poids corporel
- Granulés de qualité (18% fibres minimum)
- PAS de mélanges de graines

### À ÉVITER ABSOLUMENT
❌ Pomme de terre crue  
❌ Avocat (toxique)  
❌ Chocolat  
❌ Laitue iceberg  
❌ Friandises du commerce (trop sucrées)  
❌ Pain, biscuits  

## Soins dentaires

**Les dents du lapin poussent en continu (2-3mm/semaine) !**

### Prévention des malocclusions
- Foin de qualité à volonté
- Branches à ronger (pommier, noisetier)
- Jouets en bois non traité

### Signes d'alerte
- Difficulté à manger
- Hypersalivation
- Œil qui coule
- Amaigrissement

⚠️ **Consultation vétérinaire urgente si vous observez ces signes**

## Vie sociale

**Les lapins sont des animaux SOCIAUX !**

### Vie en duo recommandée
- Binôme idéal : mâle castré + femelle stérilisée
- Introduction progressive et surveillée
- Les lapins seuls peuvent développer des troubles comportementaux

### Interaction avec l'humain
- Minimum 2-3h de présence et d'interaction par jour
- Les lapins n'aiment généralement pas être portés
- Préférez les caresses au sol
- Respectez leur langage corporel

## Stérilisation : indispensable

### Chez la femelle
- **80% de risque de cancer utérin après 4 ans** si non stérilisée
- Prévention des tumeurs mammaires
- Comportement plus équilibré

### Chez le mâle
- Prévention du marquage urinaire
- Réduction de l'agressivité
- Permet la vie en groupe

**Âge idéal : 5-6 mois**

## Santé courante

### Pathologies fréquentes

**1. Stase gastro-intestinale**
- Urgence vétérinaire
- Signes : arrêt du transit, apathie, ventre gonflé
- Prévention : alimentation riche en fibres

**2. Pasteurellose**
- Bactérie responsable de rhinites, abcès
- "Rhume du lapin"
- Contagieux entre lapins

**3. Pododermatite (mal de pattes)**
- Ulcères plantaires
- Causés par : cage grillagée, surpoids, manque d'hygiène
- Prévention : sol adapté, poids optimal

**4. Parasites**
- Puces
- Gale des oreilles
- Coccidiose
- Traitement antiparasitaire régulier

### Bilan de santé

Consultation vétérinaire recommandée :
- Annuelle pour les jeunes adultes
- Tous les 6 mois pour les seniors (>6 ans)
- Contrôle des dents systématique

## Enrichissement et bien-être

### Jouets et activités
- Tunnels en tissu
- Balles en osier
- Tapis à fouiller
- Cartons à détruire
- Foin caché dans des jouets distributeurs

### Besoins comportementaux
Les lapins ont besoin de :
- **Creuser** : bac à fouille avec terre, sable
- **Ronger** : branches, jouets en bois
- **Sauter** : obstacles, plateformes
- **Explorer** : nouveau environnement
- **Se cacher** : cachettes multiples

## Signes de bonne santé

✅ Crottes rondes et sèches en abondance  
✅ Appétit constant  
✅ Comportement actif, curieux  
✅ Toilettage régulier  
✅ Binky (sauts de joie)  
✅ Ronronnement de dents (contentement)  

## Signes d'alerte

🚨 Absence de crottes pendant 12h  
🚨 Refus de manger  
🚨 Apathie, reste prostré  
🚨 Respiration difficile  
🚨 Tête penchée  
🚨 Diarrhée  

**Toute anomalie nécessite une consultation vétérinaire RAPIDE. Les lapins cachent leur mal-être jusqu'à ce que ce soit grave.**

## Espérance de vie

- Moyenne : 8-12 ans
- Record : jusqu'à 15 ans
- Facteurs : alimentation, génétique, soins vétérinaires

## Idées reçues

### ❌ "Les lapins ne boivent pas"
**FAUX** : Eau fraîche à volonté indispensable

### ❌ "Un lapin peut vivre en cage"
**FAUX** : C'est une maltraitance. Les lapins ont besoin d'espace et d'exercice

### ❌ "Les lapins mangent des carottes"
**FAUX** : Trop sucrées ! Occasionnellement seulement

### ❌ "Les lapins sont des animaux faciles"
**FAUX** : Ils ont des besoins spécifiques et complexes

## Coût annuel moyen

- Alimentation : 300-500€
- Litière : 200-300€
- Vétérinaire : 100-200€ (hors urgence)
- Accessoires : 100€
- **Total : 700-1100€/an**

Sans compter la stérilisation (150-250€)

## Conclusion

Le lapin est un compagnon merveilleux, affectueux et plein de personnalité. Mais c'est un engagement sur 10+ ans qui nécessite :
- Temps (plusieurs heures par jour)
- Espace (plusieurs m²)
- Budget conséquent
- Connaissances spécifiques

**Adopter un lapin est une responsabilité à ne pas prendre à la légère.**

> Consultez un vétérinaire spécialisé NAC (Nouveaux Animaux de Compagnie) pour un suivi adapté.
`,
    tags: ["lapin", "NAC", "alimentation", "santé", "comportement"],
    authorName: "Dr. Émilie Bernard",
    authorTitle: "Vétérinaire NAC",
    status: "published",
    featured: false,
    imageUrl: null,
  },
];

// Fonction pour ajouter les articles
async function seedArticles() {
  console.log('🌱 Début de l\'ajout des articles de blog...\n');
  
  try {
    const articlesRef = collection(db, 'blog_articles');
    
    for (const article of articles) {
      const docData = {
        ...article,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      };
      
      const docRef = await addDoc(articlesRef, docData);
      console.log(`✅ Article ajouté: "${article.title}" (ID: ${docRef.id})`);
    }
    
    console.log(`\n🎉 ${articles.length} articles ajoutés avec succès dans Firestore!`);
    console.log('\n📝 Articles créés:');
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} [${article.category}]`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l ajout des articles:', error);
  }
  
  process.exit(0);
}

// Exécuter le script
seedArticles();

