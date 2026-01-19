import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { updatePet, getPetsByOwnerId, Pet, getVetSchedule, VetSchedule } from '../../services/firestoreService';
import { PremiumBadge } from '../../components';

interface VetDetailsScreenProps {
  navigation: any;
  route: any;
}

export const VetDetailsScreen: React.FC<VetDetailsScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { vet } = route.params;
  
  console.log('🏥 VetDetailsScreen chargé');
  console.log('📋 Vétérinaire:', vet?.firstName, vet?.lastName);
  console.log('👤 Utilisateur:', user?.id, user?.email);
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [vetSchedule, setVetSchedule] = useState<VetSchedule | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);

  // Charger les animaux du propriétaire
  const loadPets = React.useCallback(async () => {
    if (!user?.id || user.role !== 'owner') {
      console.log('⚠️ Utilisateur non propriétaire ou ID manquant');
      setIsLoadingPets(false);
      return;
    }

    try {
      console.log('🔄 Chargement des animaux pour:', user.email);
      setIsLoadingPets(true);
      const userPets = await getPetsByOwnerId(user.id);
      console.log('✅ Animaux chargés:', userPets.length);
      console.log('📦 Détails des animaux:', userPets);
      setPets(userPets);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des animaux:', error);
    } finally {
      setIsLoadingPets(false);
    }
  }, [user?.id, user?.role, user?.email]);

  // Charger les horaires du vétérinaire
  const loadVetSchedule = React.useCallback(async () => {
    if (!vet?.id) {
      console.log('⚠️ Pas d\'ID vétérinaire');
      setIsLoadingSchedule(false);
      return;
    }

    try {
      console.log('📅 Chargement des horaires pour le vétérinaire:', vet.id);
      setIsLoadingSchedule(true);
      const schedule = await getVetSchedule(vet.id);
      console.log('✅ Horaires chargés:', schedule);
      setVetSchedule(schedule);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des horaires:', error);
      setVetSchedule(null);
    } finally {
      setIsLoadingSchedule(false);
    }
  }, [vet?.id]);

  // Charger les animaux au montage et quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 VetDetailsScreen: Focus - Chargement des animaux...');
      loadPets();
      loadVetSchedule();
    }, [loadPets, loadVetSchedule])
  );

  useEffect(() => {
    // Pré-sélectionner les animaux qui ont déjà ce vétérinaire
    if (pets && pets.length > 0) {
      console.log('🔍 Vérification des animaux déjà assignés à ce vétérinaire...');
      const petsWithThisVet = pets
        .filter(pet => pet.vetId === vet.id)
        .map(pet => pet.id);
      setSelectedPets(petsWithThisVet);
      console.log('✅ Animaux pré-sélectionnés:', petsWithThisVet.length);
      console.log('📋 IDs pré-sélectionnés:', petsWithThisVet);
    }
  }, [pets, vet.id]);

  const togglePetSelection = (petId: string) => {
    setSelectedPets(prev => 
      prev.includes(petId)
        ? prev.filter(id => id !== petId)
        : [...prev, petId]
    );
  };

  // Formater les horaires pour l'affichage
  const formatSchedule = () => {
    if (!vetSchedule) return 'Non renseigné';

    const dayNames: { [key: string]: string } = {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mer',
      thursday: 'Jeu',
      friday: 'Ven',
      saturday: 'Sam',
      sunday: 'Dim',
    };

    const enabledDays = Object.keys(dayNames).filter(
      (day) => vetSchedule[day as keyof VetSchedule]?.enabled
    );

    if (enabledDays.length === 0) return 'Fermé';

    // Grouper les jours consécutifs avec les mêmes horaires
    const schedule: string[] = [];
    let currentGroup: string[] = [];
    let currentHours = '';

    enabledDays.forEach((day, index) => {
      const daySchedule = vetSchedule[day as keyof VetSchedule] as any;
      const hours = `${daySchedule.start}-${daySchedule.end}`;

      if (hours === currentHours) {
        currentGroup.push(dayNames[day]);
      } else {
        if (currentGroup.length > 0) {
          const groupStr = currentGroup.length > 1 
            ? `${currentGroup[0]}-${currentGroup[currentGroup.length - 1]}`
            : currentGroup[0];
          schedule.push(`${groupStr}: ${currentHours}`);
        }
        currentGroup = [dayNames[day]];
        currentHours = hours;
      }

      if (index === enabledDays.length - 1) {
        const groupStr = currentGroup.length > 1 
          ? `${currentGroup[0]}-${currentGroup[currentGroup.length - 1]}`
          : currentGroup[0];
        schedule.push(`${groupStr}: ${currentHours}`);
      }
    });

    return schedule.join(', ');
  };

  // Compter les dates d'astreinte futures
  const getUpcomingOnCallCount = () => {
    if (!vetSchedule?.onCallDates || vetSchedule.onCallDates.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return vetSchedule.onCallDates.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= today;
    }).length;
  };

  const handleAssignVet = async () => {
    if (selectedPets.length === 0) {
      Alert.alert(
        'Aucun animal sélectionné',
        'Veuillez sélectionner au moins un animal pour assigner ce vétérinaire.'
      );
      return;
    }

    setIsAssigning(true);
    try {
      const vetFullName = `${vet.firstName} ${vet.lastName}`;
      
      // Mettre à jour tous les animaux sélectionnés
      const updatePromises = pets?.map(async (pet) => {
        if (selectedPets.includes(pet.id)) {
          // Assigner le vétérinaire
          await updatePet(pet.id, {
            vetId: vet.id,
            vetName: vetFullName,
          });
        } else if (pet.vetId === vet.id) {
          // Retirer le vétérinaire si décoché
          await updatePet(pet.id, {
            vetId: null,
            vetName: null,
          });
        }
      }) || [];

      await Promise.all(updatePromises);
      
      // Rafraîchir les données
      await loadPets();

      Alert.alert(
        'Succès',
        `Dr. ${vetFullName} a été assigné à ${selectedPets.length} animal(aux).`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error assigning vet:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'assigner le vétérinaire. Veuillez réessayer.'
      );
    } finally {
      setIsAssigning(false);
    }
  };

  if (!vet) {
    console.error('❌ Aucun vétérinaire dans route.params');
    console.error('📋 route.params:', route.params);
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.gray} />
          <Text style={styles.errorText}>Vétérinaire introuvable</Text>
          <Text style={styles.errorSubtext}>Impossible de charger les informations du vétérinaire</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Détails du vétérinaire</Text>
        <View style={styles.spacer} />
      </View>

      {/* Vet Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {vet.avatarUrl ? (
            <Image 
              source={{ uri: vet.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={60} color={colors.white} />
            </View>
          )}
        </View>
        
        <View style={styles.vetNameContainer}>
          <Text style={styles.vetName}>Dr. {`${vet.firstName} ${vet.lastName}`}</Text>
          {vet.isPremiumPartner && (
            <PremiumBadge size="small" showText={false} />
          )}
        </View>
        <Text style={styles.specialty}>{vet.specialty || 'Vétérinaire'}</Text>

        {/* Rating */}
        {vet.rating && (
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons 
                key={star} 
                name={star <= Math.floor(vet.rating || 0) ? "star" : "star-outline"} 
                size={20} 
                color="#FFB347" 
              />
            ))}
            <Text style={styles.ratingText}>
              {vet.rating.toFixed(1)}{vet.reviewsCount ? ` (${vet.reviewsCount} avis)` : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations de contact</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={colors.teal} />
            <Text style={styles.infoText}>{vet.clinicAddress || vet.location || 'Non renseigné'}</Text>
          </View>
          {vet.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={colors.teal} />
              <Text style={styles.infoText}>{vet.phone}</Text>
            </View>
          )}
          {vet.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color={colors.teal} />
              <Text style={styles.infoText}>{vet.email}</Text>
            </View>
          )}
          {vet.clinicName && (
            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color={colors.teal} />
              <Text style={styles.infoText}>{vet.clinicName}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tarifs & Horaires */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tarifs & Disponibilité</Text>
        {isLoadingSchedule ? (
          <View style={styles.infoCard}>
            <ActivityIndicator size="small" color={colors.teal} />
            <Text style={styles.loadingText}>Chargement des horaires...</Text>
          </View>
        ) : (
          <View style={styles.infoCard}>
            {/* Prix de consultation */}
            {(vet.consultationRate || vetSchedule?.consultationRate) && (
              <View style={styles.infoRow}>
                <Ionicons name="cash" size={20} color={colors.teal} />
                <Text style={styles.infoText}>
                  Consultation: {vetSchedule?.consultationRate || vet.consultationRate}€
                </Text>
              </View>
            )}

            {/* Durée des consultations */}
            {vetSchedule?.appointmentDuration && (
              <View style={styles.infoRow}>
                <Ionicons name="hourglass" size={20} color={colors.teal} />
                <Text style={styles.infoText}>
                  Durée: {vetSchedule.appointmentDuration === 60 ? '1 heure' : `${vetSchedule.appointmentDuration} min`}
                </Text>
              </View>
            )}

            {/* Horaires d'ouverture */}
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color={colors.teal} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoText}>{formatSchedule()}</Text>
              </View>
            </View>

            {/* Astreintes de nuit */}
            {vetSchedule?.onCallDates && vetSchedule.onCallDates.length > 0 && (
              <View style={styles.infoRow}>
                <Ionicons name="moon" size={20} color="#FFB347" />
                <Text style={styles.infoText}>
                  {getUpcomingOnCallCount()} nuit{getUpcomingOnCallCount() > 1 ? 's' : ''} d'astreinte à venir
                </Text>
              </View>
            )}

            {/* Nouveaux patients */}
            {vetSchedule?.acceptNewPatients !== undefined && (
              <View style={styles.infoRow}>
                <Ionicons 
                  name={vetSchedule.acceptNewPatients ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={vetSchedule.acceptNewPatients ? "#4CAF50" : "#FF6B6B"} 
                />
                <Text style={[
                  styles.infoText,
                  vetSchedule.acceptNewPatients ? styles.acceptingText : styles.notAcceptingText
                ]}>
                  {vetSchedule.acceptNewPatients 
                    ? 'Accepte de nouveaux patients' 
                    : 'N\'accepte pas de nouveaux patients'}
                </Text>
              </View>
            )}

            {/* Urgences (si disponible dans le profil) */}
            {vet.emergencyAvailable && (
              <View style={styles.infoRow}>
                <Ionicons name="alert-circle" size={20} color="#FF9800" />
                <Text style={[styles.infoText, styles.emergencyText]}>
                  Urgences disponibles 24/7
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Assign to Pets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assigner à mes animaux</Text>
        <Text style={styles.sectionSubtitle}>
          Sélectionnez les animaux pour lesquels vous souhaitez choisir ce vétérinaire
        </Text>

        {isLoadingPets ? (
          <View style={styles.noPetsContainer}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={styles.noPetsText}>Chargement de vos animaux...</Text>
          </View>
        ) : !pets || pets.length === 0 ? (
          <View style={styles.noPetsContainer}>
            <Ionicons name="paw" size={48} color={colors.gray} />
            <Text style={styles.noPetsText}>Aucun animal trouvé</Text>
            <Text style={styles.noPetsSubtext}>
              Ajoutez d'abord un animal depuis votre homepage pour pouvoir l'assigner à un vétérinaire.
            </Text>
            <TouchableOpacity 
              style={styles.addPetButton}
              onPress={() => {
                console.log('🔙 Retour à la liste des vétérinaires');
                navigation.goBack();
              }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
              <Text style={styles.addPetButtonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.petsContainer}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.petCard,
                  selectedPets.includes(pet.id) && styles.petCardSelected,
                ]}
                onPress={() => togglePetSelection(pet.id)}
                activeOpacity={0.7}
              >
                <View style={styles.petCardLeft}>
                  {pet.avatarUrl ? (
                    <Image 
                      source={{ uri: pet.avatarUrl }}
                      style={styles.petAvatar}
                    />
                  ) : (
                    <View style={styles.petEmojiContainer}>
                      <Text style={styles.petEmoji}>{pet.emoji || '🐾'}</Text>
                    </View>
                  )}
                  <View style={styles.petInfo}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petBreed}>{pet.breed}</Text>
                  </View>
                </View>
                <View style={[
                  styles.checkbox,
                  selectedPets.includes(pet.id) && styles.checkboxSelected,
                ]}>
                  {selectedPets.includes(pet.id) && (
                    <Ionicons name="checkmark" size={20} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Assign Button */}
      {pets && pets.length > 0 && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.assignButton,
              (selectedPets.length === 0 || isAssigning) && styles.assignButtonDisabled,
            ]}
            onPress={handleAssignVet}
            disabled={selectedPets.length === 0 || isAssigning}
          >
            {isAssigning ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                <Text style={styles.assignButtonText}>
                  {selectedPets.length === 0 ? 'Sélectionnez au moins un animal' : `Assigner à ${selectedPets.length} animal(aux)`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: spacing.xs,
  },
  screenTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  spacer: {
    width: 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.teal,
  },
  avatarPlaceholder: {
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vetNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  vetName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  specialty: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginLeft: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoText: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
    flex: 1,
  },
  emergencyText: {
    color: '#FF9800',
    fontWeight: typography.fontWeight.semiBold,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  acceptingText: {
    color: '#4CAF50',
    fontWeight: typography.fontWeight.semiBold,
  },
  notAcceptingText: {
    color: '#FF6B6B',
    fontWeight: typography.fontWeight.semiBold,
  },
  petsContainer: {
    gap: spacing.md,
  },
  petCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petCardSelected: {
    backgroundColor: '#E0F7F4',
    borderColor: colors.teal,
  },
  petCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  petAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  petEmojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petEmoji: {
    fontSize: 28,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  petBreed: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  noPetsContainer: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  noPetsText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  noPetsSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  addPetButton: {
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addPetButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  actionContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  assignButton: {
    backgroundColor: colors.teal,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.5,
  },
  assignButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  errorSubtext: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  errorButton: {
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  errorButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
});

