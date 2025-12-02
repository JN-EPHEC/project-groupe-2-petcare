import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button, Input } from '../../components';

interface AddPetScreenProps {
  navigation: any;
}

export const AddPetScreen: React.FC<AddPetScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');

  const handleSave = () => {
    if (!petName || !species) {
      Alert.alert(t('profile.addPet.errorTitle'), t('profile.addPet.errorMessage'));
      return;
    }

    Alert.alert(t('profile.addPet.successTitle'), t('profile.addPet.successMessage'), [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
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
          <Text style={styles.title}>{t('profile.addPet.title')}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <TouchableOpacity style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={40} color={colors.navy} />
              <Text style={styles.imageText}>{t('profile.addPet.addPhoto')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Input
              label={t('profile.addPet.petName')}
              value={petName}
              onChangeText={setPetName}
              placeholder={t('profile.addPet.petNamePlaceholder')}
            />

            <Input
              label={t('profile.addPet.species')}
              value={species}
              onChangeText={setSpecies}
              placeholder={t('profile.addPet.speciesPlaceholder')}
            />

            <Input
              label={t('profile.addPet.breed')}
              value={breed}
              onChangeText={setBreed}
              placeholder={t('profile.addPet.breedPlaceholder')}
            />

            <Input
              label={t('profile.addPet.age')}
              value={age}
              onChangeText={setAge}
              placeholder={t('profile.addPet.agePlaceholder')}
              keyboardType="numeric"
            />

            <Input
              label={t('profile.addPet.weight')}
              value={weight}
              onChangeText={setWeight}
              placeholder={t('profile.addPet.weightPlaceholder')}
              keyboardType="numeric"
            />

            <Input
              label={t('profile.addPet.gender')}
              value={gender}
              onChangeText={setGender}
              placeholder={t('profile.addPet.genderPlaceholder')}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={t('profile.addPet.saveButton')}
              onPress={handleSave}
              variant="primary"
              style={styles.button}
            />

            <Button
              title={t('profile.addPet.cancelButton')}
              onPress={() => navigation.goBack()}
              variant="light"
              style={styles.button}
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
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.navy,
    borderStyle: 'dashed',
    gap: spacing.xs,
  },
  imageText: {
    fontSize: typography.fontSize.xs,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
  },
  formContainer: {
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    width: '100%',
  },
});

