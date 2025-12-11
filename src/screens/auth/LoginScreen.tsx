import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button, Input } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseErrorMessage } from '../../services/firebaseAuth';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const { signIn, isLoading } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError(t('auth.validation.emailRequired'));
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError(t('auth.validation.emailInvalid'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError(t('auth.validation.passwordRequired'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setLoginError('');
    if (emailError) {
      validateEmail(text);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setLoginError('');
    if (passwordError) {
      validatePassword(text);
    }
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      await signIn(email, password);
      navigation.navigate('MainTabs');
    } catch (error: any) {
      // Si l'email n'est pas vérifié, rediriger vers l'écran de vérification
      if (error?.code === 'auth/email-not-verified') {
        navigation.navigate('EmailVerification', { email: error.email || email });
      } else {
        const errorMessage = getFirebaseErrorMessage(error);
        setLoginError(errorMessage);
      }
    }
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const fillDemoCredentials = (type: 'admin' | 'owner' | 'vet') => {
    setLoginError('');
    setEmailError('');
    setPasswordError('');
    
    if (type === 'admin') {
      setEmail('admin@petcare.com');
      setPassword('admin123');
    } else if (type === 'owner') {
      setEmail('owner@petcare.com');
      setPassword('owner123');
    } else if (type === 'vet') {
      setEmail('vet@petcare.com');
      setPassword('vet123');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>{t('auth.login.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
          </View>

          {loginError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.red} />
              <Text style={styles.errorText}>{loginError}</Text>
            </View>
          ) : null}

          <View style={styles.formContainer}>
            <Input
              value={email}
              onChangeText={handleEmailChange}
              placeholder={t('auth.login.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              iconLeft="mail"
              error={emailError}
              success={email.length > 0 && !emailError}
            />

            <Input
              value={password}
              onChangeText={handlePasswordChange}
              placeholder={t('auth.login.passwordPlaceholder')}
              secureTextEntry
              iconLeft="lock-closed"
              error={passwordError}
            />

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>{t('auth.login.forgotPassword')}</Text>
            </TouchableOpacity>
          </View>

          <Button
            title={t('auth.login.loginButton')}
            onPress={handleLogin}
            variant="primary"
            style={styles.loginButton}
            loading={isLoading}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.demoAccountsContainer}>
            <Text style={styles.demoTitle}>{t('auth.login.demoTitle')}</Text>
            <View style={styles.demoButtons}>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => fillDemoCredentials('owner')}
              >
                <Ionicons name="paw" size={16} color={colors.teal} />
                <Text style={styles.demoChipText}>{t('auth.login.ownerDemo')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => fillDemoCredentials('vet')}
              >
                <Ionicons name="medical" size={16} color={colors.navy} />
                <Text style={styles.demoChipText}>{t('auth.login.vetDemo')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => fillDemoCredentials('admin')}
              >
                <Ionicons name="shield-checkmark" size={16} color="#FF9800" />
                <Text style={styles.demoChipText}>{t('auth.login.adminDemo')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.signupSection}>
            <Text style={styles.noAccountText}>{t('auth.login.noAccount')}</Text>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={styles.signupLink}>{t('auth.login.signupButton')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.red,
  },
  formContainer: {
    marginBottom: spacing.md,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  loginButton: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginHorizontal: spacing.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  demoAccountsContainer: {
    padding: spacing.md,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  demoTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  demoChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  noAccountText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  signupLink: {
    fontSize: typography.fontSize.md,
    color: colors.teal,
    fontWeight: typography.fontWeight.bold,
  },
});
