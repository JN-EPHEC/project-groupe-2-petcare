import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components';

interface EmailConfirmationScreenProps {
  navigation: any;
}

export const EmailConfirmationScreen: React.FC<EmailConfirmationScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../logo.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.emailConfirmation.title')}</Text>

        <Text style={styles.message}>
          {t('auth.emailConfirmation.message1')}
        </Text>

        <Text style={styles.message}>
          {t('auth.emailConfirmation.message2')}
        </Text>

        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📧</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={t('auth.emailConfirmation.understoodButton')}
            onPress={() => navigation.navigate('Login')}
            variant="primary"
            style={styles.button}
          />

          <Button
            title={t('auth.emailConfirmation.resendButton')}
            onPress={() => console.log('Email renvoyé')}
            variant="light"
            style={styles.button}
          />
        </View>
      </View>

      <View style={styles.progressIndicator}>
        <View style={styles.progressDot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xl,
  },
  logo: {
    width: 150,
    height: 120,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xl,
  },
  message: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  iconContainer: {
    marginVertical: spacing.xxl,
  },
  icon: {
    fontSize: 80,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  button: {
    width: '100%',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  progressDot: {
    width: 60,
    height: 4,
    backgroundColor: colors.navy,
    borderRadius: 2,
  },
});

