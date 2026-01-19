import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { deleteUserAccount } from '../../services/firebaseAuth';

interface UserProfileDetailScreenProps {
  navigation: any;
}

export const UserProfileDetailScreen: React.FC<UserProfileDetailScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, pets, signOut } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe');
      return;
    }

    try {
      setIsDeleting(true);
      
      console.log('🗑️ Début de la suppression du compte...');
      
      // Supprimer le compte (supprime Auth + toutes les données Firestore)
      await deleteUserAccount(deletePassword);
      
      console.log('✅ Compte supprimé avec succès');
      
      // Fermer la modal
      setShowDeleteModal(false);
      setDeletePassword('');
      
      // Déconnecter explicitement (au cas où)
      try {
        await signOut();
      } catch (e) {
        console.log('Déconnexion déjà effectuée');
      }
      
      // Afficher un message de succès
      Alert.alert(
        '✅ Compte supprimé',
        'Votre compte et toutes vos données ont été définitivement supprimés.\n\nVous allez être redirigé vers la page de connexion.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Rediriger vers l'écran de connexion
              navigation.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
              });
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('❌ Erreur suppression compte:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de supprimer le compte. Veuillez réessayer.'
      );
      setIsDeleting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.getParent()?.navigate('HomeTab', { screen: 'Home' })}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="settings" size={30} color={colors.navy} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageContainer}>
        {user?.avatarLocal ? (
          <Image 
            source={user.avatarLocal}
            style={styles.profileImage}
          />
        ) : user?.avatarUrl ? (
          <Image 
            source={{ uri: user.avatarUrl }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="person" size={100} color={colors.gray} />
          </View>
        )}
      </View>

      <View style={styles.contentCard}>
        <View style={styles.userInfoHeader}>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName?.toUpperCase()}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={colors.black} />
            <Text style={styles.location}>{user?.location || 'wavre'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>{t('profile.profile')}</Text>

        <Text style={styles.bio}>
          {pets && pets.length > 0 
            ? `Fier parent de ${pets.map(p => p.name).join(', ')}\nMa vie tourne autour de petits ronrons et de grandes aventures avec ${pets.length > 1 ? 'mes compagnons' : 'mon compagnon'}, expert${pets.length > 1 ? 's' : ''} en câlins et en chaos adorable. Entre une sieste partagée et des sessions de jeux endiablées, j'essaie de survivre à ${pets.length > 1 ? 'leur' : 'son'} charme irrésistible... et j'adore ça !`
            : t('profile.userProfile.bio', { petName: 'votre compagnon' })}
        </Text>

        {/* Mes Animaux */}
        {pets && pets.length > 0 && (
          <View style={styles.petsContainer}>
            <Text style={styles.petsTitle}>
              🐾 {pets.length > 1 ? 'Mes animaux' : 'Mon animal'}
            </Text>
            {pets.map((pet) => (
              <View key={pet.id} style={styles.petSection}>
                <View style={styles.petImageContainer}>
                  {pet.avatarUrl ? (
                    <Image 
                      source={{ uri: pet.avatarUrl }} 
                      style={styles.petImage}
                    />
                  ) : (
                    <View style={styles.petImagePlaceholder}>
                      <Text style={styles.petEmoji}>{pet.emoji || '🐾'}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petBreed}>{pet.breed}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.contactSection}>
          <Text style={styles.contactLabel}>{t('profile.emailLabel')}</Text>
          <View style={styles.contactField}>
            <Text style={styles.contactText}>{user?.email || '*Charlesdubois@hotmail.com'}</Text>
          </View>

          <Text style={styles.contactLabel}>{t('profile.phoneLabel')}</Text>
          <View style={styles.contactField}>
            <Text style={styles.contactText}>{user?.phone || '*+32 49 90 89 808'}</Text>
          </View>
        </View>

        {/* Bouton Supprimer le compte */}
        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={20} color={colors.white} />
          <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmation de suppression */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="warning" size={64} color={colors.error} />
            </View>

            <Text style={styles.modalTitle}>⚠️ Supprimer le compte</Text>
            <Text style={styles.modalMessage}>
              Cette action est <Text style={styles.boldText}>irréversible</Text>.{'\n\n'}
              Toutes vos données seront <Text style={styles.boldText}>définitivement supprimées</Text> :
              {'\n'}• Votre profil
              {'\n'}• Vos animaux
              {'\n'}• Vos documents
              {'\n'}• Vos rappels
              {'\n'}• Votre historique
            </Text>

            <View style={styles.passwordInputContainer}>
              <Text style={styles.passwordLabel}>
                Entrez votre mot de passe pour confirmer :
              </Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mot de passe"
                placeholderTextColor={colors.gray}
                secureTextEntry
                value={deletePassword}
                onChangeText={setDeletePassword}
                editable={!isDeleting}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                disabled={isDeleting}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={confirmDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="trash" size={20} color={colors.white} />
                    <Text style={styles.modalDeleteText}>Supprimer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
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
  settingsButton: {
    padding: spacing.sm,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  profileImagePlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  contentCard: {
    backgroundColor: colors.lightBlue,
    margin: spacing.lg,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    padding: spacing.xl,
    minHeight: 600,
  },
  userInfoHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  userName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  divider: {
    height: 2,
    backgroundColor: colors.white,
    marginVertical: spacing.lg,
    width: '30%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.black,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  petsContainer: {
    marginBottom: spacing.xl,
  },
  petsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  petSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  petImageContainer: {
    marginRight: spacing.md,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
  },
  petImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petEmoji: {
    fontSize: 40,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  petBreed: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  contactSection: {
    gap: spacing.md,
  },
  contactLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  contactField: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  contactText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  deleteAccountText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  passwordInputContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  passwordLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  passwordInput: {
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.md,
    color: colors.navy,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  modalCancelButton: {
    backgroundColor: colors.lightGray,
  },
  modalCancelText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  modalDeleteButton: {
    backgroundColor: colors.error,
  },
  modalDeleteText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
});

