import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, Platform, Alert, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getPetById, deletePet, updatePet, getVets, createPetAssignmentRequest, addNotification, getAssignmentRequestsByOwnerId, cancelAssignmentRequest } from '../../services/firestoreService';
import { PremiumBadge, InAppAlert } from '../../components';

interface PetProfileScreenProps {
  navigation: any;
}

export const PetProfileScreen: React.FC<PetProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentPet: contextPet, user, refreshPets } = useAuth();
  const [pet, setPet] = useState(contextPet);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVetModal, setShowVetModal] = useState(false);
  const [vets, setVets] = useState<any[]>([]);
  const [isLoadingVets, setIsLoadingVets] = useState(false);
  const [isSavingVet, setIsSavingVet] = useState(false);
  const [vetSearchQuery, setVetSearchQuery] = useState('');
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  
  // États pour l'alert in-app
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
    showCancel?: boolean;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Recharger le pet depuis Firebase quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      const loadPetData = async () => {
        if (!contextPet?.id || !user?.id) return;
        
        try {
          console.log('🔄 Rechargement du profil de l\'animal:', contextPet.name);
          setIsLoading(true);
          
          // Charger les données du pet et les demandes en attente en parallèle
          const [updatedPet, requests] = await Promise.all([
            getPetById(contextPet.id),
            getAssignmentRequestsByOwnerId(user.id)
          ]);
          
          if (updatedPet) {
            console.log('✅ Données rafraîchies pour:', updatedPet.name);
            console.log('🏥 Vétérinaire:', updatedPet.vetName || 'Aucun');
            setPet(updatedPet);
            
            // Vérifier s'il y a une demande en attente pour cet animal
            const petPendingRequest = requests.find(
              r => r.petId === updatedPet.id && r.status === 'pending'
            );
            console.log('📝 Demande en attente:', petPendingRequest ? 'Oui' : 'Non');
            setPendingRequest(petPendingRequest || null);
          }
        } catch (error) {
          console.error('❌ Erreur lors du rechargement du pet:', error);
          // En cas d'erreur, garder les données du contexte
          setPet(contextPet);
        } finally {
          setIsLoading(false);
        }
      };

      loadPetData();
    }, [contextPet?.id, contextPet?.name, user?.id])
  );

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPetText}>{t('profile.petProfile.noPet')}</Text>
      </View>
    );
  }

  // Fonction pour obtenir la clé de traduction du genre
  const getGenderKey = (gender: string) => {
    const normalized = gender.toLowerCase().trim();
    // Supporter différentes variations
    if (normalized === 'male' || normalized === 'mâle') return 'male';
    if (normalized === 'female' || normalized === 'femelle') return 'femelle';
    return normalized;
  };

  // Helper pour afficher les alertes
  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    onConfirm?: () => void,
    showCancel: boolean = false
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm,
      showCancel,
    });
  };

  const closeAlert = () => {
    setAlert({
      visible: false,
      title: '',
      message: '',
      type: 'info',
    });
  };

  const handleDeletePet = () => {
    console.log('🗑️ Demande de suppression de l\'animal:', pet?.name);
    setShowDeleteModal(true);
  };

  const confirmDeletePet = async () => {
    if (!pet?.id) return;

    console.log('🗑️ Suppression confirmée pour:', pet.name);
    setShowDeleteModal(false);
    setIsDeleting(true);

    try {
      console.log('📝 Suppression de l\'animal dans Firestore...');
      await deletePet(pet.id);
      console.log('✅ Animal supprimé avec succès');

      // Rafraîchir la liste des animaux
      await refreshPets();
      console.log('✅ Liste des animaux rafraîchie');

      // Rediriger vers la HomePage
      console.log('🏠 Redirection vers HomePage...');
      navigation.navigate('HomeTab', { screen: 'Home' });
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      setIsDeleting(false);
      showAlert(
        'Erreur',
        'Impossible de supprimer l\'animal. Veuillez réessayer.',
        'error'
      );
    }
  };

  const handleSelectVet = () => {
    console.log('🏥 Ouverture de la sélection du vétérinaire');
    setShowVetModal(true);
    loadVets();
  };

  const loadVets = async () => {
    try {
      setIsLoadingVets(true);
      console.log('🔍 Chargement des vétérinaires...');
      const vetsList = await getVets();
      console.log('✅ Vétérinaires chargés:', vetsList.length);
      setVets(vetsList);
    } catch (error) {
      console.error('❌ Erreur chargement vétérinaires:', error);
      showAlert(
        'Erreur',
        'Impossible de charger les vétérinaires',
        'error'
      );
    } finally {
      setIsLoadingVets(false);
    }
  };

  const assignVet = async (vet: any) => {
    if (!pet?.id || !user?.id) return;

    try {
      setIsSavingVet(true);
      console.log('📝 Création demande d\'assignation du vétérinaire:', vet.firstName, vet.lastName);

      // Si une demande est déjà en attente, l'annuler d'abord
      if (pendingRequest && pendingRequest.status === 'pending') {
        console.log('🚫 Annulation de l\'ancienne demande en attente');
        await cancelAssignmentRequest(pendingRequest.id);
      }

      // Créer une demande d'assignation au lieu d'assigner directement
      const requestId = await createPetAssignmentRequest({
        petId: pet.id,
        petName: pet.name,
        petType: pet.type,
        petBreed: pet.breed,
        petAvatar: pet.avatarUrl || pet.emoji,
        ownerId: user.id,
        ownerName: `${user.firstName} ${user.lastName}`,
        vetId: vet.id,
        vetName: `${vet.firstName} ${vet.lastName}`,
      });

      // Créer une notification pour le vétérinaire
      await addNotification({
        userId: vet.id,
        type: 'pet_assignment_request',
        title: 'Nouvelle demande de prise en charge',
        message: `${user.firstName} ${user.lastName} souhaite vous confier ${pet.name} (${pet.type})`,
        read: false,
        data: {
          requestId,
          petId: pet.id,
          petName: pet.name,
          ownerId: user.id,
          ownerName: `${user.firstName} ${user.lastName}`,
        },
      });

      console.log('✅ Demande d\'assignation créée avec succès');

      // Stocker temporairement la demande en attente
      setPendingRequest({
        id: requestId,
        petId: pet.id,
        vetId: vet.id,
        vetName: `Dr. ${vet.firstName} ${vet.lastName}`,
        status: 'pending',
      });

      // Fermer la modale
      setShowVetModal(false);
      setVetSearchQuery('');

      // Message de succès
      showAlert(
        'Demande envoyée ! 📩',
        `Une demande a été envoyée à Dr. ${vet.firstName} ${vet.lastName}. Vous serez notifié(e) de sa réponse.`,
        'success'
      );

      // Recharger les demandes pour afficher le statut "en attente"
      if (user?.id) {
        const requests = await getAssignmentRequestsByOwnerId(user.id);
        const petPendingRequest = requests.find(
          r => r.petId === pet.id && r.status === 'pending'
        );
        setPendingRequest(petPendingRequest || null);
      }
    } catch (error) {
      console.error('❌ Erreur création demande:', error);
      showAlert(
        'Erreur',
        'Impossible d\'envoyer la demande. Veuillez réessayer.',
        'error'
      );
    } finally {
      setIsSavingVet(false);
    }
  };

  const removeVet = () => {
    if (!pet?.id) return;

    showAlert(
      'Confirmer',
      'Êtes-vous sûr de vouloir retirer le vétérinaire attitré ?',
      'warning',
      async () => {
        try {
          console.log('🗑️ Retrait du vétérinaire attitré');

          // Mettre à jour l'animal sans vétérinaire
          await updatePet(pet.id, {
            vetId: undefined,
            vetName: undefined,
          });

          console.log('✅ Vétérinaire retiré avec succès');

          // Mettre à jour l'état local
          setPet({
            ...pet,
            vetId: undefined,
            vetName: undefined,
          });

          // Effacer la demande en attente si elle existe
          setPendingRequest(null);

          // Message de succès
          showAlert(
            'Succès',
            'Le vétérinaire attitré a été retiré',
            'success'
          );

          // Rafraîchir les données
          await refreshPets();
        } catch (error) {
          console.error('❌ Erreur retrait vétérinaire:', error);
          showAlert(
            'Erreur',
            'Impossible de retirer le vétérinaire. Veuillez réessayer.',
            'error'
          );
        }
      },
      true // showCancel = true
    );
  };

  // Filtrer les vétérinaires selon la recherche
  const filteredVets = vets.filter(vet => {
    if (!vetSearchQuery.trim()) return true;
    const query = vetSearchQuery.toLowerCase();
    return (
      vet.firstName?.toLowerCase().includes(query) ||
      vet.lastName?.toLowerCase().includes(query) ||
      vet.clinicName?.toLowerCase().includes(query) ||
      vet.location?.toLowerCase().includes(query)
    );
  });

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color={colors.navy} />
      </TouchableOpacity>

      <View style={styles.petImageContainer}>
        {pet.avatarUrl ? (
          <Image 
            source={{ uri: pet.avatarUrl }} 
            style={styles.petImage}
            key={pet.avatarUrl}
            onError={(error) => {
              console.error('❌ Erreur chargement image profil:', pet.name, error);
            }}
            onLoad={() => {
              console.log('✅ Image profil chargée:', pet.name);
            }}
          />
        ) : (
          <View style={styles.petImagePlaceholder}>
            <Text style={styles.placeholderText}>{pet.imageEmoji || pet.emoji || '🐾'}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.petName}>{pet.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={18} color={colors.black} />
          <Text style={styles.location}>{pet.location}</Text>
        </View>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t(`profile.petProfile.${getGenderKey(pet.gender)}`)}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{`${pet.age} ${t('profile.petProfile.years')}`}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pet.weight}kg</Text>
          </View>
        </View>

        {/* Vétérinaire attitré */}
        {pet.vetId && pet.vetName ? (
          <View style={styles.vetSection}>
            <View style={styles.vetHeader}>
              <Ionicons name="medkit" size={24} color={colors.teal} />
              <Text style={styles.vetTitle}>Vétérinaire attitré</Text>
            </View>
            <View style={styles.vetCard}>
              <View style={styles.vetIconCircle}>
                <Ionicons name="person" size={28} color={colors.white} />
              </View>
              <View style={styles.vetInfo}>
                <Text style={styles.vetName}>{`Dr. ${pet.vetName}`}</Text>
                <Text style={styles.vetLabel}>Vétérinaire traitant</Text>
              </View>
              <TouchableOpacity 
                style={styles.vetCallButton}
                onPress={() => {
                  // Navigation vers la liste des vétérinaires pour voir les détails
                  navigation.getParent()?.navigate('SearchTab', { screen: 'Emergency' });
                }}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.vetActions}>
              <TouchableOpacity
                style={[styles.vetActionButton, styles.changeVetButton]}
                onPress={handleSelectVet}
              >
                <Ionicons name="swap-horizontal" size={18} color={colors.teal} />
                <Text style={styles.changeVetButtonText}>Changer de vétérinaire</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.vetActionButton, styles.removeVetButton]}
                onPress={removeVet}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text style={styles.removeVetButtonText}>Retirer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : pendingRequest ? (
          <View style={styles.vetSection}>
            <View style={styles.vetHeader}>
              <Ionicons name="time" size={24} color={colors.orange} />
              <Text style={[styles.vetTitle, { color: colors.orange }]}>Demande en attente</Text>
            </View>
            <View style={[styles.vetCard, styles.pendingVetCard]}>
              <View style={[styles.vetIconCircle, { backgroundColor: colors.orange }]}>
                <Ionicons name="hourglass" size={28} color={colors.white} />
              </View>
              <View style={styles.vetInfo}>
                <Text style={styles.vetName}>{pendingRequest.vetName}</Text>
                <Text style={styles.pendingLabel}>En attente de validation</Text>
              </View>
              <View style={styles.pendingBadge}>
                <Ionicons name="time-outline" size={16} color={colors.orange} />
              </View>
            </View>
            <View style={styles.pendingInfo}>
              <Ionicons name="information-circle" size={18} color={colors.gray} />
              <Text style={styles.pendingInfoText}>
                Vous serez notifié(e) dès que le vétérinaire acceptera ou refusera votre demande.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noVetSection}>
            <Ionicons name="medkit-outline" size={32} color={colors.gray} />
            <Text style={styles.noVetText}>Aucun vétérinaire attitré</Text>
            <Text style={styles.noVetSubtext}>
              Choisissez un vétérinaire pour faciliter la gestion des soins de {pet.name}
            </Text>
            <TouchableOpacity
              style={styles.addVetButton}
              onPress={handleSelectVet}
            >
              <Ionicons name="add-circle" size={20} color={colors.white} />
              <Text style={styles.addVetButtonText}>Choisir un vétérinaire</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Vaccinations')}
        >
          <Text style={styles.buttonText}>{t('profile.petProfile.myVaccinations')}</Text>
          <View style={styles.buttonArrow}>
            <Ionicons name="chevron-forward" size={25} color={colors.white} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('PetHealthRecord', { pet })}
        >
          <Text style={styles.buttonText}>{t('profile.petProfile.myHealthRecord')}</Text>
          <View style={styles.buttonArrow}>
            <Ionicons name="chevron-forward" size={25} color={colors.white} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Documents')}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>{t('profile.petProfile.myDocuments')}</Text>
            <Ionicons name="paw" size={20} color={colors.white} />
          </View>
          <View style={styles.buttonArrow}>
            <Ionicons name="chevron-forward" size={25} color={colors.white} />
          </View>
        </TouchableOpacity>

        {/* Premium Features */}
        {user?.isPremium && (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.premiumButton]}
              onPress={() => navigation.navigate('WellnessTracking')}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="trending-up" size={20} color={colors.white} />
                <Text style={styles.buttonText}>Suivi Bien-être</Text>
                <PremiumBadge size="small" showText={false} />
              </View>
              <View style={styles.buttonArrow}>
                <Ionicons name="chevron-forward" size={25} color={colors.white} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.premiumButton]}
              onPress={() => navigation.navigate('SharePet', { pet })}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="share-social" size={20} color={colors.white} />
                <Text style={styles.buttonText}>Partager le carnet</Text>
                <PremiumBadge size="small" showText={false} />
              </View>
              <View style={styles.buttonArrow}>
                <Ionicons name="chevron-forward" size={25} color={colors.white} />
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Bouton de suppression */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeletePet}
          disabled={isDeleting}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          <Text style={styles.deleteButtonText}>Supprimer cet animal</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmation de suppression */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalIcon}>
              <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
            </View>
            
            <Text style={styles.modalTitle}>⚠️ Supprimer {pet?.name} ?</Text>
            <Text style={styles.modalMessage}>
              Cette action est irréversible. Toutes les données de {pet?.name} (vaccinations, documents, historique de santé) seront définitivement supprimées.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={confirmDeletePet}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalConfirmText}>Supprimer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de sélection du vétérinaire */}
      <Modal
        visible={showVetModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.vetModalContent}>
            <View style={styles.vetModalHeader}>
              <Text style={styles.vetModalTitle}>Choisir un vétérinaire</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowVetModal(false);
                  setVetSearchQuery('');
                }}
              >
                <Ionicons name="close-circle" size={32} color={colors.gray} />
              </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un vétérinaire..."
                value={vetSearchQuery}
                onChangeText={setVetSearchQuery}
                placeholderTextColor={colors.gray}
              />
              {vetSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setVetSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.gray} />
                </TouchableOpacity>
              )}
            </View>

            {/* Liste des vétérinaires */}
            <ScrollView style={styles.vetList} showsVerticalScrollIndicator={false}>
              {isLoadingVets ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.teal} />
                  <Text style={styles.loadingText}>Chargement des vétérinaires...</Text>
                </View>
              ) : filteredVets.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="sad-outline" size={64} color={colors.gray} />
                  <Text style={styles.emptyText}>
                    {vetSearchQuery ? 'Aucun vétérinaire trouvé' : 'Aucun vétérinaire disponible'}
                  </Text>
                  {vetSearchQuery && (
                    <Text style={styles.emptySubtext}>
                      Essayez une autre recherche
                    </Text>
                  )}
                </View>
              ) : (
                filteredVets.map((vet) => (
                  <TouchableOpacity
                    key={vet.id}
                    style={[
                      styles.vetItem,
                      pet.vetId === vet.id && styles.vetItemSelected,
                    ]}
                    onPress={() => assignVet(vet)}
                    disabled={isSavingVet}
                  >
                    <View style={styles.vetItemIconCircle}>
                      <Ionicons name="person" size={24} color={colors.teal} />
                    </View>
                    <View style={styles.vetItemInfo}>
                      <Text style={styles.vetItemName}>
                        Dr. {vet.firstName} {vet.lastName}
                      </Text>
                      {vet.clinicName && (
                        <Text style={styles.vetItemClinic}>{vet.clinicName}</Text>
                      )}
                      {vet.location && (
                        <View style={styles.vetItemLocation}>
                          <Ionicons name="location" size={14} color={colors.gray} />
                          <Text style={styles.vetItemLocationText}>{vet.location}</Text>
                        </View>
                      )}
                    </View>
                    {pet.vetId === vet.id ? (
                      <View style={styles.vetItemCheck}>
                        <Ionicons name="checkmark-circle" size={28} color={colors.teal} />
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={24} color={colors.gray} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {isSavingVet && (
              <View style={styles.savingOverlay}>
                <ActivityIndicator size="large" color={colors.white} />
                <Text style={styles.savingText}>Enregistrement...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Alert in-app */}
      <InAppAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={closeAlert}
        onConfirm={alert.onConfirm}
        showCancel={alert.showCancel}
        confirmText="OK"
        cancelText="Annuler"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl * 2, // Espace en bas pour éviter l'overflow
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  petImageContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  petImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  placeholderText: {
    fontSize: 80,
  },
  infoCard: {
    backgroundColor: colors.lightBlue,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  petName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  location: {
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  badge: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  button: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  buttonArrow: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumButton: {
    backgroundColor: '#FFB300',
  },
  noPetText: {
    fontSize: typography.fontSize.lg,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  // Styles pour le vétérinaire attitré
  vetSection: {
    width: '100%',
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  vetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  vetTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  vetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  vetIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vetInfo: {
    flex: 1,
  },
  vetName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  vetLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  vetCallButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVetSection: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderStyle: 'dashed',
  },
  noVetText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  noVetSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  // Styles pour le bouton de suppression
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B20',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  deleteButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: '#FF6B6B',
  },
  // Styles pour le modal de suppression
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
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
    alignItems: 'center',
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.lightGray,
  },
  modalCancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
  },
  modalConfirmButton: {
    backgroundColor: '#FF6B6B',
  },
  modalConfirmText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  // Styles pour les actions vétérinaire
  vetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  vetActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  changeVetButton: {
    backgroundColor: colors.lightBlue,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  changeVetButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
  },
  removeVetButton: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: colors.error,
  },
  removeVetButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.error,
  },
  addVetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  addVetButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  // Styles pour la demande en attente
  pendingVetCard: {
    backgroundColor: '#FFF3E0', // Orange clair
    borderWidth: 1,
    borderColor: colors.orange,
  },
  pendingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.orange,
    fontWeight: typography.fontWeight.semiBold,
  },
  pendingBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  pendingInfoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    lineHeight: 20,
  },
  // Styles pour la modale de sélection du vétérinaire
  vetModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '80%',
    marginTop: 'auto',
    padding: spacing.lg,
  },
  vetModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  vetModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    height: 48,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.navy,
    paddingVertical: spacing.sm,
  },
  vetList: {
    flex: 1,
  },
  vetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  vetItemSelected: {
    borderColor: colors.teal,
    borderWidth: 2,
    backgroundColor: colors.lightBlue,
  },
  vetItemIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vetItemInfo: {
    flex: 1,
  },
  vetItemName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  vetItemClinic: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xxs,
  },
  vetItemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  vetItemLocationText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  vetItemCheck: {
    marginLeft: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  savingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
});

