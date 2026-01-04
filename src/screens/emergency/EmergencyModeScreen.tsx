import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import {
  getCurrentLocation,
  findNearbyVetClinics,
  callEmergencyContact,
  openDirections,
  shareLocation,
  shareEmergencyData,
  prepareEmergencyData,
  reportClinicError,
  EmergencyContact,
} from '../../services/emergencyService';
import { LinearGradient } from 'expo-linear-gradient';

interface EmergencyModeScreenProps {
  navigation: any;
}

export const EmergencyModeScreen: React.FC<EmergencyModeScreenProps> = ({ navigation }) => {
  const { user, pets } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [nearbyClinics, setNearbyClinics] = useState<EmergencyContact[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<EmergencyContact | null>(null);
  const [showPetSelector, setShowPetSelector] = useState(false);

  useEffect(() => {
    loadEmergencyData();
  }, []);

  const loadEmergencyData = async () => {
    try {
      setIsLoading(true);
      
      // Obtenir la position actuelle
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
        
        // Trouver les cliniques à proximité
        const clinics = await findNearbyVetClinics(location, 20); // 20km de rayon
        setNearbyClinics(clinics);
      } else {
        Alert.alert(
          'Position non disponible',
          'Impossible d\'obtenir votre position. Les cliniques seront affichées sans distance.'
        );
      }
    } catch (error) {
      console.error('Error loading emergency data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données d\'urgence');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallClinic = (clinic: EmergencyContact) => {
    setSelectedClinic(clinic);
    callEmergencyContact(clinic);
  };

  const handleSharePetData = (clinic: EmergencyContact) => {
    if (!pets || pets.length === 0) {
      Alert.alert('Aucun animal', 'Vous n\'avez pas d\'animal enregistré');
      return;
    }

    if (pets.length === 1) {
      const emergencyData = prepareEmergencyData(pets[0]);
      shareEmergencyData(emergencyData, clinic, 'sms');
    } else {
      setSelectedClinic(clinic);
      setShowPetSelector(true);
    }
  };

  const handleSelectPet = (petIndex: number) => {
    if (selectedClinic && pets && pets[petIndex]) {
      const emergencyData = prepareEmergencyData(pets[petIndex]);
      shareEmergencyData(emergencyData, selectedClinic, 'sms');
      setShowPetSelector(false);
      setSelectedClinic(null);
    }
  };

  const handleReportError = (clinic: EmergencyContact) => {
    Alert.alert(
      'Signaler une erreur',
      `Que souhaitez-vous signaler pour ${clinic.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Numéro incorrect', onPress: () => reportClinicError(clinic.id, 'phone', 'Numéro incorrect') },
        { text: 'Adresse incorrecte', onPress: () => reportClinicError(clinic.id, 'address', 'Adresse incorrecte') },
        { text: 'Horaires incorrects', onPress: () => reportClinicError(clinic.id, 'hours', 'Horaires incorrects') },
        { text: 'Autre', onPress: () => reportClinicError(clinic.id, 'other', 'Autre erreur') },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={styles.loadingText}>Recherche des cliniques d'urgence...</Text>
        <Text style={styles.loadingSubtext}>Géolocalisation en cours</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header d'urgence avec gradient rouge */}
      <LinearGradient
        colors={['#D32F2F', '#B71C1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emergencyHeader}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color={colors.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="warning" size={40} color={colors.white} />
          </View>
          <Text style={styles.emergencyTitle}>MODE URGENCE</Text>
          <Text style={styles.emergencySubtitle}>
            {nearbyClinics.length} clinique{nearbyClinics.length > 1 ? 's' : ''} à proximité
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadEmergencyData}
        >
          <Ionicons name="refresh" size={24} color={colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Bannière d'avertissement */}
        <View style={styles.warningBanner}>
          <Ionicons name="information-circle" size={24} color="#F57C00" />
          <Text style={styles.warningText}>
            En cas d'urgence vitale, contactez immédiatement le vétérinaire le plus proche ou les services d'urgence.
          </Text>
        </View>

        {/* Liste des cliniques */}
        {nearbyClinics.map((clinic, index) => (
          <View key={clinic.id} style={styles.clinicCard}>
            {/* Badge "Ouvert" ou "Fermé" */}
            <View style={[styles.statusBadge, clinic.isOpen ? styles.openBadge : styles.closedBadge]}>
              <View style={[styles.statusDot, clinic.isOpen ? styles.openDot : styles.closedDot]} />
              <Text style={styles.statusText}>{clinic.isOpen ? 'OUVERT' : 'FERMÉ'}</Text>
            </View>

            {/* Informations de la clinique */}
            <View style={styles.clinicHeader}>
              <View style={styles.clinicNumberBadge}>
                <Text style={styles.clinicNumber}>{index + 1}</Text>
              </View>
              <View style={styles.clinicInfo}>
                <Text style={styles.clinicName}>{clinic.name}</Text>
                {clinic.specialty && (
                  <Text style={styles.clinicSpecialty}>{clinic.specialty}</Text>
                )}
                {clinic.rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFB300" />
                    <Text style={styles.ratingText}>{clinic.rating}/5</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Adresse */}
            <View style={styles.clinicDetail}>
              <Ionicons name="location" size={20} color={colors.red} />
              <Text style={styles.detailText}>{clinic.address}</Text>
            </View>

            {/* Distance et durée */}
            {clinic.distance && (
              <View style={styles.clinicDetail}>
                <MaterialIcons name="straighten" size={20} color={colors.red} />
                <Text style={styles.detailText}>
                  {clinic.distance} km • {clinic.duration} min en voiture
                </Text>
              </View>
            )}

            {/* Horaires */}
            {clinic.openingHours && (
              <View style={styles.clinicDetail}>
                <Ionicons name="time" size={20} color={colors.red} />
                <Text style={styles.detailText}>{clinic.openingHours}</Text>
              </View>
            )}

            {/* Boutons d'action */}
            <View style={styles.actionButtons}>
              {/* Appeler */}
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={() => handleCallClinic(clinic)}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={24} color={colors.white} />
                <Text style={styles.actionButtonText}>Appeler</Text>
              </TouchableOpacity>

              {/* Itinéraire */}
              <TouchableOpacity
                style={[styles.actionButton, styles.directionButton]}
                onPress={() => openDirections(clinic)}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate" size={24} color={colors.white} />
                <Text style={styles.actionButtonText}>Itinéraire</Text>
              </TouchableOpacity>
            </View>

            {/* Boutons secondaires */}
            <View style={styles.secondaryButtons}>
              {/* Partager données */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleSharePetData(clinic)}
              >
                <Ionicons name="document-text" size={18} color={colors.navy} />
                <Text style={styles.secondaryButtonText}>Envoyer dossier</Text>
              </TouchableOpacity>

              {/* Partager position */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => shareLocation(clinic)}
              >
                <Ionicons name="location-sharp" size={18} color={colors.navy} />
                <Text style={styles.secondaryButtonText}>Ma position</Text>
              </TouchableOpacity>

              {/* Signaler erreur */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleReportError(clinic)}
              >
                <Ionicons name="flag" size={18} color={colors.gray} />
                <Text style={[styles.secondaryButtonText, { color: colors.gray }]}>Signaler</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Message si aucune clinique */}
        {nearbyClinics.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="sad-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>Aucune clinique trouvée</Text>
            <Text style={styles.emptyText}>
              Impossible de trouver des cliniques vétérinaires à proximité. Vérifiez votre connexion internet et réessayez.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadEmergencyData}>
              <Ionicons name="refresh" size={24} color={colors.white} />
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal de sélection d'animal */}
      <Modal
        visible={showPetSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPetSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quel animal souhaitez-vous signaler ?</Text>
            
            <ScrollView style={styles.petList}>
              {pets && pets.map((pet, index) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petItem}
                  onPress={() => handleSelectPet(index)}
                >
                  <Text style={styles.petEmoji}>{pet.emoji || '🐾'}</Text>
                  <View style={styles.petItemInfo}>
                    <Text style={styles.petItemName}>{pet.name}</Text>
                    <Text style={styles.petItemDetails}>
                      {pet.type} • {pet.breed} • {pet.age} an(s)
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={colors.gray} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowPetSelector(false);
                setSelectedClinic(null);
              }}
            >
              <Text style={styles.modalCloseButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emergencyHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    marginBottom: spacing.md,
  },
  refreshButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : spacing.xl,
    right: spacing.xl,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emergencyTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 1,
  },
  emergencySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#F57C00',
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: '#E65100',
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  clinicCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  openBadge: {
    backgroundColor: '#E8F5E9',
  },
  closedBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  openDot: {
    backgroundColor: '#4CAF50',
  },
  closedDot: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  clinicHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  clinicNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.red,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  clinicNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  clinicInfo: {
    flex: 1,
    paddingRight: 80, // Pour éviter le badge "Ouvert/Fermé"
  },
  clinicName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  clinicSpecialty: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
  },
  clinicDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  detailText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  callButton: {
    backgroundColor: colors.red,
  },
  directionButton: {
    backgroundColor: colors.navy,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lightBlue,
    gap: spacing.xs,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.red,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  retryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  petList: {
    maxHeight: 300,
    paddingHorizontal: spacing.xl,
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  petEmoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  petItemInfo: {
    flex: 1,
  },
  petItemName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  petItemDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  modalCloseButton: {
    backgroundColor: colors.lightGray,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
});

