import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button, Input } from '../../components';
import { addPet } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

interface AddPetScreenProps {
  navigation: any;
}

export const AddPetScreen: React.FC<AddPetScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, refreshPets } = useAuth();
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!petName || !species) {
      Alert.alert(t('profile.addPet.errorTitle'), t('profile.addPet.errorMessage'));
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      // Determine pet type and emoji
      const petType = species.toLowerCase().includes('chien') || species.toLowerCase().includes('dog') ? 'dog' : 
                      species.toLowerCase().includes('chat') || species.toLowerCase().includes('cat') ? 'cat' : 'other';
      const emoji = petType === 'dog' ? '🐕' : petType === 'cat' ? '🐈' : '🐾';

      await addPet({
        name: petName,
        type: petType,
        breed: breed || 'Non précisée',
        age: parseInt(age) || 0,
        weight: parseFloat(weight) || 0,
        emoji,
        ownerId: user.id,
        gender: gender || 'Non précisé',
        avatarUrl: null,
      });

      // Rafraîchir la liste des animaux dans le contexte
      await refreshPets();

      // Afficher le message de succès et naviguer
      Alert.alert(
        t('profile.addPet.successTitle'), 
        t('profile.addPet.successMessage'), 
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error adding pet:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'animal. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
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
              loading={isLoading}
              disabled={isLoading}
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

