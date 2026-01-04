# 🎯 GUIDE COMPLET : INTÉGRER STRIPE AVEC FIREBASE

## 📋 TABLE DES MATIÈRES
1. [Prérequis](#prérequis)
2. [Étape 1 : Créer un compte Stripe](#étape-1--créer-un-compte-stripe)
3. [Étape 2 : Installer l'extension Firebase Stripe](#étape-2--installer-lextension-firebase-stripe)
4. [Étape 3 : Configurer l'extension](#étape-3--configurer-lextension)
5. [Étape 4 : Créer les produits Stripe](#étape-4--créer-les-produits-stripe)
6. [Étape 5 : Tester avec la carte de test](#étape-5--tester-avec-la-carte-de-test)
7. [Structure Firestore](#structure-firestore)
8. [Code Frontend](#code-frontend)

---

## ✅ PRÉREQUIS

- ✅ Firebase CLI installé
- ✅ Projet Firebase actif
- ✅ Firestore activé
- ✅ Firebase Authentication activé
- ✅ Plan Blaze (facturation activée) - **OBLIGATOIRE pour les extensions**

---

## 📝 ÉTAPE 1 : CRÉER UN COMPTE STRIPE

### 1.1 Aller sur Stripe
```
https://stripe.com/
```

### 1.2 Créer un compte
- Cliquez sur "Sign up"
- Remplissez les informations
- **Mode Test** est automatiquement activé 👍

### 1.3 Récupérer les clés API
```
Dashboard Stripe → Developers → API keys
```

Vous aurez besoin de :
- ✅ **Publishable key** (commence par `pk_test_...`)
- ✅ **Secret key** (commence par `sk_test_...`)
- ✅ **Webhook signing secret** (on le créera plus tard)

---

## 🔌 ÉTAPE 2 : INSTALLER L'EXTENSION FIREBASE STRIPE

### Option A : Via Firebase Console (RECOMMANDÉ)

1. **Aller sur Firebase Console**
   ```
   https://console.firebase.google.com/project/petcare-2a317/extensions
   ```

2. **Cliquer sur "Extensions"** (menu de gauche)

3. **Rechercher "Run Payments with Stripe"**
   - Extension officielle par Firebase
   - Icône violet/bleu Stripe

4. **Cliquer sur "Install in Console"**

5. **Suivre l'assistant d'installation**

---

### Option B : Via Firebase CLI

```bash
cd /Users/nabiltouil/Documents/Soumiya/PetCare+

# Installer l'extension
firebase ext:install stripe/firestore-stripe-payments --project=petcare-2a317
```

---

## ⚙️ ÉTAPE 3 : CONFIGURER L'EXTENSION

L'assistant vous demandera plusieurs paramètres :

### 3.1 Paramètres de base

| Paramètre | Valeur recommandée | Description |
|-----------|-------------------|-------------|
| **Products and pricing plans collection** | `products` | Collection Firestore pour les produits |
| **Customer details and subscriptions collection** | `customers` | Collection Firestore pour les customers |
| **Stripe API key with restricted access** | `sk_test_...` | Votre clé secrète Stripe (mode test) |
| **Subscription status to write** | `active,canceled,past_due` | Statuts à synchroniser |
| **Delete Stripe customer objects** | `No` | Garder les données Stripe |
| **Sync new users to Stripe customers** | `Sync` | Créer auto les customers |
| **Automatic tax calculation** | `Do not use` | Pas de calcul automatique |

### 3.2 Webhooks Stripe (Important!)

Après l'installation, Firebase vous donnera une URL de webhook :
```
https://us-central1-petcare-2a317.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents
```

**CONFIGURER LE WEBHOOK DANS STRIPE :**

1. Aller sur Stripe Dashboard
2. **Developers → Webhooks**
3. **Add endpoint**
4. Entrer l'URL du webhook Firebase
5. Sélectionner les événements :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
6. Cliquer sur "Add endpoint"
7. **COPIER LE SIGNING SECRET** (`whsec_...`)

### 3.3 Ajouter le Webhook Secret dans Firebase

```bash
firebase ext:configure stripe/firestore-stripe-payments --project=petcare-2a317
```

Ou via Firebase Console → Extensions → Stripe → Manage → Reconfigure

Ajouter le **Webhook signing secret** : `whsec_...`

---

## 📦 ÉTAPE 4 : CRÉER LES PRODUITS STRIPE

### Option A : Via Stripe Dashboard (RECOMMANDÉ)

1. **Aller sur Stripe Dashboard**
   ```
   https://dashboard.stripe.com/test/products
   ```

2. **Cliquer sur "Add Product"**

3. **Créer le produit Premium**
   ```
   Name: PetCare+ Premium
   Description: Abonnement premium avec toutes les fonctionnalités
   
   Pricing:
   - Model: Recurring
   - Price: €9.99
   - Billing period: Monthly
   - Currency: EUR
   ```

4. **Créer le prix**
   - Cliquez sur "Add another price" si besoin (annuel, etc.)

5. **Copier l'ID du prix**
   - Format : `price_xxxxxxxxxxxxx`
   - ⚠️ **GARDEZ CET ID, IL SERA UTILISÉ DANS LE CODE**

### Option B : Via Firestore (Synchronisé avec Stripe)

Firebase peut créer les produits directement depuis Firestore :

1. **Aller sur Firestore dans Firebase Console**

2. **Créer une collection `products`**

3. **Ajouter un document avec l'ID `premium`**
   ```json
   {
     "active": true,
     "name": "PetCare+ Premium",
     "description": "Abonnement premium avec toutes les fonctionnalités",
     "role": "premium",
     "images": ["https://your-image-url.com/premium.png"],
     "metadata": {
       "firebaseRole": "premium"
     }
   }
   ```

4. **Créer une sous-collection `prices`**
   - Dans le document `premium`, créer une sous-collection `prices`
   - Ajouter un document (ID auto) :
   ```json
   {
     "active": true,
     "currency": "eur",
     "unit_amount": 999,
     "recurring": {
       "interval": "month",
       "interval_count": 1
     },
     "type": "recurring",
     "tax_behavior": "unspecified"
   }
   ```

5. **L'extension créera automatiquement le produit dans Stripe** 🎉

---

## 🧪 ÉTAPE 5 : TESTER AVEC LA CARTE DE TEST

### 5.1 Cartes de test Stripe

**Carte valide (succès) :**
```
Numéro : 4242 4242 4242 4242
Date : N'importe quelle date future (ex: 12/25)
CVC : N'importe quel 3 chiffres (ex: 123)
Code postal : N'importe quel code
```

**Autres cartes de test :**
- ❌ Paiement refusé : `4000 0000 0000 0002`
- ⚠️ 3D Secure requis : `4000 0027 6000 3184`
- ⏳ Paiement lent : `4000 0000 0000 0341`

### 5.2 Mode Test vs Production

**Mode Test (développement) :**
- Toutes les clés commencent par `pk_test_` et `sk_test_`
- Aucun vrai argent n'est débité
- Cartes de test uniquement

**Mode Production (live) :**
- Clés commencent par `pk_live_` et `sk_live_`
- Vrais paiements
- Vraies cartes bancaires

---

## 🗄️ STRUCTURE FIRESTORE

### Collections créées automatiquement par l'extension :

```
📁 customers (collection)
  └─ {userId} (document)
      ├─ email: "user@example.com"
      ├─ stripeId: "cus_xxxxx"
      └─ 📁 checkout_sessions (sous-collection)
          └─ {sessionId}
              ├─ price: "price_xxxxx"
              ├─ success_url: "https://..."
              ├─ cancel_url: "https://..."
              ├─ mode: "subscription"
              └─ sessionId: "cs_test_xxxxx" (ajouté après création)
      └─ 📁 subscriptions (sous-collection)
          └─ {subscriptionId}
              ├─ status: "active"
              ├─ role: "premium"
              ├─ current_period_start: Timestamp
              ├─ current_period_end: Timestamp
              ├─ stripeLink: "https://dashboard.stripe.com/..."
              └─ ...

📁 products (collection)
  └─ {productId}
      ├─ active: true
      ├─ name: "PetCare+ Premium"
      ├─ description: "..."
      └─ 📁 prices (sous-collection)
          └─ {priceId}
              ├─ active: true
              ├─ currency: "eur"
              ├─ unit_amount: 999
              └─ recurring: { interval: "month" }
```

---

## 💻 CODE FRONTEND

Voir le fichier `PremiumScreen.tsx` qui a été mis à jour pour utiliser Stripe !

### Flux de paiement :

1. **Utilisateur clique sur "Passer à Premium"**
2. **Frontend crée un checkout_session dans Firestore**
   ```ts
   const checkoutSessionRef = await addDoc(
     collection(db, 'customers', userId, 'checkout_sessions'),
     {
       price: 'price_xxxxx', // ID du prix Stripe
       success_url: window.location.origin,
       cancel_url: window.location.origin,
       mode: 'subscription',
     }
   );
   ```
3. **Extension Firebase écoute et crée une session Stripe**
4. **Frontend écoute les changements et obtient l'URL**
   ```ts
   onSnapshot(checkoutSessionRef, (snap) => {
     const { sessionId } = snap.data();
     if (sessionId) {
       // Rediriger vers Stripe Checkout
       window.location.href = `https://checkout.stripe.com/...`;
     }
   });
   ```
5. **Utilisateur paie sur Stripe Checkout**
6. **Webhook déclenché → Extension met à jour Firestore**
7. **Subscription active dans `customers/{userId}/subscriptions`**
8. **Frontend détecte et met à jour l'UI** 🎉

---

## 🚀 RÉSUMÉ DES ÉTAPES

### Dans Firebase Console :
1. ✅ Activer le plan Blaze (facturation)
2. ✅ Installer l'extension "Run Payments with Stripe"
3. ✅ Configurer avec la clé secrète Stripe (`sk_test_...`)

### Dans Stripe Dashboard :
1. ✅ Créer un compte Stripe (mode test)
2. ✅ Créer le produit "PetCare+ Premium" (€9.99/mois)
3. ✅ Copier l'ID du prix (`price_xxxxx`)
4. ✅ Configurer le webhook avec l'URL Firebase
5. ✅ Copier le signing secret du webhook

### Dans le code :
1. ✅ Installer `@stripe/stripe-js`
2. ✅ Ajouter la publishable key dans `.env`
3. ✅ Modifier `PremiumScreen.tsx` pour utiliser Stripe Checkout
4. ✅ Écouter les changements de subscription

### Test :
1. ✅ Cliquer sur "Passer à Premium"
2. ✅ Entrer la carte `4242 4242 4242 4242`
3. ✅ Valider le paiement
4. ✅ Vérifier que l'utilisateur devient premium 🎉

---

## 📞 SUPPORT

**Documentation officielle :**
- Extension Stripe Firebase : https://firebase.google.com/products/extensions/firestore-stripe-payments
- Cartes de test Stripe : https://stripe.com/docs/testing
- Stripe API : https://stripe.com/docs/api

**Problèmes courants :**
- ❌ Extension ne s'installe pas → Vérifier le plan Blaze
- ❌ Webhook ne fonctionne pas → Vérifier le signing secret
- ❌ Subscription non créée → Vérifier les logs Cloud Functions
- ❌ Paiement refusé → Vérifier la carte de test

---

## ✅ CHECKLIST FINALE

Avant de présenter au prof :

- [ ] Extension Stripe installée et configurée
- [ ] Produit Premium créé dans Stripe (€9.99/mois)
- [ ] Webhook configuré et fonctionnel
- [ ] Code frontend utilise Stripe Checkout
- [ ] Test avec carte 4242 4242 4242 4242 réussi
- [ ] Utilisateur devient premium après paiement
- [ ] UI affiche clairement le statut premium
- [ ] Peut annuler l'abonnement
- [ ] Logs Firebase montrent les événements
- [ ] Dashboard Stripe montre la transaction

---

🎉 **BONNE CHANCE POUR LA PRÉSENTATION !** 🎉



