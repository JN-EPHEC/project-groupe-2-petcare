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
    console.log("💳 PaymentProcessingScreen mounted");
    console.log("👤 User:", user?.id);

    // Si pas d'utilisateur après 10 secondes, on redirige vers login
    const timeoutId = setTimeout(() => {
      if (!user && !hasNavigated) {
        console.log("⏱️ Timeout - redirection vers Login");
        setHasNavigated(true);
        
        // Nettoyer le flag de paiement
        if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
          localStorage.removeItem('payment_processed_session');
        }
        
        navigation.replace('Login');
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [user, navigation, hasNavigated]);

  useEffect(() => {
    if (!user?.id || hasNavigated) {
      if (!user?.id) {
        console.log("⏳ En attente de l'authentification...");
      }
      return;
    }

    console.log("✅ Utilisateur authentifié:", user.id);
    console.log("🔍 Vérification de la subscription...");

    // Écouter les changements de subscription
    const subscriptionsRef = collection(db, 'customers', user.id, 'subscriptions');
    const q = query(subscriptionsRef, where('status', 'in', ['trialing', 'active']));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCheckCount(prev => prev + 1);
      
      if (!snapshot.empty && !hasNavigated) {
        const sub = snapshot.docs[0].data();
        console.log("🎉 Subscription trouvée!", sub.status);
        
        // Marquer qu'on va naviguer
        setHasNavigated(true);
        
        // Nettoyer le flag de paiement en cours
        if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
          localStorage.removeItem('payment_processed_session');
          console.log("🧹 Flag de paiement nettoyé");
        }
        
        // Attendre un peu pour être sûr que isPremium est mis à jour
        setTimeout(() => {
          console.log("📍 Navigation vers PremiumSuccess");
          navigation.replace('PremiumSuccess');
        }, 500);
      } else if (snapshot.empty && !hasNavigated) {
        console.log("⏳ Pas encore de subscription active... (tentative", checkCount + 1, ")");
        
        // Si après 15 secondes toujours pas de subscription, rediriger vers Premium
        if (checkCount > 30) { // 30 checks = ~15 secondes
          console.log("⚠️ Timeout - redirection vers MainTabs");
          setHasNavigated(true);
          
          // Nettoyer le flag de paiement
          if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
            localStorage.removeItem('payment_processed_session');
          }
          
          navigation.replace('MainTabs');
        }
      }
    });

    return () => unsubscribe();
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

