import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { 
  getCookiePreferences, 
  saveConsent, 
  clearConsent,
  type CookiePreferences 
} from '../../services/cookieConsentService';

interface CookieSettingsScreenProps {
  navigation: any;
}

export const CookieSettingsScreen: React.FC<CookieSettingsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    personalization: false,
    marketing: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const consent = await getCookiePreferences(user?.id);
      setPreferences(consent);
      
      // Charger la date de dernière modification depuis localStorage si possible
      // Pour l'instant, on met la date actuelle
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Ne peut pas être désactivé
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveConsent(preferences, user?.id);
      setLastUpdate(new Date());
      Alert.alert(
        'Préférences enregistrées',
        'Vos préférences de cookies ont été mises à jour avec succès.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert(
        'Erreur',
        'Impossible de sauvegarder vos préférences. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptAll = async () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      personalization: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    
    try {
      setIsSaving(true);
      await saveConsent(allAccepted, user?.id);
      setLastUpdate(new Date());
      Alert.alert(
        'Tous les cookies acceptés',
        'Vous avez accepté tous les types de cookies.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectOptional = async () => {
    Alert.alert(
      'Refuser les cookies optionnels',
      'Êtes-vous sûr de vouloir désactiver tous les cookies optionnels ? Seuls les cookies essentiels seront conservés.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer',
          style: 'destructive',
          onPress: async () => {
            const essentialOnly: CookiePreferences = {
              essential: true,
              analytics: false,
              personalization: false,
              marketing: false,
            };
            setPreferences(essentialOnly);
            
            try {
              setIsSaving(true);
              await saveConsent(essentialOnly, user?.id);
              setLastUpdate(new Date());
              Alert.alert(
                'Cookies optionnels refusés',
                'Seuls les cookies essentiels sont maintenant actifs.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error saving preferences:', error);
            } finally {
              setIsSaving(false);
            }
          }
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Chargement des préférences...</Text>
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
          <Ionicons name="arrow-back" size={24} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des cookies</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="shield-checkmark" size={32} color={colors.teal} />
          </View>
          <Text style={styles.infoTitle}>Contrôlez vos données</Text>
          <Text style={styles.infoText}>
            Gérez vos préférences de cookies et décidez quelles données vous souhaitez partager avec PetCare+.
          </Text>
          {lastUpdate && (
            <Text style={styles.lastUpdateText}>
              Dernière modification : {lastUpdate.toLocaleDateString('fr-FR')} à {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        {/* Cookies essentiels */}
        <View style={[styles.cookieSection, styles.cookieSectionEssential]}>
          <View style={styles.cookieHeader}>
            <View style={styles.cookieTitleRow}>
              <Ionicons name="shield" size={28} color={colors.teal} />
              <View style={styles.cookieTitleContainer}>
                <Text style={styles.cookieTitle}>Cookies essentiels</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>REQUIS</Text>
                </View>
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
            Ces cookies sont indispensables au fonctionnement de l'application. Ils assurent l'authentification, 
            la sécurité de votre compte et les fonctionnalités de base.
          </Text>
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>Exemples :</Text>
            <Text style={styles.exampleItem}>• Session utilisateur et authentification</Text>
            <Text style={styles.exampleItem}>• Préférences de langue</Text>
            <Text style={styles.exampleItem}>• Sécurité et protection CSRF</Text>
          </View>
        </View>

        {/* Cookies analytiques */}
        <View style={styles.cookieSection}>
          <View style={styles.cookieHeader}>
            <View style={styles.cookieTitleRow}>
              <Ionicons name="analytics" size={28} color={colors.navy} />
              <View style={styles.cookieTitleContainer}>
                <Text style={styles.cookieTitle}>Cookies analytiques</Text>
              </View>
            </View>
            <Switch
              value={preferences.analytics}
              onValueChange={() => togglePreference('analytics')}
              trackColor={{ false: colors.gray, true: colors.teal }}
              thumbColor={colors.white}
            />
          </View>
          <Text style={styles.cookieDescription}>
            Ces cookies nous aident à comprendre comment vous utilisez l'application pour améliorer nos services 
            et corriger les bugs. Aucune donnée personnelle identifiable n'est collectée.
          </Text>
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>Exemples :</Text>
            <Text style={styles.exampleItem}>• Pages visitées et durée de session</Text>
            <Text style={styles.exampleItem}>• Interactions avec les fonctionnalités</Text>
            <Text style={styles.exampleItem}>• Rapport de bugs et performances</Text>
          </View>
        </View>

        {/* Cookies de personnalisation */}
        <View style={styles.cookieSection}>
          <View style={styles.cookieHeader}>
            <View style={styles.cookieTitleRow}>
              <Ionicons name="person" size={28} color={colors.navy} />
              <View style={styles.cookieTitleContainer}>
                <Text style={styles.cookieTitle}>Cookies de personnalisation</Text>
              </View>
            </View>
            <Switch
              value={preferences.personalization}
              onValueChange={() => togglePreference('personalization')}
              trackColor={{ false: colors.gray, true: colors.teal }}
              thumbColor={colors.white}
            />
          </View>
          <Text style={styles.cookieDescription}>
            Ces cookies permettent de mémoriser vos préférences et de personnaliser votre expérience 
            selon vos habitudes d'utilisation.
          </Text>
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>Exemples :</Text>
            <Text style={styles.exampleItem}>• Recommandations personnalisées</Text>
            <Text style={styles.exampleItem}>• Préférences d'affichage</Text>
            <Text style={styles.exampleItem}>• Suggestions de contenu</Text>
          </View>
        </View>

        {/* Cookies marketing */}
        <View style={styles.cookieSection}>
          <View style={styles.cookieHeader}>
            <View style={styles.cookieTitleRow}>
              <Ionicons name="megaphone" size={28} color={colors.navy} />
              <View style={styles.cookieTitleContainer}>
                <Text style={styles.cookieTitle}>Cookies marketing</Text>
              </View>
            </View>
            <Switch
              value={preferences.marketing}
              onValueChange={() => togglePreference('marketing')}
              trackColor={{ false: colors.gray, true: colors.teal }}
              thumbColor={colors.white}
            />
          </View>
          <Text style={styles.cookieDescription}>
            Ces cookies permettent de vous proposer des offres pertinentes et de mesurer l'efficacité 
            de nos campagnes marketing.
          </Text>
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>Exemples :</Text>
            <Text style={styles.exampleItem}>• Publicités ciblées</Text>
            <Text style={styles.exampleItem}>• Promotions personnalisées</Text>
            <Text style={styles.exampleItem}>• Mesure de performance des campagnes</Text>
          </View>
        </View>

        {/* RGPD Info */}
        <View style={styles.rgpdInfo}>
          <Ionicons name="information-circle" size={24} color={colors.teal} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rgpdTitle}>Vos droits RGPD</Text>
            <Text style={styles.rgpdText}>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et 
              de portabilité de vos données personnelles.
            </Text>
          </View>
        </View>

        {/* Links */}
        <View style={styles.linksContainer}>
          <TouchableOpacity 
            style={styles.link}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Ionicons name="document-text" size={20} color={colors.teal} />
            <Text style={styles.linkText}>Politique de confidentialité</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.link}
            onPress={() => navigation.navigate('CookiePolicy')}
          >
            <Ionicons name="shield" size={20} color={colors.teal} />
            <Text style={styles.linkText}>Politique des cookies</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Actions buttons */}
      <View style={styles.actionsContainer}>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleAcceptAll}
            disabled={isSaving}
          >
            <Text style={styles.quickActionText}>Tout accepter</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickActionButton, styles.quickActionButtonDanger]}
            onPress={handleRejectOptional}
            disabled={isSaving}
          >
            <Text style={[styles.quickActionText, styles.quickActionTextDanger]}>
              Refuser optionnels
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title={isSaving ? "Enregistrement..." : "Enregistrer mes préférences"}
          onPress={handleSave}
          variant="primary"
          loading={isSaving}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.md,
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
    fontSize: typography.fontSize.xl,
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
  infoCard: {
    backgroundColor: `${colors.teal}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  infoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    textAlign: 'center',
    lineHeight: 20,
  },
  lastUpdateText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  cookieSection: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cookieSectionEssential: {
    borderWidth: 2,
    borderColor: colors.teal,
  },
  cookieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cookieTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    flex: 1,
  },
  cookieTitleContainer: {
    flex: 1,
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
  cookieDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  examplesContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  examplesTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  exampleItem: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    lineHeight: 18,
    marginBottom: 2,
  },
  rgpdInfo: {
    flexDirection: 'row',
    backgroundColor: `${colors.teal}10`,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  rgpdTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  rgpdText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
  },
  linksContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  linkText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
  },
  actionsContainer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.teal,
  },
  quickActionButtonDanger: {
    backgroundColor: colors.white,
    borderColor: colors.lightGray,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
  },
  quickActionTextDanger: {
    color: colors.gray,
  },
});


