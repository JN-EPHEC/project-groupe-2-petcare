import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button, Input, PasswordStrengthIndicator } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseErrorMessage } from '../../services/firebaseAuth';

interface VetSignupScreenProps {
  navigation: any;
}

export const VetSignupScreen: React.FC<VetSignupScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [experience, setExperience] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  
  // Field errors
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [specialtyError, setSpecialtyError] = useState('');
  const [clinicNameError, setClinicNameError] = useState('');
  const [clinicAddressError, setClinicAddressError] = useState('');
  const [experienceError, setExperienceError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const { signUpVet, isLoading } = useAuth();

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
      case 'specialty':
        setSpecialty(value);
        if (specialtyError && value) setSpecialtyError('');
        break;
      case 'clinicName':
        setClinicName(value);
        if (clinicNameError && value) setClinicNameError('');
        break;
      case 'clinicAddress':
        setClinicAddress(value);
        if (clinicAddressError && value) setClinicAddressError('');
        break;
      case 'experience':
        setExperience(value);
        if (experienceError && value) setExperienceError('');
        break;
      case 'licenseNumber':
        setLicenseNumber(value);
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
    if (!specialty) {
      setSpecialtyError('Specialité requise');
      isValid = false;
    }
    if (!clinicName) {
      setClinicNameError('Nom de la clinique requis');
      isValid = false;
    }
    if (!clinicAddress) {
      setClinicAddressError('Adresse de la clinique requise');
      isValid = false;
    }
    if (!experience) {
      setExperienceError('Années d\'expérience requises');
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
      await signUpVet({
        firstName,
        lastName,
        email,
        phone,
        location: location || 'Belgique',
        specialty,
        clinicName,
        clinicAddress,
        experience,
        licenseNumber,
        password,
      });
      // Rediriger vers l'écran de confirmation en attente d'approbation
      navigation.navigate('EmailVerification', { 
        email, 
        isVet: true,
        message: 'Votre compte vétérinaire a été créé avec succès ! Vous recevrez une notification une fois qu\'un administrateur aura approuvé votre compte.'
      });
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
            <View style={styles.titleRow}>
              <Ionicons name="medical" size={32} color={colors.navy} />
              <Text style={styles.title}>Inscription Vétérinaire</Text>
            </View>
            <Text style={styles.subtitle}>Créez votre compte professionnel</Text>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.teal} />
              <Text style={styles.infoText}>
                Votre compte sera vérifié par un administrateur avant activation
              </Text>
            </View>
          </View>

          {signupError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.red} />
              <Text style={styles.errorText}>{signupError}</Text>
            </View>
          ) : null}

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            
            <View style={styles.row}>
              <Input
                value={firstName}
                onChangeText={(text) => handleFieldChange('firstName', text)}
                placeholder="Prénom"
                iconLeft="person"
                error={firstNameError}
                success={firstName.length > 0 && !firstNameError}
                style={styles.halfInput}
              />

              <Input
                value={lastName}
                onChangeText={(text) => handleFieldChange('lastName', text)}
                placeholder="Nom"
                iconLeft="person-outline"
                error={lastNameError}
                success={lastName.length > 0 && !lastNameError}
                style={styles.halfInput}
              />
            </View>

            <Input
              value={email}
              onChangeText={(text) => handleFieldChange('email', text)}
              placeholder="Email professionnel"
              keyboardType="email-address"
              autoCapitalize="none"
              iconLeft="mail"
              error={emailError}
              success={email.length > 0 && !emailError}
            />

            <Input
              value={phone}
              onChangeText={(text) => handleFieldChange('phone', text)}
              placeholder="Téléphone"
              keyboardType="phone-pad"
              iconLeft="call"
              error={phoneError}
              success={phone.length > 0 && !phoneError}
            />

            <Input
              value={location}
              onChangeText={(text) => handleFieldChange('location', text)}
              placeholder="Ville / Région"
              iconLeft="location"
              success={location.length > 0}
            />

            <Text style={styles.sectionTitle}>Informations professionnelles</Text>

            <Input
              value={specialty}
              onChangeText={(text) => handleFieldChange('specialty', text)}
              placeholder="Spécialité (ex: Médecine générale, Chirurgie...)"
              iconLeft="fitness"
              error={specialtyError}
              success={specialty.length > 0 && !specialtyError}
            />

            <Input
              value={clinicName}
              onChangeText={(text) => handleFieldChange('clinicName', text)}
              placeholder="Nom de la clinique"
              iconLeft="business"
              error={clinicNameError}
              success={clinicName.length > 0 && !clinicNameError}
            />

            <Input
              value={clinicAddress}
              onChangeText={(text) => handleFieldChange('clinicAddress', text)}
              placeholder="Adresse de la clinique"
              iconLeft="location-outline"
              error={clinicAddressError}
              success={clinicAddress.length > 0 && !clinicAddressError}
            />

            <Input
              value={experience}
              onChangeText={(text) => handleFieldChange('experience', text)}
              placeholder="Années d'expérience"
              keyboardType="numeric"
              iconLeft="time"
              error={experienceError}
              success={experience.length > 0 && !experienceError}
            />

            <Input
              value={licenseNumber}
              onChangeText={(text) => handleFieldChange('licenseNumber', text)}
              placeholder="Numéro de licence (optionnel)"
              iconLeft="card"
              success={licenseNumber.length > 0}
            />

            <Text style={styles.sectionTitle}>Sécurité</Text>

            <Input
              value={password}
              onChangeText={(text) => handleFieldChange('password', text)}
              placeholder="Mot de passe"
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
              placeholder="Confirmer le mot de passe"
              secureTextEntry
              iconLeft="lock-closed"
              error={confirmPasswordError}
              success={confirmPassword.length > 0 && !confirmPasswordError && password === confirmPassword}
            />
          </View>

          <Button
            title="S'inscrire en tant que vétérinaire"
            onPress={handleSignup}
            variant="primary"
            style={styles.signupButton}
            loading={isLoading}
          />

          <View style={styles.loginSection}>
            <Text style={styles.alreadyHaveAccountText}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.navy,
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
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
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

