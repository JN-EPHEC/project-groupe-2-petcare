import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Clipboard, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { PremiumGate } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { createPetShareLink, getActiveShares, revokeShareLink, getPetsByOwnerId, Pet } from '../../services/firestoreService';
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
  
  const handleCreateShare = async () => {
    if (!selectedPet) return;
    try {
      setIsCreating(true);
      const shareToken = await createPetShareLink(selectedPet.id, user?.id || '');
      
      // Construire l'URL de partage (à adapter selon votre configuration)
      const shareUrl = `petcare://share/${shareToken}`;
      // Pour le web : const shareUrl = `https://yourapp.com/share/${shareToken}`;
      
      Alert.alert(
        'Lien créé !',
        'Le lien de partage a été créé avec succès',
        [
          {
            text: 'Copier le lien',
            onPress: () => {
              Clipboard.setString(shareUrl);
              Alert.alert('Copié', 'Le lien a été copié dans le presse-papiers');
            }
          },
          {
            text: 'Partager',
            onPress: () => handleShare(shareUrl)
          },
          {
            text: 'OK'
          }
        ]
      );
      
      await loadShares();
    } catch (error) {
      console.error('Error creating share:', error);
      Alert.alert('Erreur', 'Impossible de créer le lien de partage');
    } finally {
      setIsCreating(false);
    }
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
    const shareUrl = `petcare://share/${token}`;
    Clipboard.setString(shareUrl);
    Alert.alert('Copié', 'Le lien a été copié dans le presse-papiers');
  };
  
  const handleRevokeShare = (share: SharedPet) => {
    Alert.alert(
      'Révoquer l\'accès',
      'Êtes-vous sûr de vouloir révoquer ce lien de partage ? Il ne sera plus accessible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Révoquer',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeShareLink(share.id);
              await loadShares();
              Alert.alert('Succès', 'Le lien de partage a été révoqué');
            } catch (error) {
              console.error('Error revoking share:', error);
              Alert.alert('Erreur', 'Impossible de révoquer le lien');
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
              Liens actifs ({shares.length})
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
              shares.map(share => (
                <View key={share.id} style={styles.shareCard}>
                  <View style={styles.shareIcon}>
                    <Ionicons name="link" size={24} color={colors.teal} />
                  </View>
                  
                  <View style={styles.shareContent}>
                    <Text style={styles.shareDate}>
                      Créé le {new Date(share.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                    <Text style={styles.shareStats}>
                      {share.accessCount} consultation{share.accessCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  <View style={styles.shareActions}>
                    <TouchableOpacity 
                      style={styles.shareActionButton}
                      onPress={() => handleCopyLink(share.shareToken)}
                    >
                      <Ionicons name="copy-outline" size={20} color={colors.teal} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.shareActionButton}
                      onPress={() => handleShare(`petcare://share/${share.shareToken}`)}
                    >
                      <Ionicons name="share-social-outline" size={20} color={colors.teal} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.shareActionButton, styles.revokeButton]}
                      onPress={() => handleRevokeShare(share)}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
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
  shareIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  shareContent: {
    flex: 1,
  },
  shareDate: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  shareStats: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
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
  revokeButton: {
    backgroundColor: '#FFEBEE',
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
});


