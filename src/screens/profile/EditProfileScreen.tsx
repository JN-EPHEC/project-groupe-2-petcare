import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button, Input } from '../../components';
import { useAuth } from '../../context/AuthContext';

interface EditProfileScreenProps {
  navigation: any;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = () => {
    // Sauvegarder les modifications
    console.log('Profil mis à jour');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.editProfile.title')}</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings" size={30} color={colors.navy} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.formContainer}>
            <Input
              label={t('profile.editProfile.firstName')}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="*JOHN"
            />

            <Input
              label={t('profile.editProfile.lastName')}
              value={lastName}
              onChangeText={setLastName}
              placeholder="*Doe"
            />

            <Input
              label={t('profile.editProfile.email')}
              value={email}
              onChangeText={setEmail}
              placeholder="*Charlesdubois@hotmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label={t('profile.editProfile.phone')}
              value={phone}
              onChangeText={setPhone}
              placeholder="*+32 49 90 89 808"
              keyboardType="phone-pad"
            />

            <Input
              label={t('profile.editProfile.petName')}
              value={user?.petId || 'KITTY'}
              onChangeText={() => {}}
              placeholder="*KITTY"
              editable={false}
            />

            <Input
              label={t('profile.editProfile.newPassword')}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="******"
              secureTextEntry
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={t('profile.editProfile.saveButton')}
              onPress={handleSave}
              variant="primary"
              style={styles.saveButton}
            />

            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>{t('profile.editProfile.deleteButton')}</Text>
            </TouchableOpacity>

            <Button
              title={t('profile.editProfile.confirmButton')}
              onPress={() => {
                console.log('Compte supprimé');
                navigation.navigate('Splash');
              }}
              variant="primary"
              style={styles.confirmButton}
            />
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
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    position: 'relative',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  settingsButton: {
    position: 'absolute',
    right: spacing.xl,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  formContainer: {
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  saveButton: {
    marginBottom: spacing.md,
  },
  deleteButton: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  confirmButton: {
    width: '40%',
    alignSelf: 'center',
  },
});

