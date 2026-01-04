import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button, Input, PasswordStrengthIndicator } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseErrorMessage } from '../../services/firebaseAuth';

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  
  // Field errors
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const { signUp, isLoading } = useAuth();

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
    if (password.length < 8) {
      setPasswordError(t('auth.validation.passwordTooShort'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPwd: string): boolean => {
    if (confirmPwd !== password) {
      setConfirmPasswordError(t('auth.validation.passwordsNoMatch'));
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleFieldChange = (field: string, value: string) => {
    setSignupError('');
    
    switch (field) {
      case 'firstName':
        setFirstName(value);
        if (firstNameError && value) setFirstNameError('');
        break;
      case 'lastName':
        setLastName(value);
        if (lastNameError && value) setLastNameError('');
        break;
      case 'email':
        setEmail(value);
        if (emailError) validateEmail(value);
        break;
      case 'phone':
        setPhone(value);
        if (phoneError && value) setPhoneError('');
        break;
      case 'location':
        setLocation(value);
        break;
      case 'password':
        setPassword(value);
        if (passwordError) validatePassword(value);
        if (confirmPassword) validateConfirmPassword(confirmPassword);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        if (confirmPasswordError) validateConfirmPassword(value);
        break;
    }
  };

  const handleSignup = async () => {
    // Validation
    let isValid = true;
    
    if (!firstName) {
      setFirstNameError(t('auth.validation.firstNameRequired'));
      isValid = false;
    }
    if (!lastName) {
      setLastNameError(t('auth.validation.lastNameRequired'));
      isValid = false;
    }
    if (!validateEmail(email)) {
      isValid = false;
    }
    if (!phone) {
      setPhoneError(t('auth.validation.phoneRequired'));
      isValid = false;
    }
    if (!validatePassword(password)) {
      isValid = false;
    }
    if (!validateConfirmPassword(confirmPassword)) {
      isValid = false;
    }

    if (!isValid) return;

    try {
      await signUp({
        firstName,
        lastName,
        email,
        phone,
        location: location || 'Belgique',
        password,
      });
      // Rediriger vers l'écran de vérification d'email
      // Rediriger vers le wizard d'onboarding au lieu de EmailVerification
      navigation.navigate('OnboardingWizard');
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error);
      setSignupError(errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <Text style={styles.title}>{t('auth.signup.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.signup.subtitle')}</Text>
          </View>

          {signupError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.red} />
              <Text style={styles.errorText}>{signupError}</Text>
            </View>
          ) : null}

          <View style={styles.formContainer}>
            <View style={styles.row}>
              <Input
                value={firstName}
                onChangeText={(text) => handleFieldChange('firstName', text)}
                placeholder={t('auth.signup.firstNamePlaceholder')}
                iconLeft="person"
                error={firstNameError}
                success={firstName.length > 0 && !firstNameError}
                style={styles.halfInput}
              />

              <Input
                value={lastName}
                onChangeText={(text) => handleFieldChange('lastName', text)}
                placeholder={t('auth.signup.lastNamePlaceholder')}
                iconLeft="person-outline"
                error={lastNameError}
                success={lastName.length > 0 && !lastNameError}
                style={styles.halfInput}
              />
            </View>

            <Input
              value={email}
              onChangeText={(text) => handleFieldChange('email', text)}
              placeholder={t('auth.signup.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              iconLeft="mail"
              error={emailError}
              success={email.length > 0 && !emailError}
            />

            <Input
              value={phone}
              onChangeText={(text) => handleFieldChange('phone', text)}
              placeholder={t('auth.signup.phonePlaceholder')}
              keyboardType="phone-pad"
              iconLeft="call"
              error={phoneError}
              success={phone.length > 0 && !phoneError}
            />

            <Input
              value={location}
              onChangeText={(text) => handleFieldChange('location', text)}
              placeholder={t('auth.signup.locationPlaceholder')}
              iconLeft="location"
              success={location.length > 0}
            />

            <Input
              value={password}
              onChangeText={(text) => handleFieldChange('password', text)}
              placeholder={t('auth.signup.passwordPlaceholder')}
              secureTextEntry
              iconLeft="lock-closed"
              error={passwordError}
            />

            {password.length > 0 && (
              <PasswordStrengthIndicator password={password} />
            )}

            <Input
              value={confirmPassword}
              onChangeText={(text) => handleFieldChange('confirmPassword', text)}
              placeholder={t('auth.signup.confirmPasswordPlaceholder')}
              secureTextEntry
              iconLeft="lock-closed"
              error={confirmPasswordError}
              success={confirmPassword.length > 0 && !confirmPasswordError && password === confirmPassword}
            />
          </View>

          <Button
            title={t('auth.signup.signupButton')}
            onPress={handleSignup}
            variant="primary"
            style={styles.signupButton}
            loading={isLoading}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.vetSignupBox}
            onPress={() => navigation.navigate('VetSignup')}
          >
            <View style={styles.vetSignupContent}>
              <View style={styles.vetIconWrapper}>
                <Ionicons name="medical" size={24} color={colors.white} />
              </View>
              <View style={styles.vetSignupTextContainer}>
                <Text style={styles.vetSignupTitle}>Vous êtes vétérinaire ?</Text>
                <Text style={styles.vetSignupSubtitle}>Inscrivez-vous en tant que professionnel</Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color={colors.navy} />
            </View>
          </TouchableOpacity>

          <View style={styles.loginSection}>
            <Text style={styles.alreadyHaveAccountText}>{t('auth.signup.alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{t('auth.signup.signInLink')}</Text>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerSection: {
    marginBottom: spacing.lg,
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  signupButton: {
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
  vetSignupBox: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.navy,
  },
  vetSignupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  vetIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vetSignupTextContainer: {
    flex: 1,
  },
  vetSignupTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  vetSignupSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  alreadyHaveAccountText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  loginLink: {
    fontSize: typography.fontSize.md,
    color: colors.teal,
    fontWeight: typography.fontWeight.bold,
  },
});
