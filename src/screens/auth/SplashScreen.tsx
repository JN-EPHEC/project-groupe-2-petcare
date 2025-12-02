import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button, LanguageSwitcher } from '../../components';

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.progressBar} />
        <View style={styles.languageSwitcherContainer}>
          <LanguageSwitcher />
        </View>
      </View>
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../logo.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.tealSection}>
          <Text style={styles.title}>{t('auth.splash.title1')}</Text>
          <Text style={styles.title}>{t('auth.splash.title2')}</Text>
          
          <Text style={styles.subtitle}>
            {t('auth.splash.subtitle')}
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              title={t('auth.splash.vetButton')}
              onPress={() => navigation.navigate('Login')}
              variant="light"
              style={styles.button}
            />
            
            <Button
              title={t('auth.splash.ownerButton')}
              onPress={() => navigation.navigate('Login')}
              variant="light"
              style={styles.button}
            />
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
    flex: 1,
    backgroundColor: colors.white,
  },
  topSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageSwitcherContainer: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.navy,
    borderRadius: borderRadius.sm,
    width: '60%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  logo: {
    width: 250,
    height: 200,
  },
  contentContainer: {
    flex: 1,
  },
  tealSection: {
    backgroundColor: colors.teal,
    borderTopLeftRadius: 80,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    minHeight: 400,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    width: '100%',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
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
  },
});
