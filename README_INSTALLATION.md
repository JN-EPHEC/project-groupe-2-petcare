# 🐾 PetCare+ - Guide d'Installation et Utilisation

## 📋 Table des matières
1. [Installation du projet](#installation-du-projet)
2. [Lancer l'application](#lancer-lapplication)
3. [Voir l'application sur Chrome (Vue Mobile)](#voir-lapplication-sur-chrome)
4. [Technologies utilisées](#technologies-utilisées)
5. [Pages et Fonctionnalités](#pages-et-fonctionnalités)
6. [Comptes de démonstration](#comptes-de-démonstration)

---

## 🚀 Installation du projet

### Étape 1 : Installer les outils nécessaires

Avant de commencer, vous devez installer ces programmes sur votre ordinateur :

1. **Node.js** (version 18 ou supérieure)
   - Télécharger ici : https://nodejs.org/
   - Choisir la version LTS (Long Term Support)
   - Double-cliquer sur le fichier téléchargé et suivre les instructions

2. **Visual Studio Code (VS Code)**
   - Télécharger ici : https://code.visualstudio.com/
   - C'est l'éditeur de code que nous utilisons
   - Installer normalement

3. **Google Chrome**
   - Si vous ne l'avez pas : https://www.google.com/chrome/
   - Nécessaire pour voir la vue mobile

### Étape 2 : Ouvrir le projet dans VS Code

1. **Télécharger le code** :
   - Vous avez normalement un dossier appelé `PetCare+`
   - Ce dossier contient tout le code de l'application

2. **Ouvrir dans VS Code** :
   - Ouvrir Visual Studio Code
   - Cliquer sur `Fichier` → `Ouvrir un dossier...`
   - Sélectionner le dossier `PetCare+`
   - Cliquer sur `Ouvrir`

3. **Ouvrir le Terminal** :
   - Dans VS Code, cliquer sur `Terminal` → `Nouveau Terminal`
   - Une fenêtre noire/blanche s'ouvre en bas de l'écran
   - C'est là qu'on va taper les commandes

### Étape 3 : Installer les dépendances

Dans le terminal que vous venez d'ouvrir, taper cette commande :

```bash
npm install
```

**Attention** : Cette étape peut prendre 5-10 minutes. C'est normal ! ⏳

L'ordinateur télécharge tous les outils nécessaires pour faire fonctionner l'application.

---

## 🎮 Lancer l'application

### Commande pour démarrer

Dans le terminal de VS Code, taper :

```bash
npm start
```

**Ce qui va se passer** :
1. Un QR code apparaît dans le terminal
2. Une page s'ouvre automatiquement dans votre navigateur
3. L'adresse est : `http://localhost:8081` ou `http://localhost:19006`

**✅ Si vous voyez cette page, c'est bon !**

---

## 📱 Voir l'application sur Chrome (Vue Mobile)

### Méthode 1 : Mode développeur Chrome (Recommandé)

1. **Ouvrir la page** :
   - Chrome s'ouvre automatiquement après `npm start`
   - Ou aller manuellement sur : `http://localhost:8081`

2. **Activer la vue mobile** :
   - **Raccourci clavier** : `F12` (Windows/Linux) ou `Cmd + Option + I` (Mac)
   - Ou **Clic droit** sur la page → `Inspecter`
   - Une fenêtre s'ouvre sur le côté ou en bas

3. **Passer en mode mobile** :
   - Cliquer sur l'icône 📱 (en haut à gauche des outils développeur)
   - Ou utiliser le raccourci : `Ctrl + Shift + M` (Windows/Linux) ou `Cmd + Shift + M` (Mac)

4. **Choisir un appareil** :
   - En haut, cliquer sur le menu déroulant (écrit "Dimensions: Responsive" ou "Responsive")
   - Choisir : **iPhone 12 Pro** ou **iPhone 14 Pro** (recommandé)
   - Ou choisir : **Pixel 5** pour Android

5. **Ajuster la vue** :
   - Vous pouvez zoomer/dézoomer avec `Ctrl + Molette` (Windows) ou `Cmd + Molette` (Mac)
   - Recommandé : 75% ou 100% pour voir toute l'app

### Méthode 2 : Redimensionner la fenêtre

Si la méthode 1 ne marche pas :
- Réduire la largeur de la fenêtre Chrome manuellement
- La rendre très étroite (comme un téléphone)
- L'application s'adapte automatiquement

---

## 🛠️ Technologies utilisées

### Framework principal
- **React Native avec Expo** : Framework pour créer des applications mobiles
  - Permet d'écrire du code une seule fois
  - Fonctionne sur iPhone ET Android
  - Plus rapide à développer qu'en natif

### Langage de programmation
- **TypeScript** : Version améliorée de JavaScript
  - Détecte les erreurs avant l'exécution
  - Rend le code plus fiable et maintenable

### Navigation
- **React Navigation** : Système de navigation entre les pages
  - Gère les onglets en bas (tabs)
  - Gère la navigation entre les écrans (stack)

### Internationalisation
- **i18next** : Système de traduction
  - Support Français et Anglais
  - Changement de langue en temps réel

### Bibliothèques d'icônes
- **@expo/vector-icons** : 
  - Ionicons pour les icônes générales
  - MaterialCommunityIcons pour les icônes médicales

### Cartes interactives
- **react-native-maps** : Affichage de cartes pour localiser les vétérinaires

### Gestion d'état
- **React Context API** : Gestion de l'état global
  - Authentification des utilisateurs
  - Changement de langue
  - Sélection de l'animal actif

### Design
- **Thème personnalisé** : 
  - Palette de couleurs cohérente (Navy, Teal, Light Blue)
  - Système de spacing et typography unifié
  - Composants réutilisables

### Données de démonstration
- **Service demoAuth** : Système d'authentification local
  - Pas besoin de base de données pour la démo
  - 3 comptes pré-configurés (Admin, Vétérinaire, Propriétaire)

---

## 🎨 Développement avec l'IA

**Nous avons utilisé l'Intelligence Artificielle** (Claude AI par Anthropic) pour :

### 1. Génération de code
- Création rapide des composants React Native
- Génération des styles cohérents
- Création des interfaces TypeScript

### 2. Architecture du projet
- Structure des dossiers organisée
- Séparation des responsabilités (screens, components, services)
- Système de navigation optimal

### 3. Design et UX
- Création d'interfaces modernes et intuitives
- Adaptation des designs Figma en code
- Composants réutilisables

### 4. Debugging et optimisation
- Correction des erreurs de syntaxe
- Optimisation des performances
- Résolution de problèmes de compatibilité

### 5. Documentation
- Génération de ce guide d'installation
- Commentaires dans le code
- Documentation des fonctionnalités

**Avantages de l'utilisation de l'IA** :
- ⚡ Développement 5x plus rapide
- 🎯 Code de qualité professionnelle
- 🐛 Moins d'erreurs grâce aux suggestions
- 📚 Documentation automatique

---

## 📄 Pages et Fonctionnalités

### 🔐 Pages d'Authentification

#### 1. **Page de Splash** (`SplashScreen`)
- Premier écran au lancement
- Logo et animation de chargement

#### 2. **Page de Connexion** (`LoginScreen`)
- Formulaire email + mot de passe
- Boutons de connexion démo
- Lien vers l'inscription

#### 3. **Page d'Inscription** (`SignupScreen`)
- Formulaire complet (nom, prénom, email, téléphone, animal)
- Validation des champs
- Redirection vers confirmation email

#### 4. **Page de Confirmation Email** (`EmailConfirmationScreen`)
- Message de confirmation d'inscription
- Possibilité de renvoyer l'email

---

### 🐾 Interface Propriétaire (Owner)

#### Pages principales

**1. HomeScreen - Accueil**
- Message de bienvenue personnalisé
- 5 cartes d'action rapide :
  - Rappels (rendez-vous, vaccins)
  - Historique médical
  - Mode hors ligne
  - Urgences
  - Calendrier

**2. RemindersScreen - Rappels**
- Liste des rappels passés et à venir
- Timeline avec icônes colorées par type
- Groupement par mois
- Recherche/filtrage
- Navigation vers le calendrier

**3. CalendarScreen - Calendrier interactif**
- Vue mensuelle et hebdomadaire
- Indicateurs visuels sur les jours avec rappels
- Liste des rappels du jour sélectionné
- Ajout de nouveaux rappels
- Options de synchronisation et notifications

**4. OfflineModeScreen - Mode hors ligne**
- Accès aux données essentielles sans internet
- Liste des fonctionnalités disponibles hors ligne

**5. OwnerProfileScreen - Profil propriétaire**
- Informations personnelles
- Liste des animaux
- Accès aux paramètres
- Bouton premium
- Déconnexion

**6. PetProfileScreen - Profil de l'animal**
- Photo et informations (nom, race, âge, poids)
- Accès au carnet de santé
- Accès aux vaccinations
- Accès aux documents

**7. HealthRecordScreen - Historique médical**
- Liste complète des soins médicaux
- Filtres par catégorie (vaccins, traitements, chirurgies, etc.)
- Recherche par mot-clé
- Statistiques (total, années, vétérinaires)
- Cartes colorées par type de soin

**8. VaccinationsScreen - Carnet de vaccination**
- Informations de l'animal
- Historique complet des vaccinations
- Tableau avec dates et types de vaccins

**9. DocumentsScreen - Mes documents**
- Liste de tous les documents uploadés
- Recherche par nom de fichier
- Date d'upload

**10. EmergencyScreen - Urgences**
- Liste des vétérinaires proches
- Recherche par nom/spécialité/lieu
- Bouton d'appel direct
- Lien vers la carte interactive

**11. MapScreen - Carte des vétérinaires**
- Carte interactive de la Belgique
- Markers pour chaque vétérinaire
- Légende et informations

**12. NotificationsScreen - Notifications**
- Liste des notifications importantes
- Rappels de vaccins, vermifuge, nourriture

**13. EditProfileScreen - Modifier le profil**
- Édition des informations personnelles
- Changement de mot de passe
- Suppression du compte

**14. PreferencesScreen - Préférences cookies**
- Gestion des cookies
- Options de confidentialité

**15. AddPetScreen - Ajouter un animal**
- Formulaire pour ajouter un nouvel animal
- Upload de photo

**16. PremiumScreen - Abonnement Premium**
- Présentation des fonctionnalités premium
- Tarification (€0.99/mois par animal)

---

### 👨‍⚕️ Interface Vétérinaire (Vet)

#### Pages principales

**1. VetDashboardScreen - Tableau de bord vétérinaire**
- Statistiques du jour :
  - Rendez-vous aujourd'hui
  - Rendez-vous en attente
  - Total patients
  - Consultations cette semaine
- Actions rapides (RDV, Patients, Horaires, Profil)
- Rendez-vous du jour avec détails
- Demandes en attente d'approbation

**2. VetAppointmentsScreen - Gestion des rendez-vous**
- 3 onglets : À venir, Passés, Annulés
- Recherche par animal ou propriétaire
- Cartes détaillées avec :
  - Heure, type de consultation
  - Nom de l'animal et propriétaire
  - Notes du rendez-vous
  - Actions (Appeler, Terminer)

**3. VetPatientsScreen - Liste des patients**
- Filtres : Tous, Chats, Chiens
- Recherche par nom
- Cartes patients avec :
  - Emoji de l'animal
  - Informations (nom, race, âge, poids)
  - Statut de santé
  - Propriétaire et contact
  - Dernière visite
  - Actions (Dossier, Appeler, RDV)

**4. VetScheduleScreen - Gestion des disponibilités**
- Activation/désactivation des urgences
- Accepter nouveaux patients (toggle)
- Horaires par jour de la semaine
- Durée des consultations (15min à 1h)
- Sauvegarder les modifications

**5. VetProfileScreen - Profil vétérinaire**
- Photo et informations professionnelles
- Spécialité et expérience
- Informations de la clinique
- Email et téléphone
- Heures d'ouverture
- Boutons : Gérer disponibilités, Voir patients
- Déconnexion

---

### 🔐 Interface Administrateur (Admin)

#### Pages principales

**1. AdminDashboardScreen - Tableau de bord admin**
- Statistiques globales :
  - Utilisateurs totaux (1248)
  - Animaux enregistrés (2156)
  - Vétérinaires (89)
  - Vétérinaires en attente (12)
- Performance : Utilisateurs actifs, Croissance
- Actions rapides (Gérer utilisateurs, Valider vets, Stats, Paramètres)
- Activité récente (5 dernières actions)
- Alertes de signalements

**2. AdminUsersScreen - Gestion des utilisateurs**
- Recherche par nom/email
- Filtres : Tous, Propriétaires, Vétérinaires, Admins
- Cartes utilisateurs détaillées :
  - Avatar, nom, email
  - Badges de rôle et statut
  - Date d'inscription
  - Nombre d'animaux/patients
  - Actions : Approuver, Suspendre, Activer, Supprimer

**3. AdminVetsScreen - Validation des vétérinaires**
- 3 onglets : En attente, Approuvés, Rejetés
- Recherche par nom/spécialité
- **Onglet "En attente"** :
  - Informations complètes du vétérinaire
  - Licence, expérience, clinique
  - Documents soumis
  - Actions : Approuver / Rejeter (avec raison)
- **Onglet "Approuvés"** :
  - Note moyenne
  - Nombre de patients
  - Actions : Voir profil / Suspendre
- **Onglet "Rejetés"** :
  - Raison du rejet
  - Actions : Réexaminer / Supprimer

**4. AdminPetsScreen - Gestion des animaux**
- Statistiques : Total, Vaccinés, Non vaccinés
- Recherche par nom/propriétaire/race
- Filtres : Tous, Chats, Chiens, Autres
- Cartes animaux :
  - Emoji, nom, race, âge
  - Badge de vaccination
  - Propriétaire et dossiers médicaux
  - Actions : Voir profil / Supprimer

**5. AdminAnalyticsScreen - Statistiques & Analytics**
- **Vue d'ensemble** : Stats clés avec croissance
- **Tendances récentes** : Inscriptions, Consultations, Rétention
- **Distribution des animaux** : Barres de progression (Chats/Chiens/Autres)
- **Top 3 vétérinaires** : Classement avec notes et patients
- **Engagement utilisateurs** : Actifs quotidiens/mensuels, Rétention, Session moyenne
- **Revenus & Abonnements** : Revenus mensuels, Abonnements actifs, Taux de désabonnement
- Bouton export des données

**6. AdminProfileScreen - Profil administrateur**
- Badge ADMIN avec photo de profil
- Statistiques d'administration :
  - Utilisateurs gérés (1248)
  - Vétérinaires approuvés (89)
  - Signalements traités (342)
  - Actions aujourd'hui (23)
- Actions rapides (même que dashboard)
- Paramètres du compte :
  - Modifier profil
  - Sécurité & Permissions
  - Notifications admin
  - Logs & Rapports
  - Langue
- Informations système (Version, Environnement, Dernière MAJ)
- Déconnexion

---

## 🎨 Composants réutilisables

### 1. **Button** - Bouton personnalisé
- Styles cohérents
- Support des icônes
- Variantes (primary, secondary, etc.)

### 2. **Input** - Champ de saisie
- Placeholder personnalisé
- Validation intégrée
- Support des icônes

### 3. **ActionCard** - Carte d'action
- Design uniforme
- Icône + Titre
- Animation au toucher

### 4. **CustomTabBar** - Barre de navigation personnalisée
- 4 onglets : Home, Add, Search, Profile
- Icônes animées
- Design moderne avec ombres

### 5. **LanguageSwitcher** - Sélecteur de langue
- Changement FR/EN
- Sauvegarde de la préférence

---

## 🎯 Fonctionnalités principales

### 1. **Système d'authentification multi-rôles**
- 3 types de comptes : Propriétaire, Vétérinaire, Administrateur
- Navigation différente selon le rôle
- Données spécifiques à chaque utilisateur

### 2. **Gestion des animaux**
- Profils complets pour chaque animal
- Historique médical détaillé
- Suivi des vaccinations
- Documents associés

### 3. **Système de rappels intelligent**
- Calendrier interactif
- Notifications programmées
- Groupement par période
- Timeline visuelle

### 4. **Recherche et filtrage avancés**
- Sur tous les écrans principaux
- Filtres par catégorie
- Résultats en temps réel

### 5. **Géolocalisation des vétérinaires**
- Carte interactive
- Liste avec distances
- Appel direct depuis l'app

### 6. **Interface multilingue**
- Français et Anglais
- Changement instantané
- Persistance de la préférence

### 7. **Mode hors ligne**
- Accès aux données essentielles
- Synchronisation automatique

### 8. **Dashboard admin complet**
- Statistiques en temps réel
- Gestion des utilisateurs
- Validation des vétérinaires
- Analytics détaillés

---

## 👥 Comptes de démonstration

Pour tester l'application, utilisez ces comptes :

### 🐾 Compte Propriétaire
```
Email: owner@petcare.com
Mot de passe: owner123
```
**Accès à** : Profil animal, Rappels, Calendrier, Historique médical, Urgences

### 👨‍⚕️ Compte Vétérinaire
```
Email: vet@petcare.com
Mot de passe: vet123
```
**Accès à** : Dashboard vétérinaire, Patients, Rendez-vous, Horaires, Profil pro

### 🔐 Compte Administrateur
```
Email: admin@petcare.com
Mot de passe: admin123
```
**Accès à** : Dashboard admin, Gestion utilisateurs, Validation vétérinaires, Analytics, Gestion animaux

---

## 📁 Structure du projet

```
PetCare+/
├── src/
│   ├── screens/          # Tous les écrans de l'app
│   │   ├── auth/         # Pages d'authentification
│   │   ├── home/         # Pages propriétaire (accueil, rappels, calendrier)
│   │   ├── profile/      # Pages de profil (utilisateur, animal)
│   │   ├── health/       # Pages santé (historique, vaccins, documents)
│   │   ├── emergency/    # Pages urgences (vétérinaires, carte)
│   │   ├── vet/          # Pages vétérinaire (dashboard, patients, RDV)
│   │   ├── admin/        # Pages administrateur (users, stats, validation)
│   │   └── premium/      # Page premium
│   │
│   ├── components/       # Composants réutilisables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── ActionCard.tsx
│   │   ├── CustomTabBar.tsx
│   │   └── LanguageSwitcher.tsx
│   │
│   ├── navigation/       # Configuration de la navigation
│   │   └── RootNavigator.tsx
│   │
│   ├── context/          # Gestion de l'état global
│   │   ├── AuthContext.tsx    # Authentification
│   │   └── LanguageContext.tsx # Langue
│   │
│   ├── services/         # Services et logique métier
│   │   └── demoAuth.ts   # Authentification démo
│   │
│   ├── i18n/             # Traductions
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── fr.json   # Français
│   │       └── en.json   # Anglais
│   │
│   ├── theme/            # Design system
│   │   └── index.ts      # Couleurs, spacing, typography
│   │
│   └── assets/           # Images, icônes
│       └── doctors/      # Photos de vétérinaires
│
├── App.tsx               # Point d'entrée de l'application
├── package.json          # Dépendances du projet
└── tsconfig.json         # Configuration TypeScript
```

---

## 🎓 Pour la présentation au professeur

### Points clés à mentionner :

1. **Application mobile complète** avec React Native et TypeScript
2. **3 interfaces différentes** selon le rôle utilisateur
3. **18 pages propriétaire** + **5 pages vétérinaire** + **6 pages admin** = **29 pages au total**
4. **Fonctionnalités avancées** : calendrier interactif, cartes, recherche, filtrage
5. **Design moderne** inspiré du Figma avec palette cohérente
6. **Multilingue** (FR/EN) avec changement instantané
7. **Développé avec l'aide de l'IA** pour accélérer le processus
8. **Code structuré** et maintenable avec TypeScript
9. **Système de navigation** sophistiqué avec tabs et stacks
10. **Données de démonstration** complètes pour tous les rôles

### Démonstration suggérée :
1. Montrer les 3 comptes (propriétaire, vétérinaire, admin)
2. Parcourir les fonctionnalités principales
3. Montrer le calendrier interactif
4. Montrer la carte des vétérinaires
5. Montrer les différentes interfaces selon le rôle
6. Changer la langue (FR ↔ EN)
7. Montrer la recherche/filtrage
8. Montrer le dashboard admin avec les stats

---

## 🆘 Problèmes courants

### L'application ne démarre pas
- Vérifier que Node.js est bien installé : `node --version`
- Réinstaller les dépendances : `npm install`
- Supprimer le cache : `npx expo start -c`

### La page ne s'affiche pas
- Vérifier que le serveur est lancé (voir le terminal)
- Rafraîchir la page Chrome : `F5` ou `Ctrl + R`
- Vérifier l'URL : `http://localhost:8081`

### Les icônes ne s'affichent pas
- Attendre que le chargement soit complet
- Rafraîchir la page

### Le mode mobile ne fonctionne pas
- Utiliser F12 puis l'icône 📱
- Ou réduire manuellement la largeur de la fenêtre

---

## 📞 Contact

Pour toute question sur ce projet, vous pouvez vous référer à ce guide ou demander de l'aide.

**Bon courage pour la présentation ! 🚀**

---

*Guide créé le 20 novembre 2024*  
*PetCare+ - Application de gestion pour animaux de compagnie*

