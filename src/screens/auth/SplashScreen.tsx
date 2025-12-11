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
        <Text style={styles.appName}>PetCare+</Text>
        <Text style={styles.tagline}>Votre compagnon santé pour animaux</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.mainSection}>
          <Text style={styles.title}>{t('auth.splash.title1')}</Text>
          <Text style={styles.title}>{t('auth.splash.title2')}</Text>
          
          <Text style={styles.subtitle}>
            {t('auth.splash.subtitle')}
          </Text>

          <View style={styles.rolesContainer}>
            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <View style={[styles.roleIconContainer, { backgroundColor: '#E0F2F1' }]}>
                <Ionicons name="paw" size={32} color={colors.teal} />
              </View>
              <Text style={styles.roleTitle}>{t('auth.splash.ownerButton')}</Text>
              <Text style={styles.roleDescription}>Gérez la santé de votre animal</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.teal} style={styles.roleArrow} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.roleCard}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <View style={[styles.roleIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="medical" size={32} color={colors.navy} />
              </View>
              <Text style={styles.roleTitle}>{t('auth.splash.vetButton')}</Text>
              <Text style={styles.roleDescription}>Gérez vos patients en ligne</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.navy} style={styles.roleArrow} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressIndicator}>
            <View style={styles.progressDot} />
            <View style={styles.progressDotInactive} />
            <View style={styles.progressDotInactive} />
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
  appName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
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
    position: 'absolute',
    left: 92,
    bottom: spacing.lg,
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  roleArrow: {
    marginLeft: spacing.sm,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
    gap: spacing.sm,
  },
  progressDot: {
    width: 40,
    height: 4,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
  },
  progressDotInactive: {
    width: 40,
    height: 4,
    backgroundColor: colors.navy,
    borderRadius: borderRadius.sm,
    opacity: 0.5,
  },
});
