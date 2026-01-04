import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, onSnapshot, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface PremiumScreenProps {
  navigation: any;
}

export const PremiumScreen: React.FC<PremiumScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  // Écouter les changements de subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscriptionsRef = collection(db, 'customers', user.id, 'subscriptions');
    const q = query(subscriptionsRef, where('status', 'in', ['trialing', 'active']));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const sub = snapshot.docs[0].data();
        setCurrentSubscription({ id: snapshot.docs[0].id, ...sub });
        
        // Mettre à jour le statut premium de l'utilisateur
        const userRef = doc(db, 'users', user.id);
        updateDoc(userRef, {
          isPremium: true,
          premiumSince: sub.created?.toDate?.() || new Date(),
          subscriptionType: 'monthly',
          activeSubscriptionId: snapshot.docs[0].id,
        }).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  /**
   * Créer une session Checkout Stripe
   * L'extension Firebase écoutera ce document et créera la session Stripe
   */
  const createCheckoutSession = async () => {
    if (!user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour souscrire');
      return;
    }

    setIsProcessing(true);

    try {
      // ID du prix Stripe pour l'abonnement PetCare+ Premium (€9.99/mois)
      const STRIPE_PRICE_ID = 'price_1SlHt3Pl02UR2jNdElawIfY9'; // ✅ ID configuré

      console.log('📝 Création de la session checkout...');

      // Créer le document checkout_session
      // L'extension Firebase détectera ce document et créera la session Stripe
      const checkoutSessionRef = await addDoc(
        collection(db, 'customers', user.id, 'checkout_sessions'),
        {
          price: STRIPE_PRICE_ID,
          success_url: Platform.OS === 'web' ? window.location.origin : 'petcare://success',
          cancel_url: Platform.OS === 'web' ? window.location.origin : 'petcare://cancel',
          mode: 'subscription',
          allow_promotion_codes: true,
          locale: 'fr',
          metadata: {
            userId: user.id,
            userEmail: user.email,
          },
        }
      );

      console.log('✅ Session checkout créée:', checkoutSessionRef.id);

      // Écouter les mises à jour de la session
      const unsubscribe = onSnapshot(checkoutSessionRef, (snap) => {
        const data = snap.data();
        console.log('📊 État de la session:', data);

        if (data?.error) {
          console.error('❌ Erreur Stripe:', data.error);
          Alert.alert('Erreur', data.error.message);
          setIsProcessing(false);
          unsubscribe();
          return;
        }

        if (data?.url) {
          console.log('🔗 URL Checkout Stripe:', data.url);
          
          // Rediriger vers Stripe Checkout
          if (Platform.OS === 'web') {
            window.location.href = data.url;
          } else {
            Linking.openURL(data.url).catch((err) => {
              console.error('Erreur ouverture URL:', err);
              Alert.alert('Erreur', 'Impossible d\'ouvrir Stripe Checkout');
            });
          }
          
          unsubscribe();
          setIsProcessing(false);
        }
      });

      // Timeout après 30 secondes
      setTimeout(() => {
        unsubscribe();
        if (isProcessing) {
          setIsProcessing(false);
          Alert.alert('Timeout', 'La création de la session a pris trop de temps. Veuillez réessayer.');
        }
      }, 30000);

    } catch (error: any) {
      console.error('❌ Erreur création session:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer la session de paiement');
      setIsProcessing(false);
    }
  };

  /**
   * Annuler l'abonnement
   */
  const cancelSubscription = async () => {
    if (!currentSubscription?.id) return;

    Alert.alert(
      'Annuler l\'abonnement',
      'Êtes-vous sûr de vouloir annuler votre abonnement Premium ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              const subscriptionRef = doc(db, 'customers', user!.id, 'subscriptions', currentSubscription.id);
              await updateDoc(subscriptionRef, {
                cancel_at_period_end: true,
              });
              Alert.alert('Succès', 'Votre abonnement sera annulé à la fin de la période en cours.');
            } catch (error) {
              console.error('Erreur annulation:', error);
              Alert.alert('Erreur', 'Impossible d\'annuler l\'abonnement');
            }
          },
        },
      ]
    );
  };

  const features = [
    {
      icon: 'fitness',
      title: 'Suivi Bien-être Complet',
      description: 'Tableau de bord avancé avec graphiques',
      color: '#4CAF50',
    },
    {
      icon: 'book',
      title: 'Blog Exclusif',
      description: 'Conseils vétérinaires personnalisés',
      color: '#2196F3',
    },
    {
      icon: 'share-social',
      title: 'Partage Sécurisé',
      description: 'Partagez les infos avec votre véto',
      color: '#9C27B0',
    },
    {
      icon: 'cloud-upload',
      title: 'Stockage Illimité',
      description: 'Tous vos documents en un seul endroit',
      color: '#FF9800',
    },
    {
      icon: 'notifications',
      title: 'Rappels Intelligents',
      description: 'Notifications personnalisées',
      color: '#F44336',
    },
    {
      icon: 'headset',
      title: 'Support Prioritaire',
      description: 'Assistance dédiée 7j/7',
      color: '#00BCD4',
    },
  ];

  // Si l'utilisateur est déjà premium
  if (user?.isPremium && currentSubscription) {
    const periodEnd = currentSubscription.current_period_end?.toDate?.();
    
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.starContainer}>
            <Ionicons name="star" size={60} color="#FFB300" />
          </View>
          <Text style={styles.title}>Vous êtes Premium ! 🎉</Text>
          <Text style={styles.subtitle}>Profitez de toutes les fonctionnalités exclusives</Text>
        </View>

        <View style={styles.subscriptionCard}>
          <Text style={styles.subscriptionTitle}>Votre abonnement</Text>
          <View style={styles.subscriptionDetails}>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Statut</Text>
              <Text style={[styles.subscriptionValue, { color: '#4CAF50' }]}>
                {currentSubscription.status === 'active' ? 'Actif' : 'En essai'}
              </Text>
            </View>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Plan</Text>
              <Text style={styles.subscriptionValue}>€9.99/mois</Text>
            </View>
            {periodEnd && (
              <View style={styles.subscriptionRow}>
                <Text style={styles.subscriptionLabel}>Renouvellement</Text>
                <Text style={styles.subscriptionValue}>
                  {periodEnd.toLocaleDateString('fr-FR')}
                </Text>
              </View>
            )}
          </View>

          {currentSubscription.stripeLink && (
            <Button
              title="Gérer mon abonnement"
              onPress={() => Linking.openURL(currentSubscription.stripeLink)}
              variant="secondary"
              style={styles.manageButton}
            />
          )}

          <TouchableOpacity onPress={cancelSubscription}>
            <Text style={styles.cancelText}>Annuler l'abonnement</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Vos avantages Premium :</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <Ionicons name={feature.icon as any} size={24} color={colors.white} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color={colors.navy} />
      </TouchableOpacity>

      {/* Header Premium */}
      <View style={styles.header}>
        <View style={styles.starContainer}>
          <Ionicons name="star" size={60} color="#FFB300" />
        </View>
        <Text style={styles.title}>Passez à Premium</Text>
        <Text style={styles.subtitle}>Débloquez toutes les fonctionnalités</Text>
        
        <View style={styles.priceCard}>
          <Text style={styles.priceAmount}>€9.99</Text>
          <Text style={styles.pricePeriod}>/ mois</Text>
        </View>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Ce que vous obtenez :</Text>
        
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <Ionicons name={feature.icon as any} size={24} color={colors.white} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Payment Section */}
      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Paiement sécurisé</Text>
        <Text style={styles.sectionSubtitle}>Via Stripe • Annulation à tout moment</Text>

        <View style={styles.testCardInfo}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <View style={styles.testCardTextContainer}>
            <Text style={styles.testCardTitle}>Mode Test</Text>
            <Text style={styles.testCardText}>
              Utilisez la carte : <Text style={styles.testCardNumber}>4242 4242 4242 4242</Text>
            </Text>
            <Text style={styles.testCardText}>
              Date : N'importe quelle date future • CVC : 123
            </Text>
          </View>
        </View>

        <Button
          title={isProcessing ? "Ouverture de Stripe..." : "Procéder au paiement"}
          onPress={createCheckoutSession}
          variant="primary"
          loading={isProcessing}
          disabled={isProcessing}
          style={styles.subscribeButton}
        />
        
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color={colors.teal} />
          <Text style={styles.securityText}>
            Paiement 100% sécurisé • SSL • PCI-DSS compliant
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          En souscrivant, vous acceptez nos conditions d'utilisation. L'abonnement se renouvelle automatiquement chaque mois.
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  starContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#667eea',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  pricePeriod: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    marginLeft: spacing.sm,
  },
  featuresSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    textAlign: 'center',
  },
  paymentSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  testCardInfo: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  testCardTextContainer: {
    flex: 1,
  },
  testCardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: '#1976D2',
    marginBottom: spacing.xs,
  },
  testCardText: {
    fontSize: typography.fontSize.xs,
    color: '#1976D2',
    marginBottom: spacing.xs / 2,
  },
  testCardNumber: {
    fontWeight: typography.fontWeight.bold,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  subscribeButton: {
    marginBottom: spacing.md,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  securityText: {
    fontSize: typography.fontSize.xs,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  disclaimer: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: spacing.xxl * 2,
  },
  subscriptionCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  subscriptionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  subscriptionDetails: {
    marginBottom: spacing.lg,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  subscriptionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  subscriptionValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  manageButton: {
    marginBottom: spacing.sm,
  },
  cancelText: {
    fontSize: typography.fontSize.sm,
    color: colors.red,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

