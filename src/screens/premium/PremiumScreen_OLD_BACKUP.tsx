import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { createSubscription } from '../../services/firestoreService';

interface PremiumScreenProps {
  navigation: any;
}

export const PremiumScreen: React.FC<PremiumScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const simulateStripePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv) {
      alert('Veuillez remplir tous les champs de paiement');
      return;
    }

    console.log('💳 Simulation paiement Stripe...');
    setIsProcessing(true);

    try {
      // Simulation d'un délai de traitement Stripe
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (user?.id && user?.email) {
        const now = new Date();
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1); // +1 mois pour monthly

        // 1. Créer l'abonnement dans la collection subscriptions
        const subscriptionId = await createSubscription({
          userId: user.id,
          userEmail: user.email,
          status: 'active',
          plan: 'monthly',
          amount: 9.99,
          currency: 'EUR',
          stripeCustomerId: `cus_demo_${user.id}`,
          stripeSubscriptionId: `sub_demo_${Date.now()}`,
          stripePaymentIntentId: `pi_demo_${Date.now()}`,
          startDate: now.toISOString(),
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: periodEnd.toISOString(),
          cancelAtPeriodEnd: false,
          createdAt: null as any,
          updatedAt: null as any,
        });

        // 2. Mettre à jour le statut premium de l'utilisateur
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          isPremium: true,
          premiumSince: now.toISOString(),
          subscriptionType: 'monthly',
          activeSubscriptionId: subscriptionId,
        });

        console.log('✅ Utilisateur mis à niveau vers Premium');
        console.log('✅ Abonnement créé:', subscriptionId);
      }

      setShowSuccessModal(true);

      // Réinitialiser les champs
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
    } catch (error) {
      console.error('❌ Erreur paiement:', error);
      alert('Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
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
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
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

        {/* Payment Form */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Informations de paiement</Text>
          <Text style={styles.sectionSubtitle}>Paiement sécurisé via Stripe</Text>

          <View style={styles.paymentForm}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Numéro de carte</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card" size={20} color={colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Date d'expiration</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar" size={20} color={colors.gray} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="MM/AA"
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color={colors.gray} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={20} color={colors.teal} />
              <Text style={styles.securityText}>
                Paiement 100% sécurisé • Annulation à tout moment
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title={isProcessing ? "Traitement en cours..." : "Souscrire à Premium"}
            onPress={simulateStripePayment}
            variant="primary"
            loading={isProcessing}
            disabled={isProcessing}
            style={styles.subscribeButton}
          />
          
          <Text style={styles.disclaimer}>
            En souscrivant, vous acceptez nos conditions d'utilisation. L'abonnement se renouvelle automatiquement chaque mois.
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Bienvenue dans Premium ! 🎉</Text>
            <Text style={styles.successMessage}>
              Vous avez maintenant accès à toutes les fonctionnalités exclusives de PetCare+
            </Text>
            
            <Button
              title="Découvrir Premium"
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}
              variant="primary"
              style={styles.successButton}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.lg,
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
  paymentForm: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  securityText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
  },
  footer: {
    paddingHorizontal: spacing.xl,
  },
  subscribeButton: {
    marginBottom: spacing.md,
  },
  disclaimer: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  successButton: {
    width: '100%',
  },
});
