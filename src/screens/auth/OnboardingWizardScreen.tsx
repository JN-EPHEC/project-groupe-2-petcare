import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button, Input, CustomPicker } from '../../components';
import { CookieConsentModal } from '../../components/CookieConsentModal';
import { addPet, getVets, updateUserProfile } from '../../services/firestoreService';
import { uploadPetImage } from '../../services/imageUploadService';
import { useAuth } from '../../context/AuthContext';
import { PET_SPECIES, PET_BREEDS, GENDER_OPTIONS } from '../../data/petSpeciesAndBreeds';
import { saveConsent, type CookiePreferences } from '../../services/cookieConsentService';

interface OnboardingWizardScreenProps {
  navigation: any;
}

export const OnboardingWizardScreen: React.FC<OnboardingWizardScreenProps> = ({ navigation }) => {
  const { user, refreshPets } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Pet info
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [customBreed, setCustomBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [identification, setIdentification] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Step 2: Vet selection
  const [vets, setVets] = useState<any[]>([]);
  const [selectedVet, setSelectedVet] = useState<any>(null);
  const [showVetModal, setShowVetModal] = useState(false);
  const [isLoadingVets, setIsLoadingVets] = useState(false);

  // Cookie consent
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  // Réinitialiser la race quand l'espèce change
  useEffect(() => {
    setBreed('');
    setCustomBreed('');
  }, [species]);

  // Réinitialiser customBreed quand on change de race
  useEffect(() => {
    if (breed !== 'Autre') {
      setCustomBreed('');
    }
  }, [breed]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à vos photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image. Veuillez réessayer.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  // Obtenir les races pour l'espèce sélectionnée
  const getAvailableBreeds = () => {
    if (!species) return [];
    const selectedSpecies = PET_SPECIES.find(s => s.value === species);
    return selectedSpecies ? PET_BREEDS[species] || [] : [];
  };

  const loadVets = async () => {
    try {
      setIsLoadingVets(true);
      const vetsList = await getVets();
      setVets(vetsList);
    } catch (error) {
      console.error('Error loading vets:', error);
    } finally {
      setIsLoadingVets(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!petName || !species) {
        Alert.alert('Information manquante', 'Veuillez entrer au moins le nom et l\'espèce de votre animal');
        return;
      }
      loadVets();
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSkipVet = () => {
    setStep(3);
  };

  const handleFinish = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 1. Créer l'animal
      const petType = species.toLowerCase().includes('chien') || species.toLowerCase().includes('dog') ? 'dog' : 
                      species.toLowerCase().includes('chat') || species.toLowerCase().includes('cat') ? 'cat' : 'other';
      const emoji = petType === 'dog' ? '🐕' : petType === 'cat' ? '🐈' : '🐾';

      let avatarUrl = null;
      if (imageUri) {
        try {
          setIsUploadingImage(true);
          avatarUrl = await uploadPetImage(imageUri, user.id);
          console.log('✅ Image uploadée avec succès:', avatarUrl);
        } catch (uploadError) {
          console.error('⚠️ Erreur upload image (continuons sans photo):', uploadError);
          // Continuons sans image - ce n'est pas bloquant
          Alert.alert(
            'Photo non uploadée',
            'La photo n\'a pas pu être uploadée, mais votre animal sera créé sans photo. Vous pourrez en ajouter une plus tard.',
            [{ text: 'OK' }]
          );
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Calculer l'âge à partir de la date de naissance
      const calculateAge = (birthDateValue: Date): number => {
        const today = new Date();
        const age = today.getFullYear() - birthDateValue.getFullYear();
        const monthDiff = today.getMonth() - birthDateValue.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateValue.getDate())) {
          return age - 1;
        }
        return age;
      };

      const calculatedAge = calculateAge(birthDate);

      const petData: any = {
        name: petName,
        type: petType,
        breed: breed === 'Autre' ? (customBreed || 'Non précisée') : (breed || 'Non précisée'),
        age: calculatedAge,
        weight: parseFloat(weight) || 0,
        emoji,
        ownerId: user.id,
        gender: gender || 'Non précisé',
        birthDate: birthDate.toISOString(),
        identification: identification.trim() || null,
        avatarUrl,
      };

      // Ajouter vetId et vetName seulement s'ils existent (Firebase n'accepte pas undefined)
      if (selectedVet?.id) {
        petData.vetId = selectedVet.id;
        petData.vetName = `Dr. ${selectedVet.firstName} ${selectedVet.lastName}`;
      }

      await addPet(petData);

      // 2. Marquer l'onboarding comme terminé
      await updateUserProfile(user.id, {
        onboardingCompleted: true,
      });

      // 3. Rafraîchir les animaux
      await refreshPets();
      
      // 4. Afficher le modal de consentement RGPD
      setIsLoading(false);
      setShowCookieConsent(true);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Erreur', 'Impossible de terminer la configuration. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  const handleCookieConsent = async (preferences: CookiePreferences) => {
    if (!user) return;
    
    try {
      // Sauvegarder le consentement
      await saveConsent(preferences, user.id);
      console.log('✅ Consentement sauvegardé:', preferences);
      
      // Fermer le modal
      setShowCookieConsent(false);
      
      // Naviguer vers l'application
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('Error saving consent:', error);
      // Continuer même en cas d'erreur
      setShowCookieConsent(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  };

  const handleDeclineCookies = async () => {
    if (!user) return;
    
    // Sauvegarder uniquement les cookies essentiels
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      personalization: false,
      marketing: false,
    };
    
    await handleCookieConsent(essentialOnly);
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Ajoutez votre premier animal</Text>
        <Text style={styles.stepSubtitle}>
          Pour profiter pleinement de PetCare+, commencez par ajouter votre compagnon
        </Text>
      </View>

      <View style={styles.imageContainer}>
        <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.petImage} />
          ) : (
            <>
              <Ionicons name="camera" size={40} color={colors.navy} />
              <Text style={styles.imageText}>Ajouter une photo</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.imageNote}>Optionnel - Vous pourrez l'ajouter plus tard</Text>
      </View>

      <View style={styles.formContainer}>
        <Input
          label="Nom de l'animal *"
          value={petName}
          onChangeText={setPetName}
          placeholder="Ex: Max, Bella, Kitty..."
        />
        
        <CustomPicker
          value={species}
          onValueChange={setSpecies}
          options={PET_SPECIES}
          placeholder="Sélectionnez une espèce"
          searchable
          icon="paw"
        />
        
        <CustomPicker
          value={breed}
          onValueChange={setBreed}
          options={getAvailableBreeds()}
          placeholder={species ? "Sélectionnez une race" : "Sélectionnez d'abord une espèce"}
          searchable
          icon="ribbon"
          disabled={!species}
        />
        
        {breed === 'Autre' && (
          <Input
            label="Précisez la race *"
            value={customBreed}
            onChangeText={setCustomBreed}
            placeholder="Ex: Labradoodle, Croisé..."
          />
        )}
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date de naissance *</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.dateInputContainer}>
              <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
              <input
                type="date"
                value={birthDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    setBirthDate(newDate);
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.navy,
                  outline: 'none',
                  padding: '8px 0',
                }}
              />
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.dateInputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
              <Text style={styles.dateText}>
                {birthDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
          )}
          <Text style={styles.helperText}>
            Âge calculé: {(() => {
              const today = new Date();
              const age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              return (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age;
            })()} an(s)
          </Text>
        </View>
        
        {showDatePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <Input
          label="Numéro d'identification (puce/tatouage)"
          value={identification}
          onChangeText={setIdentification}
          placeholder="Ex: 250269812345678 (15 chiffres) ou ABC123"
          autoCapitalize="characters"
        />
        {identification.trim() && (
          <Text style={styles.helperText}>
            {/^[0-9]{15}$/.test(identification.trim()) ? (
              '✓ Puce électronique valide'
            ) : /^[A-Z0-9]{3,}$/.test(identification.trim().toUpperCase()) ? (
              '✓ Tatouage valide'
            ) : (
              'ℹ️ Puce: 15 chiffres | Tatouage: lettres et chiffres'
            )}
          </Text>
        )}
        
        <View style={styles.rowInputs}>
          <View style={{ flex: 1 }}>
            <Input
              label="Poids (kg)"
              value={weight}
              onChangeText={setWeight}
              placeholder="5"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <CustomPicker
              value={gender}
              onValueChange={setGender}
              options={GENDER_OPTIONS}
              placeholder="Sexe"
              icon="male-female"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Choisissez un vétérinaire</Text>
        <Text style={styles.stepSubtitle}>
          Optionnel - Vous pourrez en ajouter un plus tard
        </Text>
      </View>

      {selectedVet ? (
        <View style={styles.selectedVetCard}>
          <View style={styles.vetIconContainer}>
            <Ionicons name="medical" size={24} color={colors.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedVetName}>Dr. {selectedVet.firstName} {selectedVet.lastName}</Text>
            {selectedVet.specialty && <Text style={styles.selectedVetSpecialty}>{selectedVet.specialty}</Text>}
            {selectedVet.clinicName && <Text style={styles.selectedVetClinic}>📍 {selectedVet.clinicName}</Text>}
          </View>
          <TouchableOpacity onPress={() => setSelectedVet(null)}>
            <Ionicons name="close-circle" size={24} color={colors.gray} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.selectVetButton} onPress={() => setShowVetModal(true)}>
          <Ionicons name="add-circle" size={32} color={colors.teal} />
          <Text style={styles.selectVetText}>Sélectionner un vétérinaire</Text>
        </TouchableOpacity>
      )}

      <View style={styles.vetInfoBox}>
        <Ionicons name="information-circle" size={20} color={colors.teal} />
        <Text style={styles.vetInfoText}>
          Choisir un vétérinaire permet de partager facilement les informations de santé de votre animal
        </Text>
      </View>

      {/* Modal de sélection */}
      <Modal visible={showVetModal} transparent animationType="slide" onRequestClose={() => setShowVetModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.vetModal}>
            <View style={styles.vetModalHeader}>
              <Text style={styles.vetModalTitle}>Choisir un vétérinaire</Text>
              <TouchableOpacity onPress={() => setShowVetModal(false)}>
                <Ionicons name="close" size={28} color={colors.navy} />
              </TouchableOpacity>
            </View>

            {isLoadingVets ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.teal} />
              </View>
            ) : vets.length === 0 ? (
              <View style={styles.noVetsContainer}>
                <Ionicons name="medical-outline" size={60} color={colors.gray} />
                <Text style={styles.noVetsText}>Aucun vétérinaire disponible</Text>
              </View>
            ) : (
              <ScrollView style={styles.vetsList}>
                {vets.map((vet) => (
                  <TouchableOpacity
                    key={vet.id}
                    style={styles.vetItem}
                    onPress={() => {
                      setSelectedVet(vet);
                      setShowVetModal(false);
                    }}
                  >
                    <View style={styles.vetItemIcon}>
                      <Ionicons name="medical" size={24} color={colors.teal} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.vetItemName}>Dr. {vet.firstName} {vet.lastName}</Text>
                      {vet.specialty && <Text style={styles.vetItemSpecialty}>{vet.specialty}</Text>}
                      {vet.clinicName && <Text style={styles.vetItemClinic}>📍 {vet.clinicName}</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.celebrationContainer}>
        <View style={styles.celebrationIcon}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
        </View>
        <Text style={styles.celebrationTitle}>Tout est prêt !</Text>
        <Text style={styles.celebrationSubtitle}>
          Votre profil est configuré. Vous pouvez maintenant profiter de toutes les fonctionnalités de PetCare+
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Ionicons name="paw" size={24} color={colors.teal} />
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryLabel}>Animal ajouté</Text>
              <Text style={styles.summaryValue}>{petName}</Text>
            </View>
          </View>
          {selectedVet && (
            <View style={styles.summaryItem}>
              <Ionicons name="medical" size={24} color={colors.navy} />
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>Vétérinaire</Text>
                <Text style={styles.summaryValue}>Dr. {selectedVet.firstName} {selectedVet.lastName}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
          <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
          <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
          <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
          <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]} />
        </View>
        <Text style={styles.stepIndicator}>Étape {step} sur 3</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {step < 3 ? (
          <>
            {step === 2 && (
              <Button
                title="Passer cette étape"
                onPress={handleSkipVet}
                variant="light"
                style={styles.skipButton}
              />
            )}
            <Button
              title={step === 2 ? "Continuer" : "Suivant"}
              onPress={handleNextStep}
              variant="primary"
              loading={isLoading}
            />
          </>
        ) : (
          <Button
            title="Commencer à utiliser PetCare+"
            onPress={handleFinish}
            variant="primary"
            loading={isLoading}
          />
        )}
      </View>

      {/* Modal de consentement RGPD */}
      <CookieConsentModal
        visible={showCookieConsent}
        onAcceptAll={handleCookieConsent}
        onAcceptSelected={handleCookieConsent}
        onDecline={handleDeclineCookies}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      overflow: 'hidden',
    } : {}),
  },
  header: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.lightGray,
  },
  progressDotActive: {
    backgroundColor: colors.teal,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.lightGray,
    marginHorizontal: spacing.xs,
  },
  progressLineActive: {
    backgroundColor: colors.teal,
  },
  stepIndicator: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    ...(Platform.OS === 'web' ? {
      overflow: 'auto',
      height: '100%',
    } : {}),
  },
  stepContent: {
    padding: spacing.xl,
  },
  stepHeader: {
    marginBottom: spacing.xl,
  },
  stepTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    lineHeight: 22,
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
  },
  imageText: {
    fontSize: typography.fontSize.xs,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
    marginTop: spacing.xs,
  },
  imageNote: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  petImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  formContainer: {
    gap: spacing.md,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  dateText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  selectVetButton: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.teal,
    borderStyle: 'dashed',
  },
  selectVetText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  selectedVetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  vetIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedVetName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  selectedVetSpecialty: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: 2,
  },
  selectedVetClinic: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: 2,
  },
  vetInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  vetInfoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
  },
  celebrationContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  celebrationIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  celebrationEmoji: {
    fontSize: 64,
  },
  celebrationTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  celebrationSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  summaryValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  footer: {
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    gap: spacing.sm,
  },
  skipButton: {
    marginBottom: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  vetModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '70%',
    paddingTop: spacing.lg,
  },
  vetModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  vetModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  noVetsContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  noVetsText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.md,
  },
  vetsList: {
    padding: spacing.lg,
  },
  vetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.lightBlue,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  vetItemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vetItemName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  vetItemSpecialty: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: 2,
  },
  vetItemClinic: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: 2,
  },
});

