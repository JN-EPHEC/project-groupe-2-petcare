import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme';
import { Button, Input } from '../../components';
import { useAuth } from '../../context/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('auth.login.errorTitle'), t('auth.login.errorMessage'));
      return;
    }

    try {
      await signIn(email, password);
      navigation.navigate('MainTabs');
    } catch (error: any) {
      Alert.alert(t('auth.login.loginFailedTitle'), error.message || t('auth.login.loginFailedMessage'));
    }
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const fillDemoCredentials = (type: 'admin' | 'owner' | 'vet') => {
    if (type === 'admin') {
      setEmail('admin@petcare.com');
      setPassword('admin123');
    } else if (type === 'owner') {
      setEmail('charles@example.com');
      setPassword('demo123');
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.login.title')}</Text>

          <View style={styles.formContainer}>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.login.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.login.passwordPlaceholder')}
              secureTextEntry
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={t('auth.login.loginButton')}
              onPress={handleLogin}
              variant="primary"
              style={styles.button}
              loading={isLoading}
            />

            <Button
              title={t('auth.login.signupButton')}
              onPress={handleSignup}
              variant="primary"
              style={styles.button}
            />
          </View>

          <View style={styles.demoAccountsContainer}>
            <Text style={styles.demoTitle}>{t('auth.login.demoTitle')}</Text>
            <View style={styles.demoButtons}>
              <Button
                title={t('auth.login.adminDemo')}
                onPress={() => fillDemoCredentials('admin')}
                variant="light"
                style={styles.demoButton}
              />
              <Button
                title={t('auth.login.ownerDemo')}
                onPress={() => fillDemoCredentials('owner')}
                variant="light"
                style={styles.demoButton}
              />
              <Button
                title={t('auth.login.vetDemo')}
                onPress={() => fillDemoCredentials('vet')}
                variant="light"
                style={styles.demoButton}
              />
            </View>
          </View>

          <View style={styles.progressIndicator}>
            <View style={styles.progressDot} />
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
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  formContainer: {
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
  },
  progressDot: {
    width: 60,
    height: 4,
    backgroundColor: colors.navy,
    borderRadius: 2,
  },
  demoAccountsContainer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.lightBlue,
    borderRadius: 12,
  },
  demoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  demoButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
});
