import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getPetsByOwnerId, Pet, getRemindersByOwnerId } from '../../services/firestoreService';
import { PremiumBadge } from '../../components';

interface HomeScreenProps {
  navigation: any;
  route?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [remindersCount, setRemindersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const [userPets, reminders] = await Promise.all([
        getPetsByOwnerId(user.id),
        getRemindersByOwnerId(user.id),
      ]);
      setPets(userPets);
      setRemindersCount(reminders.filter(r => !r.completed).length);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user]);

  // Rafraîchir quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadUserData();
      }
    }, [user?.id, loadUserData])
  );
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.morningGreeting');
    if (hour < 18) return t('home.afternoonGreeting');
    return t('home.eveningGreeting');
  };

  const quickActions = [
    { 
      id: 'calendar', 
      icon: 'calendar', 
      title: t('home.calendarCard'), 
      color: colors.teal, 
      bgColor: '#E0F2F1',
      isPremium: false,
      onPress: () => navigation.navigate('Calendar')
    },
    { 
      id: 'reminders', 
      icon: 'notifications', 
      title: t('home.remindersCard'), 
      color: '#FF9800', 
      bgColor: '#FFF3E0',
      isPremium: false,
      onPress: () => navigation.navigate('Reminders')
    },
    { 
      id: 'medical', 
      icon: 'medical', 
      title: t('home.medicalHistoryCard'), 
      color: '#E91E63', 
      bgColor: '#FCE4EC',
      isPremium: false,
      onPress: () => navigation.getParent()?.navigate('ProfileTab', { screen: 'HealthRecord' })
    },
    { 
      id: 'documents', 
      icon: 'document-text', 
      title: 'Mes documents', 
      color: '#00BCD4', 
      bgColor: '#E0F7FA',
      isPremium: false,
      onPress: () => navigation.getParent()?.navigate('ProfileTab', { screen: 'Documents' })
    },
    // Actions Premium
    { 
      id: 'wellness', 
      icon: 'fitness', 
      title: 'Suivi Bien-être', 
      color: '#4CAF50', 
      bgColor: '#E8F5E9',
      isPremium: true,
      onPress: () => navigation.navigate('WellnessTracking')
    },
    { 
      id: 'blog', 
      icon: 'book', 
      title: 'Blog éducatif', 
      color: '#FF5722', 
      bgColor: '#FBE9E7',
      isPremium: true,
      onPress: () => navigation.navigate('Blog')
    },
    { 
      id: 'share', 
      icon: 'share-social', 
      title: 'Partager le carnet', 
      color: '#9C27B0', 
      bgColor: '#F3E5F5',
      isPremium: true,
      onPress: () => navigation.navigate('SharePet', { pet: pets[0] })
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' ? { flex: 1, overflow: 'auto' } : {}}
        contentContainerStyle={Platform.OS === 'web' ? { minHeight: '100%' } : {}}
      >
        {/* Header with gradient background */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.greetingSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={styles.greeting}>{t('home.greeting')}</Text>
                {user?.isPremium && (
                  <PremiumBadge size="small" showText={false} />
                )}
              </View>
              <Text style={styles.userName}>{user?.firstName || 'John'} 👋</Text>
              <Text style={styles.subGreeting}>{getGreeting()}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => {
                // Naviguer vers le profil utilisateur selon le rôle
                if (user?.role === 'owner') {
                  navigation.getParent()?.navigate('ProfileTab', { screen: 'OwnerProfile' });
                } else if (user?.role === 'vet') {
                  navigation.getParent()?.navigate('VetProfileTab', { screen: 'VetProfileMain' });
                } else {
                  navigation.getParent()?.navigate('ProfileTab');
                }
              }}
              activeOpacity={0.8}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {(user?.firstName?.[0] || 'J').toUpperCase()}
                </Text>
                {user?.isPremium && (
                  <View style={styles.premiumAvatarBadge}>
                    <Ionicons name="star" size={14} color="#FFB300" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Premium pour non-premium */}
        {!user?.isPremium && (
          <TouchableOpacity 
            style={styles.premiumBanner}
            onPress={() => navigation.getParent()?.navigate('ProfileTab', { screen: 'Premium' })}
            activeOpacity={0.9}
          >
            <View style={styles.premiumBannerContent}>
              <View style={styles.premiumBannerIcon}>
                <Ionicons name="star" size={28} color="#FFB300" />
              </View>
              <View style={styles.premiumBannerText}>
                <Text style={styles.premiumBannerTitle}>Passez à Premium ✨</Text>
                <Text style={styles.premiumBannerSubtitle}>
                  Débloquez toutes les fonctionnalités • €9.99/mois
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.white} />
            </View>
          </TouchableOpacity>
        )}

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#E0F2F1' }]}>
            <Ionicons name="paw" size={24} color={colors.teal} />
          </View>
          <Text style={styles.statNumber}>{isLoading ? '-' : pets.length}</Text>
          <Text style={styles.statLabel}>Animaux</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="calendar" size={24} color="#FF9800" />
          </View>
          <Text style={styles.statNumber}>{isLoading ? '-' : remindersCount}</Text>
          <Text style={styles.statLabel}>Rappels</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#FCE4EC' }]}>
            <MaterialCommunityIcons name="medical-bag" size={24} color="#E91E63" />
          </View>
          <Text style={styles.statNumber}>{isLoading ? '-' : 0}</Text>
          <Text style={styles.statLabel}>Visites</Text>
        </View>
      </View>

      {/* My Pets Section - DÉPLACÉ EN PREMIER */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mes animaux</Text>
        <TouchableOpacity 
          onPress={() => navigation.getParent()?.navigate('ProfileTab', { screen: 'PetProfile' })}
        >
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : pets.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.petsScrollContainer}
        >
          {pets.map((pet) => (
            <TouchableOpacity 
              key={pet.id}
              style={styles.petCard}
              onPress={() => navigation.getParent()?.navigate('ProfileTab', { screen: 'PetProfile' })}
              activeOpacity={0.8}
            >
              {pet.avatarUrl ? (
                <Image 
                  source={{ uri: pet.avatarUrl }} 
                  style={styles.petImage}
                />
              ) : (
                <View style={styles.petEmojiContainer}>
                  <Text style={styles.petEmoji}>{pet.emoji || '🐾'}</Text>
                </View>
              )}
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>{pet.breed}</Text>
              <View style={styles.petBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.teal} />
                <Text style={styles.petBadgeText}>À jour</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={styles.addPetCard}
            onPress={() => navigation.getParent()?.navigate('ProfileTab', { screen: 'AddPet' })}
            activeOpacity={0.8}
          >
            <View style={styles.addPetIcon}>
              <Ionicons name="add" size={36} color={colors.teal} />
            </View>
            <Text style={styles.addPetText}>Ajouter</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.noPetsContainer}>
          <Ionicons name="paw-outline" size={60} color={colors.gray} />
          <Text style={styles.noPetsTitle}>Aucun animal enregistré</Text>
          <Text style={styles.noPetsSubtitle}>Ajoutez votre premier compagnon</Text>
          <TouchableOpacity 
            style={styles.addFirstPetButton}
            onPress={() => navigation.getParent()?.navigate('ProfileTab', { screen: 'AddPet' })}
          >
            <Ionicons name="add-circle" size={24} color={colors.white} />
            <Text style={styles.addFirstPetText}>Ajouter un animal</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions Title - DÉPLACÉ APRÈS LES ANIMAUX */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <Ionicons name="flash" size={20} color={colors.teal} />
      </View>

      {/* Action Cards - Grid 2x2 */}
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => {
          const isLocked = action.isPremium && !user?.isPremium;
          const handlePress = () => {
            if (isLocked) {
              // Rediriger vers la page premium
              navigation.navigate('Premium');
            } else {
              action.onPress();
            }
          };

          return (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.quickActionCard,
                isLocked && styles.quickActionCardLocked
              ]}
              onPress={handlePress}
              activeOpacity={0.7}
            >
              <View style={[
                styles.quickActionIcon, 
                { backgroundColor: isLocked ? '#E0E0E0' : action.color }
              ]}>
                <Ionicons 
                  name={action.icon as any} 
                  size={20} 
                  color={isLocked ? '#9E9E9E' : colors.white} 
                />
              </View>
              <Text style={[
                styles.quickActionText,
                isLocked && styles.quickActionTextLocked
              ]} numberOfLines={2}>
                {action.title}
              </Text>
              {action.isPremium && (
                <View style={styles.premiumBadgeSmall}>
                  <Ionicons name="star" size={12} color="#FFB300" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bouton d'urgence flottant (ROUGE - toujours visible) */}
      <TouchableOpacity 
        style={styles.floatingEmergencyButton}
        onPress={() => navigation.getParent()?.navigate('SearchTab', { screen: 'EmergencyMode' })}
        activeOpacity={0.85}
      >
        <View style={styles.emergencyIconContainer}>
          <Ionicons name="medical" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.floatingEmergencyText}>URGENCE</Text>
        <View style={styles.emergencyPulse} />
      </TouchableOpacity>

      {/* Bouton flottant Premium pour non-premium */}
      {!user?.isPremium && (
        <TouchableOpacity 
          style={styles.floatingPremiumButton}
          onPress={() => navigation.getParent()?.navigate('ProfileTab', { screen: 'Premium' })}
          activeOpacity={0.9}
        >
          <Ionicons name="star" size={24} color={colors.white} />
          <Text style={styles.floatingButtonText}>Passer à Premium</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
    position: 'relative', // Nécessaire pour les éléments absolus
    ...(Platform.OS === 'web' ? {
      height: '100vh',
    } : {}),
  },
  headerContainer: {
    backgroundColor: colors.navy,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: spacing.xxl,
    paddingBottom: 60,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.lightBlue,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subGreeting: {
    fontSize: typography.fontSize.md,
    color: colors.lightBlue,
  },
  avatarContainer: {
    marginLeft: spacing.md,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  premiumAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.navy,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginTop: -40,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  actionCard: {
    width: '48%',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  // Nouvelle grille pour quick actions compactes 2x2
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 85,
    justifyContent: 'center',
    position: 'relative',
  },
  quickActionCardLocked: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    textAlign: 'center',
  },
  quickActionTextLocked: {
    color: '#9E9E9E',
  },
  premiumBadgeSmall: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
    minHeight: 40,
  },
  actionArrow: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
  },
  petsScrollContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  petCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginRight: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  petEmojiContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: spacing.sm,
    backgroundColor: colors.lightBlue,
  },
  petEmoji: {
    fontSize: 36,
  },
  petName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  petBreed: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  petBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  petBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  addPetCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.lightBlue,
    borderStyle: 'dashed',
    minHeight: 160,
  },
  addPetIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addPetText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  noPetsContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  noPetsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  noPetsSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.lg,
  },
  addFirstPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
  },
  addFirstPetText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
  premiumFeaturesContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  premiumFeatureCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB300',
  },
  premiumFeatureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  premiumFeatureSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  // Styles Premium Banner & Floating Button
  premiumBanner: {
    marginHorizontal: spacing.xl,
    marginTop: -30,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  premiumBannerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBannerText: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: 4,
  },
  premiumBannerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  floatingPremiumButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 30 : 20, // Plus bas pour ne pas cacher le bouton d'urgence
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB300',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    gap: spacing.sm,
    zIndex: 999, // En dessous du bouton d'urgence
  },
  floatingButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  // Bouton d'urgence flottant (rouge vif et très visible)
  floatingEmergencyButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 120 : 100, // Plus haut sur web pour éviter la barre
    right: spacing.xl,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30', // Rouge vif iOS
    width: 90,
    height: 90,
    borderRadius: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 20, // Augmenté pour Android
    borderWidth: 4,
    borderColor: '#FFFFFF',
    zIndex: 9999, // Maximum pour être au-dessus de TOUT (y compris Premium)
    ...(Platform.OS === 'web' ? {
      // Sur web, on s'assure qu'il reste visible
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.4)',
    } : {}),
  },
  emergencyIconContainer: {
    marginBottom: 4,
  },
  floatingEmergencyText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
  emergencyPulse: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FF3B30',
    opacity: 0.3,
    // Animation pulse (nécessite Animated API pour animer)
  },
});
