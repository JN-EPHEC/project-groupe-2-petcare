# Guide d'Inscription Vétérinaire 🏥

## Structure du Formulaire d'Inscription

L'écran d'inscription vétérinaire (`VetSignupScreen`) contient **3 sections principales** qu'il faut **scroller pour voir** :

---

## 📋 Section 1 : Informations Personnelles

```
┌─────────────────────────────────────┐
│  👤 Informations personnelles       │
├─────────────────────────────────────┤
│  [Prénom]        [Nom]              │
│  [Email professionnel]              │
│  [Téléphone]                        │
│  [Ville / Région]                   │
└─────────────────────────────────────┘
```

**Champs :**
- ✅ Prénom
- ✅ Nom
- ✅ Email professionnel
- ✅ Téléphone
- ✅ Ville / Région

---

## 🏥 Section 2 : Informations Professionnelles

```
┌─────────────────────────────────────┐
│  💼 Informations professionnelles   │
├─────────────────────────────────────┤
│  [Spécialité]                       │
│  [Nom de la clinique]               │
│  [Adresse de la clinique]           │
│  [Années d'expérience]              │
│  [Numéro de licence (optionnel)]    │
└─────────────────────────────────────┘
```

**Champs :**
- ✅ Spécialité (ex: Médecine générale, Chirurgie...)
- ✅ Nom de la clinique
- ✅ Adresse de la clinique
- ✅ Années d'expérience
- ⭕ Numéro de licence (optionnel)

---

## 🔒 Section 3 : Sécurité (MOT DE PASSE)

```
┌─────────────────────────────────────┐
│  🔒 Sécurité - Créez votre mot     │
│     de passe                        │
├─────────────────────────────────────┤
│  [Mot de passe (min. 8 caractères)]│
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  Force: ■■■□□ (Moyen)              │
│                                     │
│  [Confirmer le mot de passe]       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ S'inscrire en tant que      │   │
│  │ vétérinaire                 │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**⚠️ IMPORTANT : Cette section est EN BAS du formulaire**

**Champs :**
- ✅ Mot de passe (minimum 8 caractères)
- ✅ Indicateur de force du mot de passe
- ✅ Confirmation du mot de passe

---

## 🎯 Comment voir les champs de mot de passe ?

### Sur Mobile / Tablette
1. ✅ Remplir les informations personnelles
2. ✅ Remplir les informations professionnelles
3. **📲 SCROLLER VERS LE BAS** (très important !)
4. ✅ Vous verrez la section **"🔒 Sécurité - Créez votre mot de passe"**
5. ✅ Entrer votre mot de passe
6. ✅ Confirmer votre mot de passe

### Sur Web
1. ✅ Utiliser la **molette de la souris** ou **barre de défilement**
2. ✅ Descendre jusqu'à la section **"🔒 Sécurité"**
3. ✅ Entrer les mots de passe

---

## 🔐 Règles du Mot de Passe

### Validations
- ✅ **Minimum 8 caractères**
- ✅ **Obligatoire**
- ✅ **Doit être confirmé** (les 2 mots de passe doivent correspondre)

### Indicateur de Force
L'application affiche un **indicateur visuel** de la force du mot de passe :

```
Faible    : ■□□□□ (rouge)
Moyen     : ■■■□□ (orange)
Fort      : ■■■■■ (vert)
```

**Critères pour un mot de passe fort :**
- Au moins 12 caractères
- Mélange de majuscules et minuscules
- Au moins 1 chiffre
- Au moins 1 caractère spécial (!@#$%^&*)

---

## ✅ Processus Complet d'Inscription

```
1. Ouvrir l'écran d'inscription vétérinaire
   ↓
2. Remplir "Informations personnelles"
   ↓
3. Remplir "Informations professionnelles"
   ↓
4. SCROLLER VERS LE BAS 📲
   ↓
5. Voir la section "🔒 Sécurité"
   ↓
6. Entrer le mot de passe
   ↓
7. Confirmer le mot de passe
   ↓
8. Cliquer sur "S'inscrire en tant que vétérinaire"
   ↓
9. Email de vérification envoyé ✅
   ↓
10. Vérifier votre email
   ↓
11. Cliquer sur le lien dans l'email
   ↓
12. Se connecter avec email + mot de passe ✅
```

---

## 🆘 Problèmes Fréquents

### "Je ne vois pas les champs de mot de passe"
**Solution :** Scrollez vers le bas ! Ils sont à la fin du formulaire dans la section "🔒 Sécurité".

### "Le bouton S'inscrire est désactivé"
**Causes possibles :**
- Tous les champs obligatoires ne sont pas remplis
- Le mot de passe est trop court (< 8 caractères)
- Les mots de passe ne correspondent pas

**Solution :** Vérifiez tous les champs avec une icône rouge (erreur).

### "J'ai oublié mon mot de passe"
**Solution :** Sur l'écran de connexion, cliquez sur "Mot de passe oublié ?" pour recevoir un email de réinitialisation.

### "Le mot de passe ne correspond pas"
**Solution :** Retapez le mot de passe dans le champ "Confirmer le mot de passe" en vous assurant qu'il est exactement identique.

---

## 📝 Ordre des Champs (de haut en bas)

1. ← Bouton retour
2. 🏥 **Titre** : "Inscription Vétérinaire"
3. 📧 **Info** : "Vous recevrez un email de vérification"

4. 👤 **Section 1 : Informations personnelles**
   - Prénom
   - Nom
   - Email professionnel
   - Téléphone
   - Ville / Région

5. 💼 **Section 2 : Informations professionnelles**
   - Spécialité
   - Nom de la clinique
   - Adresse de la clinique
   - Années d'expérience
   - Numéro de licence

6. 🔒 **Section 3 : Sécurité** ⬅️ **SCROLLER ICI !**
   - **Mot de passe**
   - Indicateur de force
   - **Confirmer le mot de passe**

7. 🔵 **Bouton** : "S'inscrire en tant que vétérinaire"

8. 🔗 **Lien** : "Déjà un compte ? Se connecter"

---

## 🎨 Améliorations Visuelles Récentes

### Section Sécurité mise en évidence
La section mot de passe a maintenant :
- 🔒 **Icône de bouclier** pour attirer l'attention
- 🎨 **Fond bleu clair** pour la distinguer
- 📝 **Titre explicite** : "🔒 Sécurité - Créez votre mot de passe"
- 📏 **Indication** : "min. 8 caractères"

Cela la rend **beaucoup plus visible** quand vous scrollez !

---

## 💡 Conseils

### Pour un mot de passe fort
```
❌ Mauvais : password123
❌ Mauvais : azerty
❌ Mauvais : 12345678

✅ Bon : MonClinic2024!
✅ Bon : Vet@SecurePass99
✅ Bon : MedecineBelge#2024
```

### Pour ne pas oublier votre mot de passe
1. Utilisez un gestionnaire de mots de passe
2. Notez-le dans un endroit sûr
3. Utilisez une phrase facile à retenir mais difficile à deviner

---

## 📞 Support

Si vous rencontrez toujours des problèmes :
1. Vérifiez que vous avez bien scrollé jusqu'en bas du formulaire
2. Vérifiez que tous les champs obligatoires sont remplis
3. Vérifiez que le mot de passe a au moins 8 caractères
4. Vérifiez que les deux mots de passe correspondent

---

**Note :** Les champs de mot de passe sont bien présents dans le formulaire, ils sont simplement à la fin. N'oubliez pas de scroller ! 📲




