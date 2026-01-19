import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button, Input, CustomPicker } from '../../components';
import { addPet, getVets, createPetAssignmentRequest, addNotification } from '../../services/firestoreService';
import { uploadPetImage } from '../../services/imageUploadService';
import { useAuth } from '../../context/AuthContext';
import { PET_SPECIES, PET_BREEDS, GENDER_OPTIONS, STERILIZATION_STATUS } from '../../data/petSpeciesAndBreeds';

interface AddPetScreenProps {
  navigation: any;
}

interface Vet {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  clinicName?: string;
  location?: string;
}

export const AddPetScreen: React.FC<AddPetScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, refreshPets } = useAuth();
  
  // Informations de base
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [customBreed, setCustomBreed] = useState('');
  const [gender, setGender] = useState('');
  const [identification, setIdentification] = useState('');
  
  // Date de naissance
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Données de santé
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [sterilizationStatus, setSterilizationStatus] = useState('');
  
  // Photo
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Vétérinaires
  const [vets, setVets] = useState<Vet[]>([]);
  const [selectedVet, setSelectedVet] = useState<Vet | null>(null);
  const [showVetModal, setShowVetModal] = useState(false);
  const [isLoadingVets, setIsLoadingVets] = useState(false);

  // Charger les vétérinaires au montage
  useEffect(() => {
    loadVets();
  }, []);

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

  const loadVets = async () => {
    try {
      setIsLoadingVets(true);
      const vetsList = await getVets();
      setVets(vetsList as Vet[]);
    } catch (error) {
      console.error('Error loading vets:', error);
    } finally {
      setIsLoadingVets(false);
    }
  };

  const calculateAge = (birthDateValue: Date): number => {
    const today = new Date();
    const age = today.getFullYear() - birthDateValue.getFullYear();
    const monthDiff = today.getMonth() - birthDateValue.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateValue.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à vos photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à la caméra.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  const showImageOptions = () => {
    console.log('📸 showImageOptions called');
    setShowPhotoModal(true);
  };

  const handlePickImage = () => {
    console.log('🖼️ handlePickImage called');
    setShowPhotoModal(false);
    pickImage();
  };

  const handleTakePhoto = () => {
    console.log('📷 handleTakePhoto called');
    setShowPhotoModal(false);
    takePhoto();
  };

  const getEmojiForSpecies = (speciesValue: string): string => {
    const emojiMap: Record<string, string> = {
      dog: '🐕',
      cat: '🐈',
      rabbit: '🐰',
      rodent: '🐹',
      bird: '🐦',
      horse: '🐴',
      pony: '🐴',
      donkey: '🐴',
      fish: '🐟',
      reptile: '🦎',
      amphibian: '🐸',
      ferret: '🦡',
      goat: '🐐',
      sheep: '🐑',
      pig: '🐷',
      cattle: '🐄',
      poultry: '🐔',
      llama_alpaca: '🦙',
      ostrich_emu: '🦤',
    };
    return emojiMap[speciesValue] || '🐾';
  };

  const handleSave = async () => {
    // Empêcher les clics multiples
    if (isLoading || saveSuccess) {
      return;
    }

    // Validation
    if (!petName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez entrer un nom pour votre animal');
      } else {
        Alert.alert('Erreur', 'Veuillez entrer un nom pour votre animal');
      }
      return;
    }

    if (!species) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez sélectionner une espèce');
      } else {
        Alert.alert('Erreur', 'Veuillez sélectionner une espèce');
      }
      return;
    }

    if (!breed) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez sélectionner une race');
      } else {
        Alert.alert('Erreur', 'Veuillez sélectionner une race');
      }
      return;
    }

    if (!gender) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez sélectionner le sexe');
      } else {
        Alert.alert('Erreur', 'Veuillez sélectionner le sexe');
      }
      return;
    }

    if (!user) {
      if (Platform.OS === 'web') {
        window.alert('Utilisateur non authentifié');
      } else {
        Alert.alert('Erreur', 'Utilisateur non authentifié');
      }
      return;
    }

    setIsLoading(true);
    try {
      let avatarUrl = null;

      // Upload de l'image si une image a été sélectionnée
      if (imageUri) {
        console.log('📸 Début upload de l\'image...');
        console.log('📸 Image URI:', imageUri);
        console.log('📸 User ID:', user.id);
        try {
          setIsUploadingImage(true);
          avatarUrl = await uploadPetImage(imageUri, user.id);
          console.log('✅ Image uploaded successfully!');
          console.log('✅ Avatar URL:', avatarUrl);
          
          if (!avatarUrl) {
            console.error('❌ PROBLÈME: avatarUrl est null malgré succès upload!');
          }
        } catch (uploadError: any) {
          console.error('❌ Error uploading image:', uploadError);
          console.error('❌ Error message:', uploadError?.message);
          console.error('❌ Error stack:', uploadError?.stack);
          // Afficher une alerte à l'utilisateur
          if (Platform.OS === 'web') {
            window.alert('La photo n\'a pas pu être uploadée. L\'animal sera créé sans photo.');
          } else {
            Alert.alert(
              'Photo non uploadée',
              'La photo n\'a pas pu être uploadée. L\'animal sera créé sans photo.',
              [{ text: 'OK' }]
            );
          }
        } finally {
          setIsUploadingImage(false);
        }
      } else {
        console.log('📸 Pas d\'image sélectionnée');
      }

      const age = calculateAge(birthDate);
      const emoji = getEmojiForSpecies(species);

      const petData: any = {
        name: petName.trim(),
        type: species,
        breed: breed === 'Autre' ? (customBreed || 'Non précisée') : breed,
        gender: gender,
        identification: identification.trim() || null,
        birthDate: birthDate.toISOString(),
        age: age,
        weight: parseFloat(weight) || 0,
        height: parseFloat(height) || 0,
        sterilizationStatus: sterilizationStatus || 'unknown',
        emoji,
        ownerId: user.id,
        avatarUrl,
      };

      // NE PAS assigner directement le vétérinaire - créer une demande d'approbation à la place

      console.log('📦 Données animal à sauvegarder:', petData);
      console.log('📦 avatarUrl dans petData:', petData.avatarUrl);
      
      const petId = await addPet(petData);
      console.log('✅ Animal ajouté avec succès:', petData.name, 'ID:', petId);

      // Si un vétérinaire a été sélectionné, créer une demande d'assignation
      if (selectedVet?.id && petId) {
        console.log('📝 Création demande d\'assignation pour vétérinaire:', selectedVet.firstName, selectedVet.lastName);
        
        try {
          const requestId = await createPetAssignmentRequest({
            petId: petId,
            petName: petData.name,
            petType: petData.type,
            petBreed: petData.breed,
            petAvatar: petData.avatarUrl || petData.emoji,
            ownerId: user.id,
            ownerName: `${user.firstName} ${user.lastName}`,
            vetId: selectedVet.id,
            vetName: `${selectedVet.firstName} ${selectedVet.lastName}`,
          });

          // Créer une notification pour le vétérinaire
          await addNotification({
            userId: selectedVet.id,
            type: 'pet_assignment_request',
            title: 'Nouvelle demande de prise en charge',
            message: `${user.firstName} ${user.lastName} souhaite vous confier ${petData.name} (${petData.type})`,
            read: false,
            data: {
              requestId,
              petId: petId,
              petName: petData.name,
              ownerId: user.id,
              ownerName: `${user.firstName} ${user.lastName}`,
            },
          });

          console.log('✅ Demande d\'assignation créée avec succès');
        } catch (vetError) {
          console.error('❌ Erreur création demande vétérinaire:', vetError);
          // Ne pas bloquer la création de l'animal si la demande échoue
        }
      }

      // Rafraîchir la liste des animaux dans le contexte
      console.log('🔄 Rafraîchissement de la liste des animaux...');
      await refreshPets();
      console.log('✅ Liste des animaux rafraîchie');

      // Afficher le succès visuellement
      setSaveSuccess(true);
      setIsLoading(false);

      // Rediriger vers la HomePage après 1 seconde
      setTimeout(() => {
        console.log('🏠 Redirection vers HomePage...');
        navigation.navigate('HomeTab', { screen: 'Home' });
      }, 1000);
    } catch (error) {
      console.error('❌ Error adding pet:', error);
      setIsLoading(false);
      if (Platform.OS === 'web') {
        window.alert('Impossible d\'ajouter l\'animal. Veuillez réessayer.');
      } else {
        Alert.alert('Erreur', 'Impossible d\'ajouter l\'animal. Veuillez réessayer.');
      }
    }
  };

  const availableBreeds = species ? PET_BREEDS[species] || [] : [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Ajouter un animal</Text>
        </View>

        <View style={styles.content}>
          {/* Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity 
              style={styles.imagePlaceholder}
              onPress={showImageOptions}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.petImage} />
              ) : (
                <View style={styles.imageEmpty}>
                  <Ionicons name="camera" size={50} color={colors.teal} />
                  <Text style={styles.imageText}>Ajouter une photo</Text>
                  <Text style={styles.imageSubtext}>Appuyez pour choisir</Text>
                </View>
              )}
              {imageUri && (
                <View style={styles.editPhotoButton}>
                  <Ionicons name="pencil" size={16} color={colors.white} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Informations de base */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color={colors.teal} />
              <Text style={styles.sectionTitle}>Informations de base</Text>
            </View>
            
            {/* Nom */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom *</Text>
              <Input
                value={petName}
                onChangeText={setPetName}
                placeholder="Ex: Max"
              />
            </View>

            {/* Espèce */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Espèce *</Text>
              <CustomPicker
                value={species}
                onValueChange={setSpecies}
                options={PET_SPECIES}
                placeholder="Sélectionner une espèce"
                searchable
                icon="paw"
              />
            </View>

            {/* Race */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Race *</Text>
              <CustomPicker
                value={breed}
                onValueChange={setBreed}
                options={availableBreeds}
                placeholder="Sélectionner une race"
                disabled={!species || availableBreeds.length === 0}
                searchable
                icon="ribbon"
              />
              {!species && (
                <Text style={styles.helperText}>Sélectionnez d'abord une espèce</Text>
              )}
            </View>

            {/* Champ de saisie manuelle pour race "Autre" */}
            {breed === 'Autre' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Précisez la race *</Text>
                <Input
                  value={customBreed}
                  onChangeText={setCustomBreed}
                  placeholder="Ex: Labradoodle, Croisé..."
                />
              </View>
            )}

            {/* Sexe */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sexe *</Text>
              <CustomPicker
                value={gender}
                onValueChange={setGender}
                options={GENDER_OPTIONS}
                placeholder="Sélectionner le sexe"
                icon="male-female"
              />
            </View>

            {/* Identification */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro d'identification (puce/tatouage)</Text>
              <Input
                value={identification}
                onChangeText={setIdentification}
                placeholder="Ex: 250269812345678 (15 chiffres) ou ABC123"
                keyboardType="default"
                autoCapitalize="characters"
              />
              <Text style={styles.helperText}>
                {identification.trim() ? (
                  /^[0-9]{15}$/.test(identification.trim()) ? (
                    '✓ Puce électronique valide'
                  ) : /^[A-Z0-9]{3,}$/.test(identification.trim().toUpperCase()) ? (
                    '✓ Tatouage valide'
                  ) : (
                    'ℹ️ Puce: 15 chiffres | Tatouage: lettres et chiffres'
                  )
                ) : (
                  'Optionnel - Puce électronique ou tatouage'
                )}
              </Text>
            </View>

            {/* Date de naissance */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date de naissance</Text>
              {Platform.OS === 'web' ? (
                <View style={styles.dateButton}>
                  <View style={styles.dateButtonContent}>
                    <Ionicons name="calendar" size={20} color={colors.teal} style={styles.dateIcon} />
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
                      }}
                    />
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.dateButtonContent}>
                    <Ionicons name="calendar" size={20} color={colors.teal} style={styles.dateIcon} />
                    <Text style={styles.dateText}>
                      {birthDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color={colors.teal} />
                </TouchableOpacity>
              )}
              <View style={styles.ageIndicator}>
                <Ionicons name="time" size={14} color={colors.gray} />
                <Text style={styles.helperText}>Âge calculé: {calculateAge(birthDate)} an(s)</Text>
              </View>
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
          </View>

          {/* Données de santé */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fitness" size={24} color={colors.teal} />
              <Text style={styles.sectionTitle}>Données de santé</Text>
            </View>
            
            {/* Poids */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Poids (kg)</Text>
              <Input
                value={weight}
                onChangeText={setWeight}
                placeholder="Ex: 15"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Taille */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Taille (cm)</Text>
              <Input
                value={height}
                onChangeText={setHeight}
                placeholder="Ex: 45"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Stérilisation */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Statut de stérilisation</Text>
              <CustomPicker
                value={sterilizationStatus}
                onValueChange={setSterilizationStatus}
                options={STERILIZATION_STATUS}
                placeholder="Sélectionner"
                icon="cut"
              />
            </View>
          </View>

          {/* Vétérinaire */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={24} color={colors.teal} />
              <Text style={styles.sectionTitle}>Vétérinaire</Text>
              <Text style={styles.optionalBadge}>Optionnel</Text>
            </View>
            
            <TouchableOpacity
              style={styles.vetSelector}
              onPress={() => setShowVetModal(true)}
            >
              <View style={styles.vetSelectorContent}>
                <Ionicons 
                  name={selectedVet ? "checkmark-circle" : "person-circle"} 
                  size={24} 
                  color={selectedVet ? colors.teal : colors.gray} 
                />
                <Text style={[
                  styles.vetSelectorText,
                  !selectedVet && styles.vetSelectorPlaceholder
                ]}>
                  {selectedVet 
                    ? `Dr. ${selectedVet.firstName} ${selectedVet.lastName}` 
                    : 'Sélectionner un vétérinaire'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </TouchableOpacity>
          </View>

          {/* Bouton Enregistrer */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading || isUploadingImage || saveSuccess}
            style={[
              styles.saveButton,
              saveSuccess && styles.saveButtonSuccess,
              (isLoading || isUploadingImage || saveSuccess) && styles.saveButtonDisabled
            ]}
            activeOpacity={0.8}
          >
            {saveSuccess ? (
              <>
                <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                <Text style={styles.saveButtonText}>Animal ajouté !</Text>
              </>
            ) : isLoading ? (
              <>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.saveButtonText}>Enregistrement...</Text>
              </>
            ) : (
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de sélection du vétérinaire */}
      <Modal
        visible={showVetModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir un vétérinaire</Text>
              <TouchableOpacity onPress={() => setShowVetModal(false)}>
                <Ionicons name="close" size={28} color={colors.navy} />
              </TouchableOpacity>
            </View>

            {isLoadingVets ? (
              <ActivityIndicator size="large" color={colors.teal} style={styles.loader} />
            ) : (
              <ScrollView style={styles.vetList}>
                <TouchableOpacity
                  style={[styles.vetItem, !selectedVet && styles.vetItemSelected]}
                  onPress={() => {
                    setSelectedVet(null);
                    setShowVetModal(false);
                  }}
                >
                  <Ionicons name="close-circle" size={24} color={colors.gray} />
                  <View style={styles.vetItemInfo}>
                    <Text style={styles.vetItemName}>Aucun vétérinaire</Text>
                  </View>
                </TouchableOpacity>

                {vets.map((vet) => (
                  <TouchableOpacity
                    key={vet.id}
                    style={[styles.vetItem, selectedVet?.id === vet.id && styles.vetItemSelected]}
                    onPress={() => {
                      setSelectedVet(vet);
                      setShowVetModal(false);
                    }}
                  >
                    <Ionicons name="person-circle" size={24} color={colors.teal} />
                    <View style={styles.vetItemInfo}>
                      <Text style={styles.vetItemName}>
                        Dr. {vet.firstName} {vet.lastName}
                      </Text>
                      {vet.specialty && (
                        <Text style={styles.vetItemSpecialty}>{vet.specialty}</Text>
                      )}
                      {vet.clinicName && (
                        <Text style={styles.vetItemClinic}>{vet.clinicName}</Text>
                      )}
                    </View>
                    {selectedVet?.id === vet.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.teal} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal pour choisir la photo */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <TouchableOpacity 
          style={styles.photoModalOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoModal(false)}
        >
          <View style={styles.photoModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.photoModalTitle}>Photo de l'animal</Text>
            <Text style={styles.photoModalSubtitle}>Choisissez une option</Text>
            
            {Platform.OS !== 'web' && (
              <TouchableOpacity 
                style={styles.photoModalButton}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera" size={24} color={colors.teal} />
                <Text style={styles.photoModalButtonText}>Prendre une photo</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.photoModalButton}
              onPress={handlePickImage}
            >
              <Ionicons name="images" size={24} color={colors.teal} />
              <Text style={styles.photoModalButtonText}>Choisir dans la galerie</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.photoModalButton, styles.photoModalCancelButton]}
              onPress={() => setShowPhotoModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.gray} />
              <Text style={[styles.photoModalButtonText, styles.photoModalCancelText]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  header: {
    backgroundColor: colors.navy,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  content: {
    padding: spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  imagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.lightBlue,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  imageEmpty: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  imageText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
  },
  imageSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    flex: 1,
  },
  optionalBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 52,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateIcon: {
    marginRight: spacing.sm,
  },
  dateText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    flex: 1,
  },
  ageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  vetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 52,
  },
  vetSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  vetSelectorText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    flex: 1,
  },
  vetSelectorPlaceholder: {
    color: colors.gray,
    fontWeight: typography.fontWeight.medium,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  saveButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: spacing.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  loader: {
    marginVertical: spacing.xxl,
  },
  vetList: {
    paddingHorizontal: spacing.xl,
  },
  vetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  vetItemSelected: {
    backgroundColor: colors.teal + '20',
    borderWidth: 2,
    borderColor: colors.teal,
  },
  vetItemInfo: {
    flex: 1,
  },
  vetItemName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  vetItemSpecialty: {
    fontSize: typography.fontSize.sm,
    color: colors.teal,
  },
  vetItemClinic: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  // Styles pour le modal photo
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  photoModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  photoModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  photoModalSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  photoModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  photoModalButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    flex: 1,
  },
  photoModalCancelButton: {
    backgroundColor: colors.lightGray,
    marginTop: spacing.sm,
  },
  photoModalCancelText: {
    color: colors.gray,
  },
});
