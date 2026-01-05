import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface ManageSubscriptionScreenProps {
  navigation: any;
}

interface SubscriptionData {
  id: string;
  status: string;
  current_period_end: any;
  cancel_at_period_end: boolean;
  price?: any;
}

export const ManageSubscriptionScreen: React.FC<ManageSubscriptionScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, [user?.id]);

  const loadSubscription = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const subsRef = collection(db, 'customers', user.id, 'subscriptions');
      const q = query(
        subsRef,
        where('status', 'in', ['active', 'trialing']),
        orderBy('created', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const subData = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        } as SubscriptionData;
        setSubscription(subData);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      // Créer un lien vers le portail client Stripe
      const portalUrl = `https://billing.stripe.com/p/login/test_YOUR_PORTAL_ID`;
      
      Alert.alert(
        'Gestion de l\'abonnement',
        'Vous allez être redirigé vers le portail de gestion Stripe où vous pourrez modifier votre abonnement, mettre à jour vos moyens de paiement, ou résilier.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Ouvrir',
            onPress: async () => {
              const supported = await Linking.canOpenURL(portalUrl);
              if (supported) {
                await Linking.openURL(portalUrl);
              } else {
                Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error opening portal:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir le portail de gestion');
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gérer mon abonnement</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {subscription ? (
          <>
            {/* Statut de l'abonnement */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Ionicons name="star" size={32} color="#FFB300" />
                <Text style={styles.statusTitle}>Abonnement Premium</Text>
              </View>
              
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={styles.statusText}>Actif</Text>
              </View>

              <View style={styles.statusDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={20} color={colors.gray} />
                  <Text style={styles.detailLabel}>Date de renouvellement</Text>
                </View>
                <Text style={styles.detailValue}>
                  {formatDate(subscription.current_period_end)}
                </Text>
              </View>

              {subscription.cancel_at_period_end && (
                <View style={styles.warningBanner}>
                  <Ionicons name="alert-circle" size={20} color={colors.warning} />
                  <Text style={styles.warningText}>
                    Votre abonnement prendra fin à la date de renouvellement
                  </Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actionsCard}>
              <Text style={styles.sectionTitle}>Actions</Text>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={openCustomerPortal}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="card" size={24} color={colors.teal} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Moyens de paiement</Text>
                  <Text style={styles.actionSubtitle}>
                    Gérer vos cartes et moyens de paiement
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={openCustomerPortal}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="receipt" size={24} color={colors.teal} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Historique des paiements</Text>
                  <Text style={styles.actionSubtitle}>
                    Consulter vos factures et reçus
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={openCustomerPortal}
              >
                <View style={[styles.actionIcon, styles.dangerIcon]}>
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, styles.dangerText]}>
                    Résilier l'abonnement
                  </Text>
                  <Text style={styles.actionSubtitle}>
                    Annuler le renouvellement automatique
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray} />
              </TouchableOpacity>
            </View>

            {/* Avantages Premium */}
            <View style={styles.benefitsCard}>
              <Text style={styles.sectionTitle}>Vos avantages Premium</Text>
              
              <BenefitItem icon="share-social" text="Partage illimité du carnet de santé" />
              <BenefitItem icon="trending-up" text="Suivi de poids avancé avec graphiques" />
              <BenefitItem icon="book" text="Blog éducatif exclusif" />
              <BenefitItem icon="chatbubbles" text="Support prioritaire" />
              <BenefitItem icon="analytics" text="Statistiques détaillées" />
              <BenefitItem icon="download" text="Ressources téléchargeables" />
            </View>
          </>
        ) : (
          <View style={styles.noSubscriptionCard}>
            <Ionicons name="star-outline" size={64} color={colors.gray} />
            <Text style={styles.noSubscriptionTitle}>Aucun abonnement actif</Text>
            <Text style={styles.noSubscriptionText}>
              Vous n'avez pas d'abonnement Premium actif. Passez à Premium pour débloquer toutes les fonctionnalités !
            </Text>
            <TouchableOpacity
              style={styles.upgradButton}
              onPress={() => navigation.navigate('Premium')}
            >
              <Ionicons name="star" size={20} color={colors.white} />
              <Text style={styles.upgradeButtonText}>Passer à Premium</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const BenefitItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.benefitItem}>
    <View style={styles.benefitIcon}>
      <Ionicons name={icon as any} size={20} color={colors.teal} />
    </View>
    <Text style={styles.benefitText}>{text}</Text>
    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  header: {
    backgroundColor: colors.navy,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statusTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.success,
  },
  statusDetails: {
    backgroundColor: colors.lightBlue,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  detailValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warning + '20',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.warning,
  },
  actionsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerIcon: {
    backgroundColor: colors.error + '20',
  },
  dangerText: {
    color: colors.error,
  },
  benefitsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.navy,
  },
  noSubscriptionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  noSubscriptionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  noSubscriptionText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  upgradButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  upgradeButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});




