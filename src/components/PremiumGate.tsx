import React, { useState, ReactNode } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius } from '../theme';
import { PremiumBadge } from './PremiumBadge';

interface PremiumGateProps {
  children: ReactNode;
  featureName?: string;
  navigation?: any;
  fallback?: ReactNode;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({ 
  children, 
  featureName = 'cette fonctionnalité',
  navigation,
  fallback
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Si l'utilisateur est premium, afficher le contenu
  if (user?.isPremium) {
    return <>{children}</>;
  }

  // Sinon, afficher le fallback ou déclencher le modal
  const handlePress = () => {
    setShowModal(true);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.lockedContainer}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {fallback || (
          <View style={styles.lockedContent}>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={40} color="#FFB300" />
            </View>
            <Text style={styles.lockedTitle}>Fonctionnalité Premium</Text>
            <Text style={styles.lockedText}>
              {featureName} est réservée aux membres Premium
            </Text>
            <View style={styles.unlockButton}>
              <Ionicons name="star" size={20} color={colors.white} />
              <Text style={styles.unlockButtonText}>Débloquer</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={28} color={colors.gray} />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <PremiumBadge size="large" />
              <Text style={styles.modalTitle}>Passez à Premium</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>
                Débloquez toutes les fonctionnalités premium pour profiter pleinement de PetCare+
              </Text>

              <View style={styles.featuresList}>
                <FeatureItem 
                  icon="share-social" 
                  title="Partage du carnet" 
                  description="Partagez les infos de vos animaux avec famille et vétérinaires"
                />
                <FeatureItem 
                  icon="trending-up" 
                  title="Suivi bien-être" 
                  description="Graphiques et alertes pour le poids, l'activité et l'alimentation"
                />
                <FeatureItem 
                  icon="book" 
                  title="Blog éducatif" 
                  description="Conseils d'experts pour gérer les urgences et comprendre votre animal"
                />
                <FeatureItem 
                  icon="medical" 
                  title="Vétérinaires premium" 
                  description="Accès prioritaire aux meilleurs vétérinaires partenaires"
                />
              </View>

              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>À partir de</Text>
                <Text style={styles.price}>9,99 €</Text>
                <Text style={styles.priceNote}>par mois, sans engagement</Text>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={() => {
                setShowModal(false);
                if (navigation) {
                  navigation.navigate('Premium');
                }
              }}
            >
              <Ionicons name="star" size={24} color={colors.white} />
              <Text style={styles.subscribeButtonText}>S'abonner maintenant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const FeatureItem: React.FC<{ icon: string; title: string; description: string }> = ({ 
  icon, 
  title, 
  description 
}) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon as any} size={24} color="#FFB300" />
    </View>
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  lockedContainer: {
    flex: 1,
  },
  lockedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF0',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: '#FFE4A3',
    borderStyle: 'dashed',
  },
  lockIcon: {
    marginBottom: spacing.lg,
  },
  lockedTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  lockedText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB300',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  unlockButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
  },
  modalDescription: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  featuresList: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    lineHeight: 20,
  },
  priceSection: {
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  priceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  price: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFB300',
    marginVertical: spacing.xs,
  },
  priceNote: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    fontStyle: 'italic',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB300',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  subscribeButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});




