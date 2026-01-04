# 💳 Guide Premium & Paiement Stripe

## ✅ Fonctionnalités implémentées

### 1. **Bouton "+" modifié**
- **Ancien comportement** : Ajouter un animal
- **Nouveau comportement** : Ouvrir la page Premium
- **Design** : Carte dorée avec icône étoile ⭐

### 2. **Page Premium améliorée**
- Liste des fonctionnalités premium
- Prix clairement affiché (9,99 € / mois)
- Bouton "S'abonner maintenant" avec animation
- Design moderne et attractif

### 3. **Modal de paiement Stripe (Simulation)**
- Interface style Stripe officiel
- Logo Stripe intégré
- Champs de carte :
  - Numéro de carte (4242 4242 4242 4242 pour test)
  - Date d'expiration (MM/AA)
  - CVV (123 pour test)
- Indicateur de chargement pendant le traitement
- Message "Paiement 100% sécurisé par Stripe" 🔒

### 4. **Simulation de paiement**
- Délai de 2 secondes pour simuler l'API Stripe
- Mise à jour de Firestore avec :
  - `isPremium: true`
  - `premiumSince: date actuelle`
  - `subscriptionType: 'monthly'`
- Message de succès avec animation

### 5. **Modal de succès**
- Animation de succès ✅
- Message de bienvenue
- Bouton "Commencer" qui ramène au profil

### 6. **Bouton de déconnexion corrigé**
- Modal de confirmation élégant (au lieu de Alert.alert)
- Compatible web + mobile
- Déconnexion propre avec navigation.reset()

---

## 🧪 Tester l'abonnement Premium

### **Étape 1 : Connexion**
```
Email : admin / admin123
Ou n'importe quel compte owner
```

### **Étape 2 : Accéder au Premium**
1. Allez sur votre profil propriétaire
2. Scrollez jusqu'à la section "Mes Compagnons"
3. Cliquez sur le bouton **"⭐ Premium"** (carte dorée)

### **Étape 3 : S'abonner**
1. Cliquez sur **"S'abonner maintenant"**
2. Remplissez le formulaire avec les données de test :
   - **Carte** : `4242 4242 4242 4242`
   - **Expiration** : `12/25` (ou toute date future)
   - **CVV** : `123`
3. Cliquez sur **"Payer 9,99 €"**

### **Étape 4 : Confirmation**
- Attendez 2 secondes (simulation)
- Modal de succès s'affiche 🎉
- Cliquez sur **"✨ Commencer"**

### **Étape 5 : Vérification**
Vérifiez dans Firebase Console que l'utilisateur a maintenant :
```json
{
  "isPremium": true,
  "premiumSince": "2025-12-14T...",
  "subscriptionType": "monthly"
}
```

---

## 🔧 Structure technique

### **Fichiers modifiés**

#### 1. `/src/screens/profile/OwnerProfileScreen.tsx`
- Bouton "+" → Navigation vers Premium
- Style `addPremiumCardSmall` doré
- Modal de déconnexion personnalisé

#### 2. `/src/screens/premium/PremiumScreen.tsx`
- États pour les modals (payment, success)
- Fonction `simulateStripePayment()`
- Interface Stripe UI complète
- Mise à jour Firestore directe

#### 3. `/src/services/firebaseAuth.ts`
- Interface `FirebaseUserData` :
  - `isPremium?: boolean`
  - `premiumSince?: string`
  - `subscriptionType?: 'monthly' | 'yearly'`

#### 4. `/src/context/AuthContext.tsx`
- Interface `User` mise à jour avec champs premium

---

## 💡 Comment intégrer le vrai Stripe

Pour passer de la simulation au vrai Stripe :

### **1. Installer les dépendances**
```bash
npm install @stripe/stripe-react-native
```

### **2. Créer un backend Stripe**
Vous aurez besoin d'un serveur (Node.js/Firebase Functions) pour :
- Créer un `PaymentIntent`
- Gérer les webhooks Stripe
- Mettre à jour Firestore après confirmation

### **3. Remplacer `simulateStripePayment()`**
```typescript
const handleRealStripePayment = async () => {
  // 1. Créer PaymentIntent via votre backend
  const response = await fetch('https://your-api.com/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ amount: 999, currency: 'eur' })
  });
  const { clientSecret } = await response.json();
  
  // 2. Confirmer avec Stripe SDK
  const { error, paymentIntent } = await confirmPayment(clientSecret, {
    paymentMethodType: 'Card',
  });
  
  if (error) {
    alert('Paiement échoué');
  } else {
    // 3. Mettre à jour Firestore
    await updateDoc(doc(db, 'users', user.id), {
      isPremium: true,
      premiumSince: new Date().toISOString(),
      subscriptionType: 'monthly',
    });
    setShowSuccessModal(true);
  }
};
```

### **4. Configurer les webhooks Stripe**
Pour gérer les renouvellements, annulations, etc.

---

## 🎨 Design et UX

### **Couleurs Premium**
- Or principal : `#FFB300`
- Background or clair : `#FFF8E1`
- Stripe violet : `#635BFF`
- Succès : `colors.success` (vert)

### **Animations**
- Modal slide pour le paiement
- Modal fade pour le succès
- Shadow et elevation pour profondeur
- ActivityIndicator pendant le traitement

### **Responsive**
- Max width 450px pour le modal de paiement
- Max width 400px pour le modal de succès
- Padding adaptatif

---

## 📊 Données utilisateur Premium

### **Champs Firestore ajoutés**
```typescript
{
  isPremium: boolean,           // true si abonné
  premiumSince: string,         // ISO date de début
  subscriptionType: string,     // 'monthly' ou 'yearly'
}
```

### **Utilisation dans l'app**
```typescript
// Vérifier si premium
if (user?.isPremium) {
  // Débloquer fonctionnalités
}

// Afficher depuis quand
const premiumDuration = calculateDuration(user?.premiumSince);
```

---

## ✅ Checklist de déploiement

- [x] Bouton "+" redirige vers Premium
- [x] Page Premium avec bouton d'abonnement
- [x] Modal de paiement Stripe UI
- [x] Simulation de paiement (2s delay)
- [x] Mise à jour Firestore avec statut premium
- [x] Modal de succès avec confirmation
- [x] Interface User étendue avec champs premium
- [x] Bouton de déconnexion corrigé (modal au lieu de Alert)
- [ ] Backend Stripe (pour production)
- [ ] Webhooks Stripe (pour production)
- [ ] Gestion des abonnements récurrents (pour production)
- [ ] Annulation d'abonnement (pour production)

---

## 🚀 Prêt à tester !

1. **Rechargez l'app** : `r` dans le terminal Expo
2. **Connectez-vous** comme propriétaire
3. **Scrollez** jusqu'à "Mes Compagnons"
4. **Cliquez** sur le bouton ⭐ **Premium**
5. **Testez** le flux de paiement complet

**Note** : Pour l'instant c'est une simulation. Le vrai Stripe nécessite un backend et un compte Stripe configuré.

---

## 🎉 Résultat

L'utilisateur peut maintenant :
- ✅ Découvrir les fonctionnalités premium
- ✅ Simuler un paiement Stripe
- ✅ Devenir premium instantanément
- ✅ Voir son statut premium dans Firestore

**Tout fonctionne directement dans l'app, sans scripts externes !**





