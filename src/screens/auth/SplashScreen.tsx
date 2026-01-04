import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button, LanguageSwitcher } from '../../components';

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.topSection}>
        <LanguageSwitcher />
      </View>
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../logo.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Votre compagnon santé pour animaux</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.mainSection}>
          <Text style={styles.title}>{t('auth.splash.title1')}</Text>
          <Text style={styles.title}>{t('auth.splash.title2')}</Text>
          
          <Text style={styles.subtitle}>
            Une application simple et intuitive pour propriétaires et vétérinaires
          </Text>

          {/* Features highlights */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.featureText}>Suivi santé complet</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.featureText}>Rappels automatiques</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.featureText}>Connexion avec vétérinaires</Text>
            </View>
          </View>

          {/* Boutons d'action principaux */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Se connecter</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('SignupChoice')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  topSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    alignItems: 'flex-end',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 200,
    height: 160,
    marginBottom: spacing.md,
  },
  tagline: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  contentContainer: {
    flex: 1,
  },
  mainSection: {
    backgroundColor: colors.teal,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    minHeight: 400,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  rolesContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  roleTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  roleDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
  roleArrow: {
    marginLeft: spacing.sm,
  },
  featuresContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  actionsContainer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.white,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
