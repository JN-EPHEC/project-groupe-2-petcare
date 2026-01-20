import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Clipboard, ActivityIndicator, Image, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-qr-code';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { PremiumGate, InAppAlert } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { createPetShareLink, getActiveShares, revokeShareLink, activateShareLink, getPetsByOwnerId, Pet } from '../../services/firestoreService';
import { SharedPet } from '../../types/premium';

interface SharePetScreenProps {
  navigation: any;
  route: any;
}

export const SharePetScreen: React.FC<SharePetScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const paramPet = route.params?.pet;
  const [selectedPet, setSelectedPet] = useState<Pet | null>(paramPet || null);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [shares, setShares] = useState<SharedPet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentQRUrl, setCurrentQRUrl] = useState('');
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const qrRef = useRef<any>(null);
  
  useEffect(() => {
    loadUserPets();
  }, [user?.id]);
  
  useEffect(() => {
    if (selectedPet) {
      loadShares();
    } else {
      setIsLoading(false);
    }
  }, [selectedPet]);
  
  const loadUserPets = async () => {
    if (!user?.id) return;
    try {
      setIsLoadingPets(true);
      const pets = await getPetsByOwnerId(user.id);
      setUserPets(pets || []);
    } catch (error) {
      console.error('Error loading pets:', error);
      setUserPets([]);
    } finally {
      setIsLoadingPets(false);
    }
  };
  
  const loadShares = async () => {
    if (!selectedPet || !user?.id) return;
    try {
      setIsLoading(true);
      const activeShares = await getActiveShares(selectedPet.id, user.id);
      setShares(activeShares);
    } catch (error) {
      console.error('Error loading shares:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getShareUrl = (token: string): string => {
    // Construire une URL web fonctionnelle
    // En production, remplacer par votre domaine réel
    const baseUrl = typeof window !== 'undefined' && window.location 
      ? `${window.location.protocol}//${window.location.host}` 
      : 'http://localhost:8081';
    
    return `${baseUrl}/share/${token}`;
  };

  const handleCreateShare = async () => {
    if (!selectedPet) return;
    try {
      setIsCreating(true);
      const shareToken = await createPetShareLink(selectedPet.id, user?.id || '');
      const shareUrl = getShareUrl(shareToken);
      
      // Afficher le QR code
      setCurrentQRUrl(shareUrl);
      setShowQRModal(true);
      
      await loadShares();
    } catch (error) {
      console.error('Error creating share:', error);
      setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Impossible de créer le lien de partage',
        type: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleShowQRCode = (token: string) => {
    const shareUrl = getShareUrl(token);
    setCurrentQRUrl(shareUrl);
    setShowQRModal(true);
  };
  
  const handleShare = async (shareUrl: string) => {
    if (!selectedPet) return;
    try {
      await Share.share({
        message: `Consultez le carnet de santé de ${selectedPet.name} sur PetCare+\n\n${shareUrl}`,
        title: `Carnet de ${selectedPet.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleCopyLink = (token: string) => {
    const shareUrl = getShareUrl(token);
    Clipboard.setString(shareUrl);
    Alert.alert('Copié', 'Le lien a été copié dans le presse-papiers');
  };

  const handleTestLink = (token: string) => {
    // Naviguer vers la page de partage pour tester
    navigation.navigate('SharedPetProfile', { shareToken: token });
  };
  
  const handleToggleShare = (share: SharedPet) => {
    const isActive = share.isActive;
    Alert.alert(
      isActive ? 'Désactiver le lien' : 'Activer le lien',
      isActive 
        ? 'Le lien ne sera plus accessible tant qu\'il est désactivé.' 
        : 'Le lien redeviendra accessible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: isActive ? 'Désactiver' : 'Activer',
          style: isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (isActive) {
                await revokeShareLink(share.id);
                Alert.alert('Succès', 'Le lien a été désactivé');
              } else {
                await activateShareLink(share.id);
                Alert.alert('Succès', 'Le lien a été activé');
              }
              await loadShares();
            } catch (error) {
              console.error('Error toggling share:', error);
              Alert.alert('Erreur', 'Impossible de modifier le lien');
            }
          }
        }
      ]
    );
  };
  
  return (
    <PremiumGate featureName="Le partage du carnet" navigation={navigation}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Partager le carnet</Text>
            <Text style={styles.headerSubtitle}>{selectedPet?.name || 'Choisissez un animal'}</Text>
          </View>

          {selectedPet && (
            <TouchableOpacity
              style={styles.changePetButton}
              onPress={() => setSelectedPet(null)}
            >
              <Ionicons name="swap-horizontal" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Pet Selection (if none selected) */}
          {!selectedPet && (
            <View style={styles.selectPetCard}>
              <Text style={styles.selectPetTitle}>Choisissez un animal à partager</Text>
              
              {isLoadingPets ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.teal} />
                  <Text style={styles.loadingText}>Chargement de vos animaux...</Text>
                </View>
              ) : userPets.length === 0 ? (
                <View style={styles.emptyPetsContainer}>
                  <Ionicons name="paw-outline" size={48} color={colors.lightGray} />
                  <Text style={styles.emptyPetsText}>Aucun animal enregistré</Text>
                  <Text style={styles.emptyPetsSubtext}>
                    Ajoutez d'abord un animal pour pouvoir partager son carnet
                  </Text>
                  <TouchableOpacity
                    style={styles.addPetButton}
                    onPress={() => navigation.navigate('AddPet')}
                  >
                    <Ionicons name="add-circle" size={20} color={colors.white} />
                    <Text style={styles.addPetButtonText}>Ajouter un animal</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                userPets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={styles.petOption}
                    onPress={() => setSelectedPet(pet)}
                    activeOpacity={0.7}
                  >
                    {pet.avatarUrl ? (
                      <Image source={{ uri: pet.avatarUrl }} style={styles.petOptionImage} />
                    ) : (
                      <Text style={styles.petOptionEmoji}>{pet.emoji || '🐾'}</Text>
                    )}
                    <View style={styles.petOptionInfo}>
                      <Text style={styles.petOptionName}>{pet.name}</Text>
                      <Text style={styles.petOptionBreed}>{pet.breed}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.gray} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {selectedPet && (
            <>
              {/* Info Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Ionicons name="information-circle" size={32} color={colors.teal} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Partage sécurisé</Text>
                  <Text style={styles.infoText}>
                    Créez un lien unique pour partager le carnet de santé de {selectedPet.name} avec votre famille, 
                    vos pet-sitters ou vos vétérinaires. Les personnes avec le lien pourront consulter les 
                    informations en lecture seule.
                  </Text>
                </View>
              </View>
          
          {/* Create Share Button */}
          <TouchableOpacity 
            style={[styles.createButton, isCreating && styles.createButtonDisabled]}
            onPress={handleCreateShare}
            disabled={isCreating}
          >
            <Ionicons name="add-circle" size={24} color={colors.white} />
            <Text style={styles.createButtonText}>
              {isCreating ? 'Création...' : 'Créer un nouveau lien'}
            </Text>
          </TouchableOpacity>
          
          {/* Active Shares */}
          <View style={styles.sharesSection}>
            <Text style={styles.sectionTitle}>
              Liens de partage ({shares.filter(s => s.isActive).length} actif{shares.filter(s => s.isActive).length > 1 ? 's' : ''} sur {shares.length})
            </Text>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            ) : shares.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="link-outline" size={48} color={colors.lightGray} />
                <Text style={styles.emptyText}>Aucun lien actif</Text>
                <Text style={styles.emptySubtext}>
                  Créez un lien pour partager le carnet de {selectedPet.name}
                </Text>
              </View>
            ) : (
              shares.map(share => {
                const isActive = share.isActive;
                return (
                  <View key={share.id} style={[styles.shareCard, !isActive && styles.shareCardInactive]}>
                    <View style={[styles.shareIcon, !isActive && styles.shareIconInactive]}>
                      <Ionicons name={isActive ? "link" : "link-outline"} size={24} color={isActive ? colors.teal : colors.gray} />
                    </View>
                    
                    <View style={styles.shareContent}>
                      <View style={styles.shareHeader}>
                        <Text style={styles.shareDate}>
                          Créé le {new Date(share.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Text>
                        <View style={[styles.statusBadge, isActive ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
                          <View style={[styles.statusDot, isActive ? styles.statusDotActive : styles.statusDotInactive]} />
                          <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                            {isActive ? 'Actif' : 'Inactif'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.shareStats}>
                        {share.accessCount} consultation{share.accessCount > 1 ? 's' : ''}
                      </Text>
                    </View>
                    
                    <View style={styles.shareActions}>
                      <TouchableOpacity 
                        style={[styles.shareActionButton, !isActive && styles.shareActionButtonDisabled]}
                        onPress={() => handleShowQRCode(share.shareToken)}
                        disabled={!isActive}
                      >
                        <Ionicons name="qr-code-outline" size={20} color={isActive ? colors.teal : colors.lightGray} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.shareActionButton, !isActive && styles.shareActionButtonDisabled]}
                        onPress={() => handleCopyLink(share.shareToken)}
                        disabled={!isActive}
                      >
                        <Ionicons name="copy-outline" size={20} color={isActive ? colors.teal : colors.lightGray} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.shareActionButton, !isActive && styles.shareActionButtonDisabled]}
                        onPress={() => handleTestLink(share.shareToken)}
                        disabled={!isActive}
                      >
                        <Ionicons name="open-outline" size={20} color={isActive ? colors.teal : colors.lightGray} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.shareActionButton, isActive ? styles.toggleButtonActive : styles.toggleButtonInactive]}
                        onPress={() => handleToggleShare(share)}
                      >
                        <Ionicons 
                          name={isActive ? "pause-outline" : "play-outline"} 
                          size={20} 
                          color={isActive ? colors.orange : colors.success} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
          
          {/* Features List */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Ce qui est partagé</Text>
            
            <FeatureItem 
              icon="paw" 
              title="Informations de base" 
              description="Nom, race, âge, poids"
            />
            <FeatureItem 
              icon="medical" 
              title="Vaccinations" 
              description="Historique complet des vaccins"
            />
            <FeatureItem 
              icon="document-text" 
              title="Historique santé" 
              description="Visites vétérinaires et traitements"
            />
            <FeatureItem 
              icon="notifications" 
              title="Rappels" 
              description="Rappels de soins à venir"
            />
          </View>
            </>
          )}
        </ScrollView>

        {/* QR Code Modal */}
        <Modal
          visible={showQRModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQRModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.qrModalContent}>
              <View style={styles.qrModalHeader}>
                <Text style={styles.qrModalTitle}>Scanner ce QR Code</Text>
                <TouchableOpacity
                  style={styles.qrModalClose}
                  onPress={() => setShowQRModal(false)}
                >
                  <Ionicons name="close" size={24} color={colors.navy} />
                </TouchableOpacity>
              </View>

              <View style={styles.qrContainer}>
                {Platform.OS === 'web' ? (
                  <QRCode
                    value={currentQRUrl}
                    size={250}
                    level="H"
                    fgColor={colors.navy}
                    bgColor={colors.white}
                  />
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <Ionicons name="qr-code" size={200} color={colors.teal} />
                    <Text style={styles.qrPlaceholderText}>
                      QR Code disponible sur la version web
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.qrInfo}>
                <Ionicons name="information-circle" size={20} color={colors.teal} />
                <Text style={styles.qrInfoText}>
                  {selectedPet ? `Scannez ce code pour accéder au carnet de ${selectedPet.name}` : 'Scannez ce code pour accéder au carnet'}
                </Text>
              </View>

              <View style={styles.qrUrlContainer}>
                <Text style={styles.qrUrlLabel}>Lien direct :</Text>
                <Text style={styles.qrUrl} numberOfLines={1}>{currentQRUrl}</Text>
              </View>

              <View style={styles.qrActions}>
                <TouchableOpacity
                  style={styles.qrActionButton}
                  onPress={() => {
                    Clipboard.setString(currentQRUrl);
                    setAlert({
                      visible: true,
                      title: 'Copié !',
                      message: 'Le lien a été copié dans le presse-papiers',
                      type: 'success',
                    });
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color={colors.white} />
                  <Text style={styles.qrActionText}>Copier le lien</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.qrActionButton, styles.qrActionButtonSecondary]}
                  onPress={async () => {
                    try {
                      await Share.share({
                        message: `Consultez le carnet de santé de ${selectedPet?.name || 'mon animal'} sur PetCare+\n\n${currentQRUrl}`,
                        title: `Carnet de ${selectedPet?.name || 'mon animal'}`,
                      });
                    } catch (error) {
                      console.error('Error sharing:', error);
                    }
                  }}
                >
                  <Ionicons name="share-social-outline" size={20} color={colors.teal} />
                  <Text style={[styles.qrActionText, { color: colors.teal }]}>Partager</Text>
                </TouchableOpacity>
              </View>

              {Platform.OS === 'web' && (
                <Text style={styles.qrHint}>
                  💡 Astuce : Faites un clic droit sur le QR code pour l'enregistrer comme image
                </Text>
              )}
            </View>
          </View>
        </Modal>

        {/* In-App Alert */}
        {alert && (
          <InAppAlert
            visible={alert.visible}
            title={alert.title}
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}
      </View>
    </PremiumGate>
  );
};

const FeatureItem: React.FC<{ icon: string; title: string; description: string }> = ({ 
  icon, 
  title, 
  description 
}) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Ionicons name={icon as any} size={20} color={colors.teal} />
    </View>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.lightBlue,
    marginTop: spacing.xs,
  },
  changePetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoIcon: {
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  sharesSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  shareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shareCardInactive: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  shareIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  shareIconInactive: {
    backgroundColor: '#E0E0E0',
  },
  shareContent: {
    flex: 1,
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  shareDate: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  shareStats: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  statusBadgeActive: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeInactive: {
    backgroundColor: '#FFEBEE',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  statusDotInactive: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextInactive: {
    color: colors.error,
  },
  shareActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  shareActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareActionButtonDisabled: {
    opacity: 0.4,
  },
  toggleButtonActive: {
    backgroundColor: '#FFF3E0',
  },
  toggleButtonInactive: {
    backgroundColor: '#E8F5E9',
  },
  featuresSection: {
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  selectPetCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  selectPetTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  petOptionEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  petOptionImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: spacing.md,
  },
  petOptionInfo: {
    flex: 1,
  },
  petOptionName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  petOptionBreed: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: 2,
  },
  emptyPetsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyPetsText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginTop: spacing.md,
  },
  emptyPetsSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  addPetButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  qrModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  qrModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  qrModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.lightBlue,
    marginBottom: spacing.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrPlaceholder: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
  },
  qrPlaceholderText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  qrInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.lightBlue,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  qrInfoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
  },
  qrUrlContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  qrUrlLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  qrUrl: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  qrActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.md,
  },
  qrActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  qrActionButtonSecondary: {
    backgroundColor: colors.lightBlue,
  },
  qrActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  qrHint: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});


