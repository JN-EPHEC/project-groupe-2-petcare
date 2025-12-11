import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getPetsByOwnerId, Pet, getRemindersByOwnerId } from '../../services/firestoreService';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
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
      onPress: () => navigation.navigate('Calendar')
    },
    { 
      id: 'reminders', 
      icon: 'notifications', 
      title: t('home.remindersCard'), 
      color: '#FF9800', 
      bgColor: '#FFF3E0',
      onPress: () => navigation.navigate('Reminders')
    },
    { 
      id: 'medical', 
      icon: 'medical', 
      title: t('home.medicalHistoryCard'), 
      color: '#E91E63', 
      bgColor: '#FCE4EC',
      onPress: () => navigation.getParent()?.navigate('ProfileTab', { screen: 'HealthRecord' })
    },
    { 
      id: 'offline', 
      icon: 'cloud-offline', 
      title: t('home.offlineModeCard'), 
      color: '#9C27B0', 
      bgColor: '#F3E5F5',
      onPress: () => navigation.navigate('OfflineMode')
    },
    { 
      id: 'emergency', 
      icon: 'call', 
      title: t('home.emergencyCard'), 
      color: colors.red, 
      bgColor: '#FFEBEE',
      onPress: () => navigation.getParent()?.navigate('SearchTab', { screen: 'Emergency' })
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with gradient background */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{t('home.greeting')}</Text>
            <Text style={styles.userName}>{user?.firstName || 'John'} 👋</Text>
            <Text style={styles.subGreeting}>{getGreeting()}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => navigation.getParent()?.navigate('ProfileTab')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(user?.firstName?.[0] || 'J').toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

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

      {/* Quick Actions Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <Ionicons name="flash" size={20} color={colors.teal} />
      </View>

      {/* Quick Action Cards - Grid Layout */}
      <View style={styles.cardsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, { backgroundColor: action.bgColor }]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon as any} size={28} color={colors.white} />
            </View>
            <Text style={styles.actionTitle} numberOfLines={2}>
              {action.title}
            </Text>
            <View style={styles.actionArrow}>
              <Ionicons name="arrow-forward" size={18} color={action.color} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* My Pets Section */}
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
              <View style={styles.petEmojiContainer}>
                <Text style={styles.petEmoji}>{pet.emoji || '🐾'}</Text>
              </View>
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

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
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
    minHeight: 140,
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
});
