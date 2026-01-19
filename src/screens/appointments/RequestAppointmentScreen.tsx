import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getVets, createAppointment } from '../../services/firestoreService';
import { CustomPicker } from '../../components';
import { sendNewAppointmentRequestNotification } from '../../services/notificationService';

interface RequestAppointmentScreenProps {
  navigation: any;
  route: any;
}

export const RequestAppointmentScreen: React.FC<RequestAppointmentScreenProps> = ({
  navigation,
  route,
}) => {
  const { user, pets } = useAuth();
  const preselectedVetId = route.params?.vetId;

  const [vets, setVets] = useState<any[]>([]);
  const [selectedVetId, setSelectedVetId] = useState(preselectedVetId || '');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoadingVets, setIsLoadingVets] = useState(true);

  // Réinitialiser la sélection d'animal quand on change de vétérinaire
  useEffect(() => {
    if (selectedVetId && selectedPetId) {
      const selectedPet = pets.find(p => p.id === selectedPetId);
      // Si l'animal sélectionné n'est pas lié au vétérinaire, réinitialiser
      if (selectedPet && selectedPet.vetId !== selectedVetId) {
        console.log('⚠️ Animal non compatible avec le vétérinaire sélectionné, réinitialisation');
        setSelectedPetId('');
      }
    }
  }, [selectedVetId]);

  useEffect(() => {
    loadVets();
  }, [pets]);

  const loadVets = async () => {
    try {
      setIsLoadingVets(true);
      
      // Récupérer tous les vétérinaires
      const allVets = await getVets();
      
      // Extraire les IDs uniques des vétérinaires liés aux animaux du propriétaire
      const linkedVetIds = new Set(
        pets
          .filter(pet => pet.vetId) // Uniquement les animaux avec un vétérinaire attitré
          .map(pet => pet.vetId)
      );
      
      console.log('🐾 Animaux du propriétaire:', pets.length);
      console.log('🏥 Vétérinaires liés aux animaux:', Array.from(linkedVetIds));
      
      // Filtrer uniquement les vétérinaires liés
      const linkedVets = allVets.filter(vet => linkedVetIds.has(vet.id));
      
      console.log('✅ Vétérinaires disponibles pour RDV:', linkedVets.length);
      
      if (linkedVets.length === 0) {
        console.log('⚠️ Aucun vétérinaire lié trouvé');
        console.log('💡 Les animaux doivent avoir un vétérinaire attitré (vetId)');
      }
      
      setVets(linkedVets);
    } catch (error) {
      console.error('❌ Error loading vets:', error);
    } finally {
      setIsLoadingVets(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedVetId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un vétérinaire');
      return;
    }

    if (!selectedPetId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un animal');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer la raison de la consultation');
      return;
    }

    if (!date) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date');
      return;
    }

    if (!time) {
      Alert.alert('Erreur', 'Veuillez sélectionner une heure');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    try {
      setIsLoading(true);

      const selectedVet = vets.find(v => v.id === selectedVetId);
      const selectedPet = pets.find(p => p.id === selectedPetId);

      if (!selectedVet || !selectedPet) {
        throw new Error('Vétérinaire ou animal non trouvé');
      }

      const appointmentData = {
        vetId: selectedVetId,
        vetName: `Dr. ${selectedVet.firstName} ${selectedVet.lastName}`,
        ownerId: user.id,
        ownerName: `${user.firstName} ${user.lastName}`,
        petId: selectedPetId,
        petName: selectedPet.name,
        date,
        time,
        type: reason.trim(), // Le type est la raison de la consultation
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        status: 'pending' as 'pending',
        createdAt: new Date().toISOString(),
      };
      
      console.log('📅 Création d\'un RDV avec les données:', appointmentData);
      const appointmentId = await createAppointment(appointmentData);
      console.log('✅ RDV créé avec succès, ID:', appointmentId);
      
      // Envoyer une notification au vétérinaire
      try {
        console.log('🔔 Envoi notification au vétérinaire:', selectedVetId);
        await sendNewAppointmentRequestNotification(
          selectedVetId,
          selectedPet.name,
          `${user.firstName} ${user.lastName}`,
          date,
          time,
          appointmentId
        );
        console.log('✅ Notification envoyée au vétérinaire');
      } catch (notifError) {
        console.error('⚠️ Erreur envoi notification (non bloquant):', notifError);
        // Ne pas bloquer la création du RDV si la notification échoue
      }
      
      console.log('🔙 Retour à MyAppointmentsScreen dans 2 secondes...');

      // Afficher le succès pendant 2 secondes puis revenir en arrière
      setIsLoading(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        console.log('🔙 Navigation goBack()');
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error('Error creating appointment:', error);
      setIsLoading(false);
      const message = error instanceof Error ? error.message : 'Impossible d\'envoyer la demande';
      if (Platform.OS === 'web') {
        window.alert(`Erreur: ${message}`);
      } else {
        Alert.alert('Erreur', message);
      }
    }
  };

  const selectedVet = vets.find(v => v.id === selectedVetId);
  const selectedPet = pets.find(p => p.id === selectedPetId);

  const vetOptions = vets.map(v => ({
    value: v.id,
    label: `Dr. ${v.firstName} ${v.lastName}${v.specialty ? ` - ${v.specialty}` : ''}`,
  }));

  // Filtrer les animaux en fonction du vétérinaire sélectionné
  // Si aucun vétérinaire n'est sélectionné, afficher tous les animaux
  const availablePets = selectedVetId 
    ? pets.filter(pet => pet.vetId === selectedVetId)
    : pets;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demander un rendez-vous</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Section Vétérinaire */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🩺 Vétérinaire</Text>
          
          {isLoadingVets ? (
            <ActivityIndicator size="large" color={colors.teal} />
          ) : vets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={48} color={colors.gray} />
              <Text style={styles.emptyStateText}>Aucun vétérinaire lié à vos animaux</Text>
              <Text style={styles.emptyStateSubtext}>
                Vous devez d'abord attribuer un vétérinaire à au moins un de vos animaux
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    window.alert('Allez dans le profil d\'un animal pour lui attribuer un vétérinaire');
                  } else {
                    Alert.alert(
                      'Attribuer un vétérinaire',
                      'Allez dans le profil d\'un animal pour lui attribuer un vétérinaire',
                      [
                        { text: 'OK', onPress: () => navigation.goBack() }
                      ]
                    );
                  }
                }}
              >
                <Ionicons name="information-circle" size={20} color={colors.white} />
                <Text style={styles.addButtonText}>Comment faire ?</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <CustomPicker
                value={selectedVetId}
                onValueChange={setSelectedVetId}
                options={vetOptions}
                placeholder="Sélectionner un vétérinaire"
                searchable
                icon="medical"
              />

              {selectedVet && (
                <View style={styles.selectedInfo}>
                  <Ionicons name="medical" size={20} color={colors.teal} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedInfoText}>
                      Dr. {selectedVet.firstName} {selectedVet.lastName}
                    </Text>
                    {selectedVet.specialty && (
                      <Text style={styles.selectedInfoSubtext}>{selectedVet.specialty}</Text>
                    )}
                    {selectedVet.clinicName && (
                      <Text style={styles.selectedInfoSubtext}>📍 {selectedVet.clinicName}</Text>
                    )}
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Section Animal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🐾 Animal concerné</Text>
          
          {pets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="paw-outline" size={48} color={colors.gray} />
              <Text style={styles.emptyStateText}>Aucun animal trouvé</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddPet')}
              >
                <Ionicons name="add-circle" size={20} color={colors.white} />
                <Text style={styles.addButtonText}>Ajouter un animal</Text>
              </TouchableOpacity>
            </View>
          ) : selectedVetId && availablePets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.orange} />
              <Text style={styles.emptyStateText}>Aucun animal lié à ce vétérinaire</Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedVet ? `Aucun de vos animaux n'a Dr. ${selectedVet.lastName} comme vétérinaire attitré` : ''}
              </Text>
            </View>
          ) : (
            <View style={styles.petSelectionContainer}>
              {availablePets.map(pet => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petCard,
                    selectedPetId === pet.id && styles.petCardSelected
                  ]}
                  onPress={() => setSelectedPetId(pet.id)}
                  disabled={!selectedVetId}
                >
                  {pet.avatarUrl ? (
                    <Image 
                      source={{ uri: pet.avatarUrl }} 
                      style={styles.petCardImage}
                    />
                  ) : (
                    <View style={styles.petCardEmojiContainer}>
                      <Text style={styles.petCardEmoji}>{pet.emoji || '🐾'}</Text>
                    </View>
                  )}
                  <View style={styles.petCardInfo}>
                    <Text style={styles.petCardName}>{pet.name}</Text>
                    <Text style={styles.petCardBreed}>{pet.breed}</Text>
                    {pet.vetName && (
                      <Text style={styles.petCardVet}>
                        👨‍⚕️ Dr. {pet.vetName.split(' ')[1] || pet.vetName}
                      </Text>
                    )}
                  </View>
                  {selectedPetId === pet.id && (
                    <Ionicons name="checkmark-circle" size={28} color={colors.teal} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Section Détails */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Détails de la consultation</Text>

          {/* Raison */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Raison de la consultation *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Vaccination annuelle, contrôle de routine..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              maxLength={200}
              placeholderTextColor={colors.gray}
            />
            <Text style={styles.charCount}>{reason.length}/200</Text>
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date souhaitée *</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1px solid ${colors.lightGray}`,
                  fontSize: '16px',
                  fontFamily: 'system-ui',
                }}
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder="AAAA-MM-JJ"
                value={date}
                onChangeText={setDate}
                placeholderTextColor={colors.gray}
              />
            )}
          </View>

          {/* Heure */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Heure souhaitée *</Text>
            {Platform.OS === 'web' ? (
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1px solid ${colors.lightGray}`,
                  fontSize: '16px',
                  fontFamily: 'system-ui',
                }}
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={time}
                onChangeText={setTime}
                placeholderTextColor={colors.gray}
              />
            )}
          </View>

          {/* Notes supplémentaires */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes supplémentaires (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Informations complémentaires..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholderTextColor={colors.gray}
            />
            <Text style={styles.charCount}>{notes.length}/500</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={colors.teal} />
          <Text style={styles.infoText}>
            Votre demande sera envoyée au vétérinaire qui la confirmera ou proposera un autre créneau.
          </Text>
        </View>

        {/* Bouton Envoyer */}
        <TouchableOpacity
          style={[
            styles.submitButton, 
            (isLoading || isSuccess) && styles.submitButtonDisabled,
            isSuccess && styles.submitButtonSuccess
          ]}
          onPress={handleSubmit}
          disabled={isLoading || isSuccess}
          activeOpacity={0.8}
        >
          {isSuccess ? (
            <>
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
              <Text style={styles.submitButtonText}>Demande envoyée ✓</Text>
            </>
          ) : isLoading ? (
            <>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.submitButtonText}>Envoi en cours...</Text>
            </>
          ) : (
            <>
              <Ionicons name="send" size={24} color={colors.white} />
              <Text style={styles.submitButtonText}>Envoyer la demande</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  selectedInfoEmoji: {
    fontSize: 32,
  },
  selectedPetImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGray,
  },
  selectedInfoText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  selectedInfoSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: 2,
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
  input: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.navy,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray,
  },
  submitButtonSuccess: {
    backgroundColor: '#66BB6A',
  },
  submitButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.lg,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  addButton: {
    backgroundColor: colors.teal,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  petSelectionContainer: {
    gap: spacing.md,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.lightGray,
    gap: spacing.md,
  },
  petCardSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.lightBlue,
  },
  petCardImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lightGray,
  },
  petCardEmojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petCardEmoji: {
    fontSize: 32,
  },
  petCardInfo: {
    flex: 1,
  },
  petCardName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: 2,
  },
  petCardBreed: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: 2,
  },
  petCardVet: {
    fontSize: typography.fontSize.xs,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
});

