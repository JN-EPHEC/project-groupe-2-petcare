import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface PrivacyPolicyScreenProps {
  navigation: any;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Politique de confidentialité</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Ionicons name="shield-checkmark" size={48} color={colors.teal} />
          <Text style={styles.introTitle}>Votre vie privée est importante</Text>
          <Text style={styles.introText}>
            PetCare+ s'engage à protéger vos données personnelles et à respecter votre vie privée 
            conformément au Règlement Général sur la Protection des Données (RGPD).
          </Text>
          <Text style={styles.lastUpdate}>Dernière mise à jour : 04 janvier 2026</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Données collectées</Text>
          <Text style={styles.paragraph}>
            Nous collectons différents types de données pour vous fournir nos services :
          </Text>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Données d'identification</Text>
            <Text style={styles.bulletPoint}>• Nom et prénom</Text>
            <Text style={styles.bulletPoint}>• Adresse email</Text>
            <Text style={styles.bulletPoint}>• Numéro de téléphone</Text>
            <Text style={styles.bulletPoint}>• Adresse postale</Text>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Données relatives à vos animaux</Text>
            <Text style={styles.bulletPoint}>• Nom, espèce, race, âge</Text>
            <Text style={styles.bulletPoint}>• Poids et informations de santé</Text>
            <Text style={styles.bulletPoint}>• Photos et documents médicaux</Text>
            <Text style={styles.bulletPoint}>• Historique des rendez-vous</Text>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Données de connexion</Text>
            <Text style={styles.bulletPoint}>• Adresse IP</Text>
            <Text style={styles.bulletPoint}>• Type d'appareil et navigateur</Text>
            <Text style={styles.bulletPoint}>• Pages visitées et actions effectuées</Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Utilisation des données</Text>
          <Text style={styles.paragraph}>
            Vos données personnelles sont utilisées exclusivement pour :
          </Text>
          <Text style={styles.bulletPoint}>• Créer et gérer votre compte</Text>
          <Text style={styles.bulletPoint}>• Fournir nos services (gestion des animaux, rendez-vous, documents)</Text>
          <Text style={styles.bulletPoint}>• Améliorer nos services et corriger les bugs</Text>
          <Text style={styles.bulletPoint}>• Vous envoyer des notifications importantes</Text>
          <Text style={styles.bulletPoint}>• Respecter nos obligations légales</Text>
          <Text style={styles.bulletPoint}>• Prévenir la fraude et assurer la sécurité</Text>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Base légale du traitement</Text>
          <Text style={styles.paragraph}>
            Le traitement de vos données repose sur :
          </Text>
          <View style={styles.legalBasisCard}>
            <Ionicons name="checkbox" size={20} color={colors.teal} />
            <View style={{ flex: 1 }}>
              <Text style={styles.legalBasisTitle}>Exécution du contrat</Text>
              <Text style={styles.legalBasisText}>
                Pour vous fournir les services auxquels vous avez souscrit
              </Text>
            </View>
          </View>
          <View style={styles.legalBasisCard}>
            <Ionicons name="checkbox" size={20} color={colors.teal} />
            <View style={{ flex: 1 }}>
              <Text style={styles.legalBasisTitle}>Consentement</Text>
              <Text style={styles.legalBasisText}>
                Pour les cookies non essentiels et communications marketing
              </Text>
            </View>
          </View>
          <View style={styles.legalBasisCard}>
            <Ionicons name="checkbox" size={20} color={colors.teal} />
            <View style={{ flex: 1 }}>
              <Text style={styles.legalBasisTitle}>Intérêt légitime</Text>
              <Text style={styles.legalBasisText}>
                Pour améliorer nos services et prévenir la fraude
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Partage des données</Text>
          <Text style={styles.paragraph}>
            Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées uniquement avec :
          </Text>
          <View style={styles.shareCard}>
            <Ionicons name="people" size={24} color={colors.navy} />
            <View style={{ flex: 1 }}>
              <Text style={styles.shareTitle}>Vétérinaires partenaires</Text>
              <Text style={styles.shareText}>
                Uniquement les données nécessaires pour les rendez-vous et soins
              </Text>
            </View>
          </View>
          <View style={styles.shareCard}>
            <Ionicons name="cloud" size={24} color={colors.navy} />
            <View style={{ flex: 1 }}>
              <Text style={styles.shareTitle}>Fournisseurs de services</Text>
              <Text style={styles.shareText}>
                Firebase (Google) pour l'hébergement et la sécurité
              </Text>
            </View>
          </View>
          <View style={styles.shareCard}>
            <Ionicons name="card" size={24} color={colors.navy} />
            <View style={{ flex: 1 }}>
              <Text style={styles.shareTitle}>Processeurs de paiement</Text>
              <Text style={styles.shareText}>
                Stripe pour les paiements sécurisés (abonnement Premium)
              </Text>
            </View>
          </View>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Vos droits (RGPD)</Text>
          <Text style={styles.paragraph}>
            Conformément au RGPD, vous disposez des droits suivants :
          </Text>
          <View style={styles.rightCard}>
            <View style={styles.rightIconContainer}>
              <Ionicons name="eye" size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rightTitle}>Droit d'accès</Text>
              <Text style={styles.rightText}>
                Obtenir une copie de vos données personnelles
              </Text>
            </View>
          </View>
          <View style={styles.rightCard}>
            <View style={styles.rightIconContainer}>
              <Ionicons name="create" size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rightTitle}>Droit de rectification</Text>
              <Text style={styles.rightText}>
                Corriger les données inexactes ou incomplètes
              </Text>
            </View>
          </View>
          <View style={styles.rightCard}>
            <View style={styles.rightIconContainer}>
              <Ionicons name="trash" size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rightTitle}>Droit à l'effacement</Text>
              <Text style={styles.rightText}>
                Supprimer vos données dans certaines conditions
              </Text>
            </View>
          </View>
          <View style={styles.rightCard}>
            <View style={styles.rightIconContainer}>
              <Ionicons name="download" size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rightTitle}>Droit à la portabilité</Text>
              <Text style={styles.rightText}>
                Récupérer vos données dans un format structuré
              </Text>
            </View>
          </View>
          <View style={styles.rightCard}>
            <View style={styles.rightIconContainer}>
              <Ionicons name="hand-left" size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rightTitle}>Droit d'opposition</Text>
              <Text style={styles.rightText}>
                S'opposer au traitement de vos données
              </Text>
            </View>
          </View>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Conservation des données</Text>
          <Text style={styles.paragraph}>
            Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles 
            elles ont été collectées :
          </Text>
          <Text style={styles.bulletPoint}>• Compte actif : pendant toute la durée d'utilisation</Text>
          <Text style={styles.bulletPoint}>• Après suppression du compte : 30 jours (sauvegarde)</Text>
          <Text style={styles.bulletPoint}>• Données médicales : selon obligations légales (10 ans)</Text>
          <Text style={styles.bulletPoint}>• Données de facturation : 10 ans (obligations fiscales)</Text>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Sécurité</Text>
          <Text style={styles.paragraph}>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger 
            vos données :
          </Text>
          <Text style={styles.bulletPoint}>• Chiffrement des données sensibles (SSL/TLS)</Text>
          <Text style={styles.bulletPoint}>• Authentification sécurisée (Firebase Auth)</Text>
          <Text style={styles.bulletPoint}>• Sauvegardes régulières</Text>
          <Text style={styles.bulletPoint}>• Accès limité aux données par le personnel</Text>
          <Text style={styles.bulletPoint}>• Surveillance et détection des incidents</Text>
        </View>

        {/* Contact */}
        <View style={styles.contactCard}>
          <Ionicons name="mail" size={32} color={colors.teal} />
          <Text style={styles.contactTitle}>Exercer vos droits</Text>
          <Text style={styles.contactText}>
            Pour toute question ou demande concernant vos données personnelles, contactez-nous :
          </Text>
          <View style={styles.contactInfo}>
            <Ionicons name="mail-outline" size={20} color={colors.navy} />
            <Text style={styles.contactEmail}>privacy@petcare.be</Text>
          </View>
          <Text style={styles.contactNote}>
            Nous vous répondrons dans un délai d'un mois maximum.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Cette politique de confidentialité peut être mise à jour. Nous vous informerons de tout 
            changement significatif par email ou notification dans l'application.
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
    marginBottom: spacing.xl,
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
  bulletPoint: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  subsection: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  subsectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  legalBasisCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
  },
  legalBasisTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  legalBasisText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    lineHeight: 20,
  },
  shareCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  shareTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  shareText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
  },
  rightCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  rightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  rightText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    lineHeight: 18,
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
    marginBottom: spacing.sm,
  },
  contactEmail: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  contactNote: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
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


