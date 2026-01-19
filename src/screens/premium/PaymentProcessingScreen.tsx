import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface PaymentProcessingScreenProps {
  navigation: any;
}

export const PaymentProcessingScreen: React.FC<PaymentProcessingScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [checkCount, setCheckCount] = useState(0);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💳 [PaymentProcessingScreen] 🚀 SCREEN MOUNTED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👤 [PaymentProcessingScreen] User ID:", user?.id);
    console.log("📧 [PaymentProcessingScreen] User Email:", user?.email);
    console.log("🏷️ [PaymentProcessingScreen] User isPremium:", user?.isPremium);
    console.log("🔄 [PaymentProcessingScreen] hasNavigated:", hasNavigated);

    // Si pas d'utilisateur après 20 secondes, on redirige vers MainTabs (pas Login!)
    // L'utilisateur devrait rester connecté après le retour de Stripe
    console.log("⏲️ [PaymentProcessingScreen] Démarrage timeout de 20 secondes...");
    const timeoutId = setTimeout(() => {
      console.log("⏱️ [PaymentProcessingScreen] TIMEOUT ATTEINT après 20 secondes");
      console.log("👤 [PaymentProcessingScreen] User à ce moment:", user?.id);
      console.log("🔄 [PaymentProcessingScreen] hasNavigated:", hasNavigated);
      
      if (!user && !hasNavigated) {
        console.log("❌ [PaymentProcessingScreen] Pas d'utilisateur - redirection vers MainTabs");
        setHasNavigated(true);
        
        // Nettoyer le flag de paiement
        if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
          console.log("🧹 [PaymentProcessingScreen] Nettoyage payment_processed_session");
          localStorage.removeItem('payment_processed_session');
        }
        
        console.log("📍 [PaymentProcessingScreen] navigation.replace('MainTabs')");
        navigation.replace('MainTabs');
      } else {
        console.log("ℹ️ [PaymentProcessingScreen] Timeout mais user existe ou déjà navigué");
      }
    }, 20000); // Augmenté à 20 secondes

    return () => {
      console.log("🧹 [PaymentProcessingScreen] Cleanup timeout");
      clearTimeout(timeoutId);
    };
  }, [user, navigation, hasNavigated]);

  useEffect(() => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔄 [PaymentProcessingScreen] useEffect subscription check");
    console.log("👤 [PaymentProcessingScreen] user?.id:", user?.id);
    console.log("🔄 [PaymentProcessingScreen] hasNavigated:", hasNavigated);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (!user?.id || hasNavigated) {
      if (!user?.id) {
        console.log("⏳ [PaymentProcessingScreen] En attente de l'authentification...");
      } else {
        console.log("⏭️ [PaymentProcessingScreen] hasNavigated=true, skip");
      }
      return;
    }

    console.log("✅ [PaymentProcessingScreen] Utilisateur authentifié:", user.id);
    console.log("🔍 [PaymentProcessingScreen] Début vérification subscription...");
    console.log("📍 [PaymentProcessingScreen] Collection path: customers/" + user.id + "/subscriptions");

    // Écouter les changements de subscription
    const subscriptionsRef = collection(db, 'customers', user.id, 'subscriptions');
    const q = query(subscriptionsRef, where('status', 'in', ['trialing', 'active']));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newCheckCount = checkCount + 1;
      setCheckCount(newCheckCount);
      
      console.log("📊 [PaymentProcessingScreen] onSnapshot callback - tentative", newCheckCount);
      console.log("📊 [PaymentProcessingScreen] snapshot.empty:", snapshot.empty);
      console.log("📊 [PaymentProcessingScreen] snapshot.size:", snapshot.size);
      
      if (!snapshot.empty && !hasNavigated) {
        const sub = snapshot.docs[0].data();
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎉 [PaymentProcessingScreen] ✅ SUBSCRIPTION TROUVÉE!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📄 [PaymentProcessingScreen] Subscription status:", sub.status);
        console.log("📄 [PaymentProcessingScreen] Subscription data:", sub);
        
        // Marquer qu'on va naviguer
        console.log("🔒 [PaymentProcessingScreen] setHasNavigated(true)");
        setHasNavigated(true);
        
        // Nettoyer le flag de paiement en cours
        if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
          localStorage.removeItem('payment_processed_session');
          console.log("🧹 [PaymentProcessingScreen] Flag de paiement nettoyé");
        }
        
        // Attendre un peu pour être sûr que isPremium est mis à jour
        console.log("⏰ [PaymentProcessingScreen] Attente 500ms avant navigation...");
        setTimeout(() => {
          console.log("📍 [PaymentProcessingScreen] 🚀 Navigation vers PremiumSuccess");
          navigation.replace('PremiumSuccess');
        }, 500);
      } else if (snapshot.empty && !hasNavigated) {
        console.log("⏳ [PaymentProcessingScreen] Pas encore de subscription active... (tentative", newCheckCount, "/60)");
        
        // Si après 30 secondes toujours pas de subscription, rediriger vers Premium avec message
        if (newCheckCount > 60) { // 60 checks = ~30 secondes
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          console.log("⚠️ [PaymentProcessingScreen] TIMEOUT - Pas de subscription après 30s");
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          setHasNavigated(true);
          
          // Nettoyer le flag de paiement
          if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
            localStorage.removeItem('payment_processed_session');
            console.log("🧹 [PaymentProcessingScreen] Flag de paiement nettoyé");
          }
          
          console.log("📍 [PaymentProcessingScreen] Redirection vers Premium via MainTabs");
          // Rediriger vers Premium pour qu'ils puissent réessayer ou voir leur statut
          navigation.replace('MainTabs', {
            screen: 'ProfileTab',
            params: {
              screen: 'Premium'
            }
          });
        }
      } else if (!snapshot.empty && hasNavigated) {
        console.log("ℹ️ [PaymentProcessingScreen] Subscription trouvée mais déjà navigué");
      }
    });

    return () => {
      console.log("🧹 [PaymentProcessingScreen] Cleanup onSnapshot listener");
      unsubscribe();
    };
  }, [user?.id, checkCount, navigation, hasNavigated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.teal} />
      <Text style={styles.title}>Traitement du paiement...</Text>
      <Text style={styles.subtitle}>
        Veuillez patienter pendant que nous confirmons votre abonnement
      </Text>
      <Text style={styles.note}>Cela peut prendre quelques secondes</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  note: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
});

