import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getPetById, deletePet } from '../../services/firestoreService';
import { PremiumBadge } from '../../components';

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

  // Recharger le pet depuis Firebase quand on revient sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      const loadPetData = async () => {
        if (!contextPet?.id) return;
        
        try {
          console.log('🔄 Rechargement du profil de l\'animal:', contextPet.name);
          setIsLoading(true);
          const updatedPet = await getPetById(contextPet.id);
          if (updatedPet) {
            console.log('✅ Données rafraîchies pour:', updatedPet.name);
            console.log('🏥 Vétérinaire:', updatedPet.vetName || 'Aucun');
            setPet(updatedPet);
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
    }, [contextPet?.id, contextPet?.name])
  );

  // Mettre à jour l'état local quand le contexte change
  useEffect(() => {
    if (contextPet) {
      setPet(contextPet);
    }
  }, [contextPet]);

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
      if (Platform.OS === 'web') {
        window.alert('Impossible de supprimer l\'animal. Veuillez réessayer.');
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer l\'animal. Veuillez réessayer.');
      }
    }
  };

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
        {pet.vetId && pet.vetName && (
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
          </View>
        )}

        {!pet.vetId && (
          <View style={styles.noVetSection}>
            <Ionicons name="medkit-outline" size={32} color={colors.gray} />
            <Text style={styles.noVetText}>Aucun vétérinaire attitré</Text>
            <Text style={styles.noVetSubtext}>
              Vous pouvez assigner un vétérinaire depuis la liste des vétérinaires
            </Text>
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
});

