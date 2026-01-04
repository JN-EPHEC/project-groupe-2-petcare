import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from '../../components';
import { uploadUserAvatar } from '../../services/imageUploadService';
import { updateUserProfile, getPetsByVetId } from '../../services/firestoreService';

interface VetProfileScreenProps {
  navigation: any;
}

export const VetProfileScreen: React.FC<VetProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // États pour les statistiques RÉELLES
  const [patientsCount, setPatientsCount] = useState<number | null>(null);
  const [consultationsCount, setConsultationsCount] = useState<number | null>(null);
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('N/A');
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Utiliser les VRAIES données de l'utilisateur depuis Firebase
  const vetInfo = {
    specialty: user?.specialty || 'Vétérinaire généraliste',
    experience: user?.experience || 'Non renseigné',
    clinic: user?.clinicName || 'Clinique non renseignée',
    address: user?.clinicAddress || user?.location || 'Adresse non renseignée',
    phone: user?.phone || user?.clinicPhone || 'Téléphone non renseigné',
    email: user?.email || 'Email non renseigné',
    consultationRate: user?.consultationRate || '50€',
    emergencyAvailable: user?.emergencyAvailable ?? true,
    languages: user?.languages || ['Français'],
    services: user?.services || [
      'Consultations générales',
      'Vaccinations',
    ],
  };

  // Charger les statistiques RÉELLES depuis Firebase
  const loadStats = useCallback(async () => {
    if (!user?.id) {
      setIsLoadingStats(false);
      return;
    }

    try {
      setIsLoadingStats(true);

      // 1. Compter le nombre réel de patients
      const patients = await getPetsByVetId(user.id);
      setPatientsCount(patients.length);

      // 2. Consultations - pour l'instant on met 0 (à implémenter avec appointments)
      // TODO: Quand la collection 'appointments' sera créée, compter les rendez-vous
      setConsultationsCount(0);

      // 3. Années d'expérience - extraire du champ experience s'il existe
      if (user?.experience) {
        // Si c'est au format "8 ans" ou "8", extraire le nombre
        const match = user.experience.match(/(\d+)/);
        if (match) {
          setYearsOfExperience(match[1]);
        } else {
          setYearsOfExperience('N/A');
        }
      } else if (user?.createdAt) {
        // Sinon, calculer depuis la date de création du compte
        const createdDate = new Date(user.createdAt);
        const now = new Date();
        const years = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
        setYearsOfExperience(years > 0 ? years.toString() : '<1');
      } else {
        setYearsOfExperience('N/A');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setPatientsCount(0);
      setConsultationsCount(0);
      setYearsOfExperience('N/A');
    } finally {
      setIsLoadingStats(false);
    }
  }, [user]);

  // Charger les stats au montage du composant
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleChangePhoto = () => {
    console.log('📸 handleChangePhoto called');
    setShowPhotoModal(true);
  };

  const pickImage = async (source: 'camera' | 'library') => {
    console.log('🖼️ pickImage called with source:', source);
    setShowPhotoModal(false); // Fermer le modal immédiatement
    
    try {
      // Demander les permissions
      console.log('📋 Requesting permissions...');
      const permission = source === 'camera' 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      console.log('✅ Permission result:', permission);

      if (!permission.granted) {
        console.warn('❌ Permission denied');
        Alert.alert(
          'Permission refusée',
          'Vous devez autoriser l\'accès pour changer votre photo de profil.'
        );
        return;
      }

      // Ouvrir l'image picker
      console.log('🎨 Opening image picker...');
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      console.log('📷 Image picker result:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('✅ Image selected, uploading...');
        await uploadProfilePhoto(result.assets[0].uri);
      } else {
        console.log('❌ Image selection cancelled');
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const uploadProfilePhoto = async (imageUri: string) => {
    if (!user?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    try {
      setIsUploadingPhoto(true);

      // Upload vers Firebase Storage
      const avatarUrl = await uploadUserAvatar(imageUri, user.id);

      // Mettre à jour le profil dans Firestore
      await updateUserProfile(user.id, {
        avatarUrl: avatarUrl,
      });

      Alert.alert('Succès', 'Photo de profil mise à jour !');
      
      // L'AuthContext va automatiquement mettre à jour l'affichage
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de télécharger la photo'
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Bouton déconnexion cliqué');
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    console.log('🚪 Déconnexion confirmée');
    setShowLogoutModal(false);
    
    try {
      console.log('📝 Étape 1/2 : Appel signOut()...');
      await signOut();
      console.log('✅ SignOut Firebase effectué');
      
      // Réinitialiser complètement la navigation pour revenir à Splash
      console.log('📝 Étape 2/2 : Reset navigation...');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Splash' }],
        })
      );
      console.log('✅ Navigation réinitialisée');
    } catch (error: any) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', `Impossible de se déconnecter: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>
        <View style={styles.topRightButtons}>
          <LanguageSwitcher />
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('EditVetProfile')}
          >
            <Ionicons name="create-outline" size={30} color={colors.navy} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user?.avatarUrl ? (
            <Image 
              source={{ uri: user.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={60} color={colors.gray} />
            </View>
          )}
          
          {/* Bouton pour changer la photo */}
          <TouchableOpacity 
            style={styles.changePhotoButton}
            onPress={handleChangePhoto}
            disabled={isUploadingPhoto}
          >
            {isUploadingPhoto ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="camera" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
        
        <Text style={styles.name}>Dr. {user?.firstName} {user?.lastName}</Text>
        <Text style={styles.specialty}>{vetInfo.specialty}</Text>
        <Text style={styles.experience}>{vetInfo.experience}</Text>

        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons 
              key={star} 
              name={star <= Math.floor(user?.rating || 0) ? "star" : "star-outline"} 
              size={20} 
              color="#FFB347" 
            />
          ))}
          <Text style={styles.ratingText}>
            {user?.rating ? `${user.rating.toFixed(1)}` : 'N/A'} 
            {user?.reviewsCount ? ` (${user.reviewsCount} avis)` : ''}
          </Text>
        </View>
      </View>

      {/* Quick Stats - VRAIES DONNÉES */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {isLoadingStats ? '...' : (patientsCount ?? '0')}
          </Text>
          <Text style={styles.statLabel}>Patients</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {isLoadingStats ? '...' : consultationsCount !== null ? consultationsCount : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Consultations</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {isLoadingStats ? '...' : yearsOfExperience}
          </Text>
          <Text style={styles.statLabel}>Années</Text>
        </View>
      </View>

      {/* Clinic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clinique</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="business" size={20} color={colors.teal} />
            <Text style={styles.infoText}>{vetInfo.clinic}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={colors.teal} />
            <Text style={styles.infoText}>{vetInfo.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={colors.teal} />
            <Text style={styles.infoText}>{vetInfo.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={colors.teal} />
            <Text style={styles.infoText}>{vetInfo.email}</Text>
          </View>
        </View>
      </View>

      {/* Tarifs & Disponibilité */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tarifs & Disponibilité</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color={colors.teal} />
            <Text style={styles.infoText}>Consultation: {vetInfo.consultationRate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={colors.teal} />
            <Text style={styles.infoText}>Lun-Ven: 9h-18h, Sam: 9h-12h</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons 
              name="alert-circle" 
              size={20} 
              color={vetInfo.emergencyAvailable ? '#4ECDC4' : colors.gray} 
            />
            <Text style={styles.infoText}>
              {vetInfo.emergencyAvailable ? 'Urgences disponibles 24/7' : 'Pas d\'urgences'}
            </Text>
          </View>
        </View>
      </View>

      {/* Langues */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Langues parlées</Text>
        <View style={styles.languagesContainer}>
          {vetInfo.languages.map((lang, index) => (
            <View key={index} style={styles.languageChip}>
              <Ionicons name="language" size={16} color={colors.teal} />
              <Text style={styles.languageText}>{lang}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services proposés</Text>
        <View style={styles.servicesContainer}>
          {vetInfo.services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('VetSchedule')}
        >
          <Ionicons name="calendar" size={24} color={colors.white} />
          <Text style={styles.actionButtonText}>Gérer mes disponibilités</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('VetPatients')}
        >
          <Ionicons name="list" size={24} color={colors.teal} />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Voir mes patients
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('CookieSettings')}
        >
          <Ionicons name="shield-checkmark" size={24} color={colors.teal} />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Gestion des cookies
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color="#FF6B6B" />
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
            Se déconnecter
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
      
      {/* Modal pour changer la photo - Compatible Web */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoModal(false)}
        >
          <View style={styles.photoModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.photoModalTitle}>Photo de profil</Text>
            <Text style={styles.photoModalSubtitle}>Choisissez une option</Text>
            
            <TouchableOpacity 
              style={styles.photoModalButton}
              onPress={() => pickImage('library')}
            >
              <Ionicons name="images" size={24} color={colors.teal} />
              <Text style={styles.photoModalButtonText}>Choisir dans la galerie</Text>
            </TouchableOpacity>
            
            {Platform.OS !== 'web' && (
              <TouchableOpacity 
                style={styles.photoModalButton}
                onPress={() => pickImage('camera')}
              >
                <Ionicons name="camera" size={24} color={colors.teal} />
                <Text style={styles.photoModalButtonText}>Prendre une photo</Text>
              </TouchableOpacity>
            )}
            
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

      {/* Modal de confirmation de déconnexion */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLogoutModal(false)}
        >
          <View style={styles.logoutModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.logoutModalIcon}>
              <Ionicons name="log-out-outline" size={48} color="#FF6B6B" />
            </View>
            
            <Text style={styles.logoutModalTitle}>🚪 Déconnexion</Text>
            <Text style={styles.logoutModalMessage}>
              Voulez-vous vraiment vous déconnecter ?
            </Text>
            
            <View style={styles.logoutModalActions}>
              <TouchableOpacity 
                style={[styles.logoutModalButton, styles.logoutModalCancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.logoutModalCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.logoutModalButton, styles.logoutModalConfirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutModalConfirmText}>Déconnexion</Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
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
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  name: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  specialty: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
    marginBottom: spacing.xs,
  },
  experience: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginLeft: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.lightBlue,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray,
    opacity: 0.3,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
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
    color: colors.black,
    flex: 1,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  languageText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  servicesContainer: {
    gap: spacing.sm,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  serviceText: {
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.lightBlue,
  },
  secondaryButtonText: {
    color: colors.teal,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B20',
  },
  logoutButtonText: {
    color: '#FF6B6B',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  // Styles pour le modal de photo
  modalOverlay: {
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
  // Styles pour le modal de déconnexion
  logoutModalContent: {
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
  logoutModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B6B20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoutModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  logoutModalMessage: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  logoutModalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  logoutModalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutModalCancelButton: {
    backgroundColor: colors.lightGray,
  },
  logoutModalCancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
  },
  logoutModalConfirmButton: {
    backgroundColor: '#FF6B6B',
  },
  logoutModalConfirmText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
});

