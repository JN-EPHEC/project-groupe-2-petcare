import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button, Input } from '../../components';
import { CookieConsentModal } from '../../components/CookieConsentModal';
import { updateUserProfile } from '../../services/firestoreService';
import { uploadUserAvatar } from '../../services/imageUploadService';
import { useAuth } from '../../context/AuthContext';
import { saveConsent, type CookiePreferences } from '../../services/cookieConsentService';

interface VetOnboardingScreenProps {
  navigation: any;
}

export const VetOnboardingScreen: React.FC<VetOnboardingScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Informations additionnelles
  const [clinicPhone, setClinicPhone] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);
  
  // Photo
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Cookie consent
  const [showCookieConsent, setShowCookieConsent] = useState(false);

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

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let avatarUrl = user.avatarUrl || null;

      // Upload de l'image si une image a été sélectionnée
      if (imageUri) {
        try {
          setIsUploadingImage(true);
          avatarUrl = await uploadUserAvatar(imageUri, user.id);
          console.log('✅ Image uploadée avec succès:', avatarUrl);
        } catch (uploadError) {
          console.error('⚠️ Erreur upload image (continuons sans photo):', uploadError);
          Alert.alert(
            'Photo non uploadée',
            'La photo n\'a pas pu être uploadée, mais votre profil sera complété sans photo. Vous pourrez en ajouter une plus tard.',
            [{ text: 'OK' }]
          );
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Mettre à jour le profil avec les infos additionnelles
      await updateUserProfile(user.id, {
        clinicPhone: clinicPhone || user.phone,
        workingHours: workingHours || 'Lun-Ven: 9h-18h',
        emergencyAvailable,
        avatarUrl,
        onboardingCompleted: true,
      });

      // Afficher le modal de consentement RGPD
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={48} color={colors.white} />
        </View>
        <Text style={styles.headerTitle}>Bienvenue Dr. {user?.firstName} !</Text>
        <Text style={styles.headerSubtitle}>
          Complétez votre profil pour que les propriétaires puissent vous trouver facilement
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Photo de profil */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              ) : (
                <>
                  <Ionicons name="camera" size={40} color={colors.teal} />
                  <Text style={styles.imageText}>Ajouter une photo</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.imageNote}>Optionnel - Votre photo de profil pour les propriétaires</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="checkmark-circle" size={24} color={colors.teal} />
              <Text style={styles.infoCardTitle}>Informations de base complétées</Text>
            </View>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nom:</Text>
                <Text style={styles.infoValue}>Dr. {user?.firstName} {user?.lastName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Spécialité:</Text>
                <Text style={styles.infoValue}>{user?.specialty || 'Généraliste'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Clinique:</Text>
                <Text style={styles.infoValue}>{user?.clinicName || 'Non renseignée'}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Informations complémentaires</Text>
          <Text style={styles.sectionSubtitle}>
            Ces informations aideront les propriétaires à vous contacter
          </Text>

          <View style={styles.formContainer}>
            <Input
              label="Téléphone de la clinique (optionnel)"
              value={clinicPhone}
              onChangeText={setClinicPhone}
              placeholder={user?.phone || "+32 2 123 4567"}
              keyboardType="phone-pad"
            />

            <Input
              label="Horaires d'ouverture (optionnel)"
              value={workingHours}
              onChangeText={setWorkingHours}
              placeholder="Ex: Lun-Ven: 9h-18h, Sam: 9h-12h"
              multiline
            />

            <View style={styles.toggleContainer}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Disponible pour les urgences</Text>
                <Text style={styles.toggleSubtext}>
                  Les propriétaires pourront vous contacter en cas d'urgence
                </Text>
              </View>
              <Button
                title={emergencyAvailable ? "Oui" : "Non"}
                onPress={() => setEmergencyAvailable(!emergencyAvailable)}
                variant={emergencyAvailable ? "primary" : "light"}
                style={styles.toggleButton}
              />
            </View>
          </View>

          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>💡 Avec votre profil, vous pouvez :</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
                <Text style={styles.benefitText}>Recevoir des demandes de rendez-vous</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
                <Text style={styles.benefitText}>Gérer les dossiers de vos patients</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
                <Text style={styles.benefitText}>Être trouvé par les propriétaires</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
                <Text style={styles.benefitText}>Partager des documents médicaux</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Accéder à mon dashboard"
          onPress={handleComplete}
          variant="primary"
          loading={isLoading}
        />
        <Button
          title="Compléter plus tard"
          onPress={handleComplete}
          variant="light"
        />
      </View>

      {/* Modal de consentement RGPD */}
      <CookieConsentModal
        visible={showCookieConsent}
        onAcceptAll={handleCookieConsent}
        onAcceptSelected={handleCookieConsent}
        onDecline={handleDeclineCookies}
        navigation={navigation}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.navy,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.teal,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imageText: {
    fontSize: typography.fontSize.xs,
    color: colors.teal,
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
  infoCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoCardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  infoList: {
    gap: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
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
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  formContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  toggleLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  toggleSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  toggleButton: {
    minWidth: 80,
  },
  benefitsCard: {
    backgroundColor: '#E0F7FA',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  benefitsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.navy,
  },
  footer: {
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    gap: spacing.sm,
  },
});


