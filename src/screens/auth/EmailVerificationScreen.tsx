import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components';
import { resendVerificationEmail, getFirebaseErrorMessage } from '../../services/firebaseAuth';

interface EmailVerificationScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
    };
  };
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { email } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await resendVerificationEmail();
      setEmailSent(true);
      Alert.alert(
        t('auth.emailVerification.successTitle'),
        t('auth.emailVerification.emailResent')
      );
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error);
      Alert.alert(t('auth.emailVerification.errorTitle'), errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={100} color={colors.teal} />
            <View style={styles.checkmarkBadge}>
              <Ionicons name="checkmark" size={32} color={colors.white} />
            </View>
          </View>

          <Text style={styles.title}>{t('auth.emailVerification.title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.emailVerification.subtitle')}
          </Text>
          
          <View style={styles.emailBox}>
            <Ionicons name="mail" size={20} color={colors.teal} />
            <Text style={styles.emailText}>{email}</Text>
          </View>

          <View style={styles.instructionsContainer}>
            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                {t('auth.emailVerification.step1')}
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                {t('auth.emailVerification.step2')}
              </Text>
            </View>

            <View style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                {t('auth.emailVerification.step3')}
              </Text>
            </View>
          </View>

          <Button
            title={t('auth.emailVerification.goToLogin')}
            onPress={handleGoToLogin}
            variant="primary"
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.emailVerification.didntReceive')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title={emailSent ? t('auth.emailVerification.emailSent') : t('auth.emailVerification.resendEmail')}
            onPress={handleResendEmail}
            variant="outline"
            style={styles.resendButton}
            loading={isLoading}
            disabled={isLoading || emailSent}
          />

          {emailSent && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
              <Text style={styles.successText}>
                {t('auth.emailVerification.checkInbox')}
              </Text>
            </View>
          )}
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  emailText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    gap: spacing.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.navy,
    lineHeight: 22,
    paddingTop: 4,
  },
  loginButton: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontWeight: typography.fontWeight.medium,
  },
  resendButton: {
    width: '100%',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  successText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
  },
});

