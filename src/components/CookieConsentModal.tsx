import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';

interface CookiePreferences {
  essential: boolean; // Toujours true, non modifiable
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
}

interface CookieConsentModalProps {
  visible: boolean;
  onAcceptAll: (preferences: CookiePreferences) => void;
  onAcceptSelected: (preferences: CookiePreferences) => void;
  onDecline: () => void;
}

export const CookieConsentModal: React.FC<CookieConsentModalProps> = ({
  visible,
  onAcceptAll,
  onAcceptSelected,
  onDecline,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    personalization: false,
    marketing: false,
  });

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      personalization: true,
      marketing: true,
    };
    onAcceptAll(allAccepted);
  };

  const handleAcceptSelected = () => {
    onAcceptSelected(preferences);
  };

  const handleDeclineOptional = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      personalization: false,
      marketing: false,
    };
    onDecline();
    // On pourrait aussi appeler onAcceptSelected(essentialOnly) pour sauvegarder
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Ne peut pas être désactivé
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={40} color={colors.teal} />
              </View>
              <Text style={styles.title}>Protection de vos données</Text>
              <Text style={styles.subtitle}>
                Nous respectons votre vie privée et la protection de vos données personnelles
              </Text>
            </View>

            {/* Description simple */}
            {!showDetails && (
              <View style={styles.simpleContent}>
                <Text style={styles.description}>
                  PetCare+ utilise des cookies et technologies similaires pour vous offrir la meilleure expérience possible, 
                  sécuriser votre compte et analyser l'utilisation de notre application.
                </Text>
                
                <Text style={styles.description}>
                  Les cookies essentiels sont nécessaires au fonctionnement de l'application. 
                  Les autres cookies sont optionnels et nous aident à améliorer nos services.
                </Text>

                <TouchableOpacity 
                  style={styles.detailsButton}
                  onPress={() => setShowDetails(true)}
                >
                  <Text style={styles.detailsButtonText}>En savoir plus et personnaliser</Text>
                  <Ionicons name="chevron-down" size={20} color={colors.teal} />
                </TouchableOpacity>
              </View>
            )}

            {/* Vue détaillée avec options */}
            {showDetails && (
              <View style={styles.detailsContent}>
                <TouchableOpacity 
                  style={styles.collapseButton}
                  onPress={() => setShowDetails(false)}
                >
                  <Ionicons name="chevron-up" size={20} color={colors.teal} />
                  <Text style={styles.collapseButtonText}>Masquer les détails</Text>
                </TouchableOpacity>

                {/* Cookies essentiels */}
                <View style={styles.cookieSection}>
                  <View style={styles.cookieHeader}>
                    <View style={styles.cookieTitleRow}>
                      <Ionicons name="shield" size={24} color={colors.teal} />
                      <Text style={styles.cookieTitle}>Cookies essentiels</Text>
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>REQUIS</Text>
                      </View>
                    </View>
                    <Switch
                      value={preferences.essential}
                      onValueChange={() => {}}
                      disabled={true}
                      trackColor={{ false: colors.gray, true: colors.teal }}
                      thumbColor={colors.white}
                    />
                  </View>
                  <Text style={styles.cookieDescription}>
                    Ces cookies sont nécessaires au fonctionnement de l'application. 
                    Ils permettent l'authentification, la sécurité et les fonctionnalités de base.
                  </Text>
                  <Text style={styles.cookieExamples}>
                    Exemples : session utilisateur, authentification, préférences de langue
                  </Text>
                </View>

                {/* Cookies analytiques */}
                <View style={styles.cookieSection}>
                  <View style={styles.cookieHeader}>
                    <View style={styles.cookieTitleRow}>
                      <Ionicons name="analytics" size={24} color={colors.navy} />
                      <Text style={styles.cookieTitle}>Cookies analytiques</Text>
                    </View>
                    <Switch
                      value={preferences.analytics}
                      onValueChange={() => togglePreference('analytics')}
                      trackColor={{ false: colors.gray, true: colors.teal }}
                      thumbColor={colors.white}
                    />
                  </View>
                  <Text style={styles.cookieDescription}>
                    Ces cookies nous aident à comprendre comment vous utilisez l'application 
                    pour améliorer nos services et corriger les bugs.
                  </Text>
                  <Text style={styles.cookieExamples}>
                    Exemples : pages visitées, durée de session, interactions utilisateur
                  </Text>
                </View>

                {/* Cookies de personnalisation */}
                <View style={styles.cookieSection}>
                  <View style={styles.cookieHeader}>
                    <View style={styles.cookieTitleRow}>
                      <Ionicons name="person" size={24} color={colors.navy} />
                      <Text style={styles.cookieTitle}>Cookies de personnalisation</Text>
                    </View>
                    <Switch
                      value={preferences.personalization}
                      onValueChange={() => togglePreference('personalization')}
                      trackColor={{ false: colors.gray, true: colors.teal }}
                      thumbColor={colors.white}
                    />
                  </View>
                  <Text style={styles.cookieDescription}>
                    Ces cookies permettent de mémoriser vos préférences et de personnaliser 
                    votre expérience selon vos habitudes.
                  </Text>
                  <Text style={styles.cookieExamples}>
                    Exemples : recommandations personnalisées, préférences d'affichage
                  </Text>
                </View>

                {/* Cookies marketing */}
                <View style={styles.cookieSection}>
                  <View style={styles.cookieHeader}>
                    <View style={styles.cookieTitleRow}>
                      <Ionicons name="megaphone" size={24} color={colors.navy} />
                      <Text style={styles.cookieTitle}>Cookies marketing</Text>
                    </View>
                    <Switch
                      value={preferences.marketing}
                      onValueChange={() => togglePreference('marketing')}
                      trackColor={{ false: colors.gray, true: colors.teal }}
                      thumbColor={colors.white}
                    />
                  </View>
                  <Text style={styles.cookieDescription}>
                    Ces cookies permettent de vous proposer des offres pertinentes et 
                    de mesurer l'efficacité de nos campagnes.
                  </Text>
                  <Text style={styles.cookieExamples}>
                    Exemples : publicités ciblées, promotions personnalisées
                  </Text>
                </View>

                {/* Informations RGPD */}
                <View style={styles.rgpdInfo}>
                  <Ionicons name="information-circle" size={20} color={colors.teal} />
                  <Text style={styles.rgpdText}>
                    Conformément au RGPD, vous pouvez modifier vos préférences à tout moment 
                    dans les paramètres de votre compte. Vos données sont traitées de manière 
                    sécurisée et ne sont jamais vendues à des tiers.
                  </Text>
                </View>
              </View>
            )}

            {/* Liens vers politique de confidentialité */}
            <View style={styles.linksContainer}>
              <TouchableOpacity style={styles.link}>
                <Ionicons name="document-text-outline" size={16} color={colors.teal} />
                <Text style={styles.linkText}>Politique de confidentialité</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.link}>
                <Ionicons name="shield-outline" size={16} color={colors.teal} />
                <Text style={styles.linkText}>Politique des cookies</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Boutons d'action */}
          <View style={styles.actionsContainer}>
            {showDetails && (
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={handleDeclineOptional}
              >
                <Text style={styles.declineButtonText}>Cookies essentiels uniquement</Text>
              </TouchableOpacity>
            )}
            
            {showDetails && (
              <TouchableOpacity 
                style={styles.customButton}
                onPress={handleAcceptSelected}
              >
                <Text style={styles.customButtonText}>Confirmer mes choix</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={handleAcceptAll}
            >
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
              <Text style={styles.acceptButtonText}>Tout accepter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  scrollView: {
    maxHeight: '80%',
  },
  scrollContent: {
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.teal}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    lineHeight: 22,
  },
  simpleContent: {
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    lineHeight: 24,
    marginBottom: spacing.md,
    textAlign: 'justify',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  detailsButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  detailsContent: {
    marginBottom: spacing.lg,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  collapseButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  cookieSection: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cookieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cookieTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  cookieTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  cookieDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  cookieExamples: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  rgpdInfo: {
    flexDirection: 'row',
    backgroundColor: `${colors.teal}10`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  rgpdText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    marginTop: spacing.md,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  actionsContainer: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    gap: spacing.md,
  },
  acceptButton: {
    backgroundColor: colors.teal,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  customButton: {
    backgroundColor: colors.navy,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  declineButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    color: colors.gray,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
});



