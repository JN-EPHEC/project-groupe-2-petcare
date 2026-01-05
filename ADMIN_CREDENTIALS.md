# 🔐 Identifiants Administrateur - PetCare+

## 📧 Compte Admin Configuré

### Adresse Email Réelle:
- **Email complet**: `soumia.ettouilpro@gmail.com`
- **Mot de passe**: `admin`
- **Rôle**: Administrateur

---

## ⚡ Connexion Rapide

Vous pouvez vous connecter de **2 façons** :

### Option 1: Connexion Rapide avec "admin"
Tapez simplement :
- **Email**: `admin`
- **Mot de passe**: `admin`

Le système convertira automatiquement "admin" en `soumia.ettouilpro@gmail.com`

### Option 2: Email Complet
- **Email**: `soumia.ettouilpro@gmail.com`
- **Mot de passe**: `admin`

**Les deux fonctionnent ! Utilisez celle que vous préférez.** ✨

---

## 🚀 Créer le Compte

### Étape 1: Exécuter le Script
```bash
node scripts/createAdminAccount.js
```

### Étape 2: Résultat Attendu
```
🎉 COMPTE ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !

📧 Informations de connexion:
   Email: soumia.ettouilpro@gmail.com
   Mot de passe: admin
   Rôle: Administrateur
```

### Étape 3: Se Connecter dans l'App
1. Ouvrez PetCare+
2. Écran de connexion
3. Tapez:
   - Email: **admin** (ou l'email complet)
   - Mot de passe: **admin**
4. ✅ Vous êtes connecté en tant qu'admin !

---

## 🎯 Avantages

✅ **Email reconnu**: Votre vraie adresse professionnelle  
✅ **Connexion rapide**: Tapez juste "admin" au lieu de l'email complet  
✅ **Bouton démo**: Le bouton "Admin" pré-remplit avec "admin" / "admin"  
✅ **Flexible**: Les deux méthodes fonctionnent  

---

## 📱 Bouton Démo

Sur l'écran de connexion, vous verrez 3 boutons:
- 🟦 **Admin** → Remplit automatiquement avec "admin" / "admin"
- 🟦 **Owner** → Compte propriétaire démo
- 🟦 **Vet** → Compte vétérinaire démo

Cliquez sur "Admin" pour une connexion ultra-rapide !

---

## 🔒 Sécurité

⚠️ **Important:**
1. **Changez le mot de passe** après la première connexion
2. L'email `soumia.ettouilpro@gmail.com` doit être **vérifiable** (Firebase peut envoyer des emails de vérification)
3. Ne partagez pas ces identifiants

---

## 🔄 Modifier l'Email Admin

Si vous voulez changer l'adresse email admin plus tard:

1. **Ouvrez**: `scripts/createAdminAccount.js`
2. **Changez la ligne**:
```javascript
email: 'soumia.ettouilpro@gmail.com',  // ← Modifiez ici
```
3. **Mettez à jour aussi**: `src/screens/auth/LoginScreen.tsx` (ligne avec actualEmail)
4. **Réexécutez**: `node scripts/createAdminAccount.js`

---

## ✅ Récapitulatif

| Méthode | Email à taper | Mot de passe | Résultat |
|---------|---------------|--------------|----------|
| **Rapide** | `admin` | `admin` | ✅ Connecté |
| **Complète** | `soumia.ettouilpro@gmail.com` | `admin` | ✅ Connecté |
| **Bouton Démo** | *auto-rempli* | *auto-rempli* | ✅ Connecté |

---

## 🎉 C'est Fait !

Vous pouvez maintenant :
1. Exécuter `node scripts/createAdminAccount.js`
2. Taper juste "admin" / "admin" pour vous connecter
3. Accéder au Dashboard Administrateur

**Simple et rapide !** 🚀






