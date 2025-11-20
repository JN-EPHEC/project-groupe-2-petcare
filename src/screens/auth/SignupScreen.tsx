import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme';
import { Button, Input } from '../../components';
import { useAuth } from '../../context/AuthContext';

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [petName, setPetName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp, isLoading } = useAuth();

  const handleSignup = async () => {
    // Validation
    if (!firstName || !lastName || !email || !phone || !petName || !password) {
      Alert.alert(t('auth.signup.errorTitle'), t('auth.signup.fillAllFieldsError'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('auth.signup.errorTitle'), t('auth.signup.passwordMismatchError'));
      return;
    }

    try {
      await signUp({
        firstName,
        lastName,
        email,
        phone,
        petName,
        password,
      });
      navigation.navigate('MainTabs');
    } catch (error: any) {
      Alert.alert(t('auth.signup.signupFailedTitle'), error.message || 'Impossible de créer le compte');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.signup.title')}</Text>

          <View style={styles.formContainer}>
            <Input
              label={t('auth.signup.firstNameLabel')}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('auth.signup.firstNamePlaceholder')}
            />

            <Input
              label={t('auth.signup.lastNameLabel')}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('auth.signup.lastNamePlaceholder')}
            />

            <Input
              label={t('auth.signup.emailLabel')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.signup.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label={t('auth.signup.phoneLabel')}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('auth.signup.phonePlaceholder')}
              keyboardType="phone-pad"
            />

            <Input
              label={t('auth.signup.petNameLabel')}
              value={petName}
              onChangeText={setPetName}
              placeholder={t('auth.signup.petNamePlaceholder')}
            />

            <Input
              label={t('auth.signup.passwordLabel')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.signup.passwordPlaceholder')}
              secureTextEntry
            />

            <Input
              label={t('auth.signup.confirmPasswordLabel')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('auth.signup.confirmPasswordPlaceholder')}
              secureTextEntry
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={t('auth.signup.signupButton')}
              onPress={handleSignup}
              variant="primary"
              style={styles.button}
              loading={isLoading}
            />
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
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  formContainer: {
    marginBottom: spacing.lg,
  },
  buttonContainer: {
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
});
