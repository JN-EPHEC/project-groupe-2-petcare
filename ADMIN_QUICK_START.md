# ⚡ Démarrage Rapide - Compte Admin

## 🚀 En 3 Étapes

### 1️⃣ Installer les Dépendances

```bash
npm install firebase-admin
```

### 2️⃣ Créer le Compte Admin

```bash
node scripts/createAdminAccount.js
```

Vous verrez:
```
🎉 COMPTE ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !

📧 Informations de connexion:
   Email: admin@petcare.com
   Mot de passe: admin
   Rôle: Administrateur
```

### 3️⃣ Se Connecter

1. Ouvrez l'application PetCare+
2. Cliquez sur "Se connecter"
3. **Email**: `admin@petcare.com`
4. **Mot de passe**: `admin`
5. ✅ Vous êtes maintenant admin !

---

## 🎯 Ce Que Vous Pouvez Faire

### Dashboard Admin
- 📊 Voir les statistiques globales
- 👥 125 utilisateurs, 15 vétérinaires, 342 animaux
- 📈 Graphiques et analytics

### Gérer les Utilisateurs
1. Allez dans l'onglet **Utilisateurs** (2ème icône en bas)
2. Vous pouvez:
   - ✅ **Promouvoir en Admin** (bouton orange)
   - ✅ **Rétrograder un Admin** (bouton violet)
   - ✅ **Approuver des Vétérinaires** (bouton vert)
   - ✅ **Supprimer des Utilisateurs** (bouton rouge)
   - 🔍 **Filtrer** par rôle
   - 🔍 **Rechercher** par nom/email

### Promouvoir un Utilisateur en Admin

**Exemple pratique:**

1. **Créez un compte test** (ou utilisez un compte existant)
   - Email: `test@example.com`
   - Inscrivez-vous normalement

2. **Connectez-vous en tant qu'admin**
   - Email: `admin@petcare.com`
   - Mot de passe: `admin`

3. **Allez dans Utilisateurs**
   - Tapez "test" dans la barre de recherche
   - Trouvez l'utilisateur `test@example.com`

4. **Cliquez sur "Promouvoir Admin"** (bouton orange avec icône bouclier)

5. **Confirmez**
   - Une alerte apparaît
   - Cliquez sur "Confirmer"

6. **Vérifiez**
   - Déconnectez-vous
   - Connectez-vous avec `test@example.com`
   - ✅ Cet utilisateur voit maintenant le Dashboard Admin !

---

## 🔐 Sécurité

⚠️ **IMPORTANT**: 
- Changez le mot de passe `admin` après la première connexion
- Ne partagez jamais vos credentials admin
- Vous ne pouvez pas supprimer votre propre compte admin (protection)

---

## 📱 Navigation Admin

```
Bottom Bar:
┌──────────┬──────────┬──────────┬──────────┐
│ 🏠 Home  │ 👥 Users │ 🩺 Vets  │ 👤 Profile│
└──────────┴──────────┴──────────┴──────────┘
```

---

## ❓ Problème ?

### Le script échoue
```bash
# Réinstallez les dépendances
npm install firebase-admin

# Vérifiez que le fichier credentials existe
ls petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json
```

### Impossible de se connecter
1. Vérifiez que le script s'est bien exécuté (message de succès)
2. Utilisez exactement: `admin@petcare.com` / `admin`
3. Redémarrez l'application

### Je ne vois pas le Dashboard Admin
1. Déconnectez-vous complètement
2. Reconnectez-vous avec le compte admin
3. Vérifiez dans Firebase Console que `role: "admin"`

---

## ✅ Checklist Post-Installation

- [ ] Script exécuté avec succès
- [ ] Connexion réussie avec `admin@petcare.com`
- [ ] Dashboard Admin visible
- [ ] Onglet "Utilisateurs" accessible
- [ ] Promotion d'un utilisateur test réussie
- [ ] Mot de passe changé (recommandé)

---

**C'est tout ! Vous êtes prêt ! 🎉**

Pour plus de détails, consultez `ADMIN_SETUP_GUIDE.md`





