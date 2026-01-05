import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface CookiePolicyScreenProps {
  navigation: any;
}

export const CookiePolicyScreen: React.FC<CookiePolicyScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Politique des cookies</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Ionicons name="shield" size={48} color={colors.teal} />
          <Text style={styles.introTitle}>Qu'est-ce qu'un cookie ?</Text>
          <Text style={styles.introText}>
            Un cookie est un petit fichier texte stocké sur votre appareil lors de votre utilisation 
            de PetCare+. Les cookies nous aident à améliorer votre expérience et à assurer le bon 
            fonctionnement de l'application.
          </Text>
          <Text style={styles.lastUpdate}>Dernière mise à jour : 04 janvier 2026</Text>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.quickActionsTitle}>Gérer vos préférences</Text>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('CookieSettings')}
          >
            <Ionicons name="settings" size={24} color={colors.white} />
            <Text style={styles.quickActionButtonText}>Accéder aux paramètres</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Types de cookies utilisés</Text>
          <Text style={styles.paragraph}>
            PetCare+ utilise différents types de cookies pour différentes finalités :
          </Text>

          {/* Cookie essentiel */}
          <View style={[styles.cookieCard, styles.cookieCardEssential]}>
            <View style={styles.cookieHeader}>
              <View style={styles.cookieIconContainer}>
                <Ionicons name="shield" size={24} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cookieTitle}>Cookies essentiels</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>REQUIS - NON MODIFIABLE</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cookieDescription}>
              Ces cookies sont strictement nécessaires au fonctionnement de l'application. 
              Sans eux, certaines fonctionnalités de base ne pourraient pas fonctionner.
            </Text>
            <View style={styles.cookieDetails}>
              <Text style={styles.cookieDetailsTitle}>Finalités :</Text>
              <Text style={styles.cookieDetailsItem}>• Authentification et gestion de session</Text>
              <Text style={styles.cookieDetailsItem}>• Sécurité et protection CSRF</Text>
              <Text style={styles.cookieDetailsItem}>• Préférences de langue</Text>
              <Text style={styles.cookieDetailsItem}>• Fonctionnement de base de l'application</Text>
            </View>
            <View style={styles.cookieDetails}>
              <Text style={styles.cookieDetailsTitle}>Exemples de cookies :</Text>
              <Text style={styles.cookieDetailsItem}>• session_token (durée : session)</Text>
              <Text style={styles.cookieDetailsItem}>• auth_token (durée : 30 jours)</Text>
              <Text style={styles.cookieDetailsItem}>• language_preference (durée : 1 an)</Text>
            </View>
          </View>

          {/* Cookie analytique */}
          <View style={styles.cookieCard}>
            <View style={styles.cookieHeader}>
              <View style={styles.cookieIconContainer}>
                <Ionicons name="analytics" size={24} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cookieTitle}>Cookies analytiques</Text>
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalText}>OPTIONNEL</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cookieDescription}>
              Ces cookies nous permettent de comprendre comment vous utilisez l'application 
              pour améliorer nos services et corriger les bugs.
            </Text>
            <View style={styles.cookieDetails}>
              <Text style={styles.cookieDetailsTitle}>Finalités :</Text>
              <Text style={styles.cookieDetailsItem}>• Analyse des pages visitées</Text>
              <Text style={styles.cookieDetailsItem}>• Mesure de la durée des sessions</Text>
              <Text style={styles.cookieDetailsItem}>• Détection et correction de bugs</Text>
              <Text style={styles.cookieDetailsItem}>• Amélioration de l'expérience utilisateur</Text>
            </View>
            <View style={styles.cookieDetails}>
              <Text style={styles.cookieDetailsTitle}>Services tiers :</Text>
              <Text style={styles.cookieDetailsItem}>• Google Analytics (optionnel)</Text>
              <Text style={styles.cookieDetailsItem}>• Firebase Analytics</Text>
            </View>
            <View style={styles.cookieDetails}>
              <Text style={styles.cookieDetailsTitle}>Durée de conservation :</Text>
              <Text style={styles.cookieDetailsItem}>• 2 ans maximum</Text>
            </View>
          </View>

          {/* Cookie personnalisation */}
          <View style={styles.cookieCard}>
            <View style={styles.cookieHeader}>
              <View style={styles.cookieIconContainer}>
                <Ionicons name="person" size={24} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cookieTitle}>Cookies de personnalisation</Text>
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalText}>OPTIONNEL</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cookieDescription}>
              Ces cookies mémorisent vos préférences et personnalisent votre expérience 
              selon vos habitudes d'utilisation.
            </Text>
            <View style={styles.cookieDetails}>
              <Text style={styles.cookieDetailsTitle}>Finalités :</Text>
              <Text style={styles.cookieDetailsItem}>• Recommandations personnalisées</Text>
              <Text style={styles.cookieDetailsItem}>• Suggestions de contenu adapté</Text>
              <Text style={styles.cookieDetailsItem}>• Préférences d'affichage</Text>
              <Text style={styles.cookieDetailsItem}>• Historique de navigation</Text>
            </View>
            <View style={styles.cookieDetails}>
              <Text style={styles.cookieDetailsTitle}>Durée de conservation :</Text>
              <Text style={styles.cookieDetailsItem}>• 1 an maximum</Text>
            </View>
          </View>

          {/* Cookie marketing */}
          <View style={styles.cookieCard}>
            <View style={styles.cookieHeader}>
              <View style={styles.cookieIconContainer}>
                <Ionicons name="megaphone" size={24} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cookieTitle}>Cookies marketing</Text>
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalText}>OPTIONNEL</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cookieDescription}>
              Ces cookies permettent de vous proposer des offres pertinentes et de mesurer 
              l'efficacité de nos campagnes marketing.
            </Text>
            <View style={styles.cookieDetails}>
              <Text style={styles.cookieDetailsTitle}>Finalités :</Text>
              <Text style={styles.cookieDetailsItem}>• Publicités ciblées</Text>
              <Text style={styles.cookieDetailsItem}>• Promotions personnalisées</Text>
              <Text style={styles.cookieDetailsItem}>• Mesure de performance des campagnes</Text>
              <Text style={styles.cookieDetailsItem}>• Retargeting publicitaire</Text>
            </View>
            <View style={styles.cookieDetails}>
              <Text style={styles.cookieDetailsTitle}>Services tiers :</Text>
              <Text style={styles.cookieDetailsItem}>• Partenaires publicitaires (avec votre consentement)</Text>
            </View>
            <View style={styles.cookieDetails}>
              <Text style={styles.cookieDetailsTitle}>Durée de conservation :</Text>
              <Text style={styles.cookieDetailsItem}>• 13 mois maximum</Text>
            </View>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Gestion de vos cookies</Text>
          <Text style={styles.paragraph}>
            Vous avez un contrôle total sur les cookies que nous utilisons :
          </Text>

          <View style={styles.managementCard}>
            <Ionicons name="checkmark-circle" size={32} color={colors.teal} />
            <Text style={styles.managementTitle}>Lors de votre première visite</Text>
            <Text style={styles.managementText}>
              Nous vous demandons votre consentement pour les cookies optionnels via une bannière 
              d'information. Vous pouvez accepter tous les cookies, les personnaliser, ou refuser 
              les cookies optionnels.
            </Text>
          </View>

          <View style={styles.managementCard}>
            <Ionicons name="settings" size={32} color={colors.teal} />
            <Text style={styles.managementTitle}>À tout moment</Text>
            <Text style={styles.managementText}>
              Vous pouvez modifier vos préférences à tout moment dans les paramètres de votre compte, 
              section "Gestion des cookies".
            </Text>
          </View>

          <View style={styles.managementCard}>
            <Ionicons name="refresh" size={32} color={colors.teal} />
            <Text style={styles.managementTitle}>Révocation du consentement</Text>
            <Text style={styles.managementText}>
              Vous pouvez retirer votre consentement à tout moment. Cela n'affectera pas la licéité 
              du traitement effectué avant le retrait du consentement.
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Cookies tiers</Text>
          <Text style={styles.paragraph}>
            Certains cookies sont déposés par des services tiers que nous utilisons :
          </Text>

          <View style={styles.thirdPartyCard}>
            <Ionicons name="logo-google" size={32} color="#4285F4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.thirdPartyTitle}>Google / Firebase</Text>
              <Text style={styles.thirdPartyText}>
                Pour l'authentification, l'hébergement et l'analyse
              </Text>
              <TouchableOpacity style={styles.policyLink}>
                <Text style={styles.policyLinkText}>Politique de confidentialité →</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.thirdPartyCard}>
            <Ionicons name="card" size={32} color="#635BFF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.thirdPartyTitle}>Stripe</Text>
              <Text style={styles.thirdPartyText}>
                Pour le traitement sécurisé des paiements (Premium)
              </Text>
              <TouchableOpacity style={styles.policyLink}>
                <Text style={styles.policyLinkText}>Politique de confidentialité →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Durée de conservation</Text>
          <Text style={styles.paragraph}>
            Les cookies ont des durées de vie différentes selon leur finalité :
          </Text>

          <View style={styles.durationTable}>
            <View style={styles.durationRow}>
              <Text style={styles.durationLabel}>Cookies de session</Text>
              <Text style={styles.durationValue}>Jusqu'à la fermeture du navigateur</Text>
            </View>
            <View style={styles.durationRow}>
              <Text style={styles.durationLabel}>Cookies essentiels</Text>
              <Text style={styles.durationValue}>30 jours à 1 an</Text>
            </View>
            <View style={styles.durationRow}>
              <Text style={styles.durationLabel}>Cookies analytiques</Text>
              <Text style={styles.durationValue}>Jusqu'à 2 ans</Text>
            </View>
            <View style={styles.durationRow}>
              <Text style={styles.durationLabel}>Cookies marketing</Text>
              <Text style={styles.durationValue}>Jusqu'à 13 mois</Text>
            </View>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Blocage des cookies</Text>
          <Text style={styles.paragraph}>
            Vous pouvez également bloquer les cookies directement via votre navigateur ou appareil :
          </Text>
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={24} color={colors.red} />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Attention</Text>
              <Text style={styles.warningText}>
                Le blocage de tous les cookies peut empêcher le bon fonctionnement de l'application 
                et vous ne pourrez plus vous connecter.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.contactCard}>
          <Ionicons name="help-circle" size={32} color={colors.teal} />
          <Text style={styles.contactTitle}>Questions sur les cookies ?</Text>
          <Text style={styles.contactText}>
            Pour toute question concernant notre utilisation des cookies :
          </Text>
          <View style={styles.contactInfo}>
            <Ionicons name="mail-outline" size={20} color={colors.navy} />
            <Text style={styles.contactEmail}>cookies@petcare.be</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Cette politique des cookies peut être mise à jour pour refléter les changements dans 
            notre utilisation des cookies. La date de dernière mise à jour figure en haut de cette page.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  introCard: {
    backgroundColor: `${colors.teal}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  introTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  introText: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    textAlign: 'center',
    lineHeight: 24,
  },
  lastUpdate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  quickActionsCard: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  quickActionsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  quickActionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
    flex: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  paragraph: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  cookieCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cookieCardEssential: {
    borderWidth: 2,
    borderColor: colors.teal,
  },
  cookieHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cookieIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cookieTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  requiredBadge: {
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  requiredText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  optionalBadge: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  optionalText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  cookieDescription: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  cookieDetails: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cookieDetailsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  cookieDetailsItem: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
    marginBottom: 2,
  },
  managementCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: 'center',
  },
  managementTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  managementText: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    textAlign: 'center',
    lineHeight: 22,
  },
  thirdPartyCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  thirdPartyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  thirdPartyText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  policyLink: {
    alignSelf: 'flex-start',
  },
  policyLinkText: {
    fontSize: typography.fontSize.sm,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  durationTable: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.white,
  },
  durationLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  durationValue: {
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  warningCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#FFF5F5',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.red,
  },
  warningTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.red,
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: `${colors.teal}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  contactTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  contactText: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  contactEmail: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  footer: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    textAlign: 'center',
    lineHeight: 20,
  },
});



