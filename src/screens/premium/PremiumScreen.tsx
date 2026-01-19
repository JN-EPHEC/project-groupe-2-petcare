import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, onSnapshot, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PRICING_PLANS, PricingPlan } from '../../config/stripe';

interface PremiumScreenProps {
  navigation: any;
}

export const PremiumScreen: React.FC<PremiumScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS[1]); // Trimestriel par défaut

  // Écouter les changements de subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscriptionsRef = collection(db, 'customers', user.id, 'subscriptions');
    const q = query(subscriptionsRef, where('status', 'in', ['trialing', 'active']));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const sub = snapshot.docs[0].data();
        const newSubscription = { id: snapshot.docs[0].id, ...sub };
        setCurrentSubscription(newSubscription);
        
        console.log('📊 Subscription active détectée:', sub.status);
      } else {
        setCurrentSubscription(null);
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
      console.log('📝 Création de la session checkout avec le plan:', selectedPlan.name);
      console.log('💰 Price ID:', selectedPlan.priceId);

      // Créer le document checkout_session
      // L'extension Firebase détectera ce document et créera la session Stripe
      const checkoutSessionRef = await addDoc(
        collection(db, 'customers', user.id, 'checkout_sessions'),
        {
          price: selectedPlan.priceId,
          success_url: Platform.OS === 'web' ? `${window.location.origin}?stripe_payment_success=true` : 'petcare://payment-processing',
          cancel_url: Platform.OS === 'web' ? `${window.location.origin}?stripe_payment_canceled=true` : 'petcare://premium',
          mode: 'subscription',
          allow_promotion_codes: true,
          locale: 'fr',
          metadata: {
            userId: user.id,
            userEmail: user.email,
            plan: selectedPlan.id,
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
   * Afficher le modal d'annulation
   */
  const handleCancelClick = () => {
    console.log('🗑️ Clic sur annuler l\'abonnement');
    console.log('📋 currentSubscription:', currentSubscription);
    console.log('📋 currentSubscription?.id:', currentSubscription?.id);
    
    if (!currentSubscription?.id) {
      console.log('❌ Pas de subscription ID, retour');
      if (Platform.OS === 'web') {
        window.alert('Aucun abonnement actif trouvé');
      } else {
        Alert.alert('Erreur', 'Aucun abonnement actif trouvé');
      }
      return;
    }
    
    console.log('✅ Affichage du modal d\'annulation');
    setShowCancelModal(true);
  };

  /**
   * Créer un lien vers le Customer Portal Stripe
   */
  const createPortalLink = async () => {
    if (!user?.id) return;

    setIsCanceling(true);
    try {
      console.log('🔗 Création du lien Customer Portal...');
      
      // Créer un document dans checkout_sessions pour obtenir le lien du portail
      const portalSessionRef = await addDoc(
        collection(db, 'customers', user.id, 'checkout_sessions'),
        {
          mode: 'portal',
          returnUrl: Platform.OS === 'web' ? window.location.href : 'petcare://premium',
        }
      );

      console.log('✅ Document portal créé:', portalSessionRef.id);

      // Écouter les mises à jour pour obtenir l'URL du portail
      const unsubscribe = onSnapshot(portalSessionRef, (snap) => {
        const data = snap.data();
        console.log('📊 État portal:', data);

        if (data?.error) {
          console.error('❌ Erreur portal:', data.error);
          setIsCanceling(false);
          setShowCancelModal(false);
          if (Platform.OS === 'web') {
            window.alert('Erreur : ' + data.error.message);
          } else {
            Alert.alert('Erreur', data.error.message);
          }
          unsubscribe();
          return;
        }

        if (data?.url) {
          console.log('🔗 URL Customer Portal:', data.url);
          setIsCanceling(false);
          setShowCancelModal(false);
          
          // Rediriger vers le Customer Portal Stripe
          if (Platform.OS === 'web') {
            window.location.href = data.url;
          } else {
            Linking.openURL(data.url).catch((err) => {
              console.error('Erreur ouverture URL:', err);
              Alert.alert('Erreur', 'Impossible d\'ouvrir le portail de gestion');
            });
          }
          
          unsubscribe();
        }
      });

      // Timeout après 30 secondes
      setTimeout(() => {
        unsubscribe();
        if (isCanceling) {
          setIsCanceling(false);
          setShowCancelModal(false);
          if (Platform.OS === 'web') {
            window.alert('Timeout : La création du lien a pris trop de temps');
          } else {
            Alert.alert('Timeout', 'La création du lien a pris trop de temps');
          }
        }
      }, 30000);

    } catch (error: any) {
      console.error('❌ Erreur création portal:', error);
      setIsCanceling(false);
      setShowCancelModal(false);
      
      if (Platform.OS === 'web') {
        window.alert('Erreur : Impossible d\'accéder au portail de gestion');
      } else {
        Alert.alert('Erreur', 'Impossible d\'accéder au portail de gestion');
      }
    }
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
    
    // Trouver le plan correspondant à la subscription
    const subscribedPlan = PRICING_PLANS.find(
      plan => currentSubscription.items?.[0]?.price?.id === plan.priceId
    ) || PRICING_PLANS[0]; // Fallback sur le plan mensuel
    
    return (
      <>
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
              <Text style={styles.subscriptionValue}>{subscribedPlan.price}/{subscribedPlan.period}</Text>
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

          <TouchableOpacity 
            onPress={handleCancelClick}
            style={styles.cancelButton}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Gérer mon abonnement</Text>
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

      {/* Modal de confirmation d'annulation - EN DEHORS de ScrollView */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !isCanceling && setShowCancelModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalIcon}>
              <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
            </View>
            
              <Text style={styles.modalTitle}>Gérer l'abonnement</Text>
              <Text style={styles.modalMessage}>
                Vous allez être redirigé vers le portail de gestion Stripe où vous pourrez annuler votre abonnement, mettre à jour votre carte de paiement et consulter votre historique de factures.
              </Text>
            
            <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowCancelModal(false)}
                  disabled={isCanceling}
                >
                  <Text style={styles.modalCancelText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={createPortalLink}
                  disabled={isCanceling}
                >
                  {isCanceling ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.modalConfirmText}>Continuer</Text>
                  )}
                </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      </>
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
        <Text style={styles.subtitle}>Choisissez le plan qui vous convient</Text>
      </View>

      {/* Pricing Plans */}
      <View style={styles.pricingSection}>
        {PRICING_PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.pricingCard,
              selectedPlan.id === plan.id && styles.pricingCardSelected,
              plan.popular && styles.pricingCardPopular,
            ]}
            onPress={() => setSelectedPlan(plan)}
            activeOpacity={0.8}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>POPULAIRE</Text>
              </View>
            )}
            
            <View style={styles.pricingHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              {plan.savings && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>{plan.savings}</Text>
                </View>
              )}
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>{plan.price}</Text>
              <Text style={styles.pricePeriod}>/ {plan.period}</Text>
            </View>

            <Text style={styles.billingPeriod}>{plan.billingPeriod}</Text>

            <View style={styles.checkmark}>
              {selectedPlan.id === plan.id && (
                <Ionicons name="checkmark-circle" size={28} color={colors.teal} />
              )}
            </View>
          </TouchableOpacity>
        ))}
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
  // Pricing Section
  pricingSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  pricingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.lightGray,
    position: 'relative',
  },
  pricingCardSelected: {
    borderColor: colors.teal,
    backgroundColor: '#E0F7F4',
  },
  pricingCardPopular: {
    borderColor: '#FFB300',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FFB300',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  popularText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  savingsBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  savingsText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  priceAmount: {
    fontSize: 42,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  pricePeriod: {
    fontSize: typography.fontSize.lg,
    color: colors.gray,
    marginLeft: spacing.xs,
  },
  billingPeriod: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
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
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.fontSize.sm,
    color: colors.red,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: typography.fontWeight.semiBold,
  },
  // Styles pour le modal d'annulation
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.lightGray,
  },
  modalCancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
  },
  modalConfirmButton: {
    backgroundColor: '#FF6B6B',
  },
  modalConfirmText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
});

