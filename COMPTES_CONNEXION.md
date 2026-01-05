# 🔐 Comptes de Connexion - PetCare+

## Comptes Disponibles

### 1. 👤 Propriétaire d'Animaux (Owner)
**Email**: `owner@petcare.com`  
**Mot de passe**: `owner123`  
**Rôle**: `owner`  
**Dashboard**: Interface propriétaire avec gestion des animaux

---

### 2. 🩺 Vétérinaire (Vet)
**Email**: `vet@petcare.com`  
**Mot de passe**: `vet123`  
**Rôle**: `vet`  
**Dashboard**: Interface vétérinaire avec patients et rendez-vous

---

### 3. 👑 Administrateur (Admin)
**Email**: `admin@petcare.com`  
**Mot de passe**: `admin123`  
**Rôle**: `admin`  
**Dashboard**: Interface admin avec gestion complète de la plateforme

**Note**: Ce compte a le rôle 'admin' et accède au tableau de bord administrateur.

---

## ✅ Correction du Bouton Déconnexion

Le bouton de déconnexion a été corrigé dans les trois interfaces :
- ✅ **OwnerProfileScreen** - Déconnexion pour propriétaires
- ✅ **VetProfileScreen** - Déconnexion pour vétérinaires  
- ✅ **AdminProfileScreen** - Déconnexion pour admins

### Ce qui a été changé :

**Avant** (ne fonctionnait pas bien):
```typescript
await signOut();
navigation.navigate('Splash');
```

**Après** (fonctionne correctement):
```typescript
await signOut();
navigation.reset({
  index: 0,
  routes: [{ name: 'Splash' }],
});
```

La méthode `navigation.reset()` réinitialise complètement la pile de navigation, empêchant l'utilisateur de revenir aux écrans authentifiés après la déconnexion.

---

## 🧪 Tester la Déconnexion

1. **Connectez-vous** avec n'importe quel compte
2. **Naviguez** vers le profil (dernier onglet)
3. **Cliquez** sur "Se déconnecter" / "Logout"
4. **Confirmez** la déconnexion
5. **Vérifiez** que vous êtes redirigé vers l'écran Splash
6. **Testez** que vous ne pouvez pas revenir en arrière (bouton retour désactivé)

---

## 🔄 Créer de Nouveaux Comptes

### Pour créer un nouveau propriétaire :
1. Allez sur l'écran Splash
2. Cliquez sur "Sign Up"
3. Remplissez le formulaire propriétaire
4. Vérifiez votre email
5. Connectez-vous

### Pour créer un nouveau vétérinaire :
1. Allez sur l'écran Splash
2. Cliquez sur "Sign Up"
3. Cliquez sur "Vous êtes vétérinaire ?"
4. Remplissez le formulaire vétérinaire (10 champs)
5. Attendez l'approbation d'un admin
6. Connectez-vous après approbation

### Pour créer un nouvel admin :
⚠️ Les comptes admin ne peuvent pas être créés via l'interface. Ils doivent être créés :
- Manuellement dans Firebase Console
- Via un script d'initialisation
- En changeant le rôle d'un utilisateur existant dans Firestore

---

## 🛠️ Changer le Rôle d'un Utilisateur

Si vous devez changer le rôle d'un utilisateur manuellement dans Firestore :

1. Ouvrez Firebase Console
2. Allez dans Firestore Database
3. Naviguez vers la collection `users`
4. Trouvez le document utilisateur
5. Modifiez le champ `role` :
   - `owner` - Propriétaire d'animaux
   - `vet` - Vétérinaire
   - `admin` - Administrateur
6. Sauvegardez les modifications

---

## 📱 Interfaces par Rôle

### Propriétaire (Owner)
- 🏠 Home - Dashboard principal
- ➕ Add - Ajouter un animal
- 🔍 Search - Urgence et carte des vétérinaires
- 👤 Profile - Profil et animaux

### Vétérinaire (Vet)
- 🏠 Home - Dashboard vétérinaire
- 📅 Appointments - Rendez-vous
- 🐾 Patients - Liste des patients
- 👤 Profile - Profil professionnel

### Administrateur (Admin)
- 🏠 Home - Dashboard admin
- 👥 Users - Gestion des utilisateurs
- 🩺 Vets - Approbation des vétérinaires
- 📊 Analytics - Statistiques de la plateforme

---

## 🔒 Sécurité

- ✅ Les mots de passe sont hashés dans Firebase Auth
- ✅ Email de vérification requis pour les nouveaux comptes
- ✅ Les vétérinaires nécessitent une approbation admin
- ✅ La déconnexion efface complètement la session
- ✅ Impossible de revenir aux écrans authentifiés après déconnexion

---

## ❓ Problèmes Courants

### "Je ne peux pas me déconnecter"
✅ **Résolu** - Les boutons de déconnexion ont été corrigés avec `navigation.reset()`

### "Le compte admin ne fonctionne pas"
Vérifiez que le compte existe dans Firestore avec `role: 'admin'`

### "Je suis bloqué après la déconnexion"
Rafraîchissez l'application ou redémarrez-la

### "Le compte vétérinaire ne peut pas se connecter"
Vérifiez que le vétérinaire a été approuvé par un admin (`approved: true` dans Firestore)

---

## 📝 Notes Importantes

1. **Comptes Démo** : Les comptes listés ci-dessus sont des comptes de démonstration avec des données factices.

2. **Production** : En production, assurez-vous de :
   - Changer tous les mots de passe par défaut
   - Désactiver ou supprimer les comptes démo
   - Configurer des règles de sécurité strictes dans Firestore

3. **Approbation Vétérinaire** : Les nouveaux vétérinaires doivent être approuvés manuellement par un admin via l'interface AdminVetsScreen.

---

## 🚀 Démarrage Rapide

```bash
# 1. Démarrer l'application
npm start

# 2. Se connecter en tant qu'admin
Email: admin@petcare.com
Password: admin123

# 3. Tester la déconnexion
Profile → Se déconnecter → Confirmer
```

---

**Dernière mise à jour** : Décembre 2024  
**Problème de déconnexion** : ✅ Résolu






