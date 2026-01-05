import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';

interface NotificationConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const NotificationConsentModal: React.FC<NotificationConsentModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={64} color={colors.teal} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Activer les notifications</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Ne manquez jamais un moment important avec vos compagnons
            </Text>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="alarm" size={24} color={colors.teal} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Rappels importants</Text>
                  <Text style={styles.benefitDescription}>
                    Vaccins, vermifuges et soins à ne pas oublier
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="calendar" size={24} color={colors.teal} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Rendez-vous vétérinaire</Text>
                  <Text style={styles.benefitDescription}>
                    Alertes 24h avant vos consultations
                  </Text>
                </View>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="heart" size={24} color={colors.teal} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Santé et bien-être</Text>
                  <Text style={styles.benefitDescription}>
                    Conseils personnalisés pour vos animaux
                  </Text>
                </View>
              </View>
            </View>

            {/* Privacy note */}
            <View style={styles.privacyNote}>
              <Ionicons name="lock-closed" size={16} color={colors.gray} />
              <Text style={styles.privacyText}>
                Vos données restent privées. Vous pouvez désactiver les notifications à tout moment dans les paramètres.
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={onAccept}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                <Text style={styles.acceptButtonText}>Activer les notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineButton}
                onPress={onDecline}
                activeOpacity={0.8}
              >
                <Text style={styles.declineButtonText}>Plus tard</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  scrollContent: {
    padding: spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  benefitsContainer: {
    marginBottom: spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  benefitDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    lineHeight: 20,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    lineHeight: 18,
  },
  buttonsContainer: {
    gap: spacing.md,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  acceptButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  declineButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  declineButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
  },
});

