import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { LanguageSwitcher } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { getPetsByOwnerId, getRemindersByOwnerId } from '../../services/firestoreService';

interface OwnerProfileScreenProps {
  navigation: any;
}

export const OwnerProfileScreen: React.FC<OwnerProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [petsCount, setPetsCount] = useState(0);
  const [pets, setPets] = useState<any[]>([]);
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
      setPetsCount(userPets.length);
      setRemindersCount(reminders.filter(r => !r.completed).length);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Charger au démarrage
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

  const handleLogout = () => {
    Alert.alert(
      t('common.logout'),
      t('common.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.navigate('Splash');
          }
        },
      ]
    );
  };

  const profileSections = [
    {
      title: 'Mon Compte',
      icon: 'person',
      items: [
        { 
          id: 'profile',
          icon: 'person-circle', 
          title: t('profile.myProfile'), 
          subtitle: 'Informations personnelles',
          color: colors.teal,
          bgColor: '#E0F2F1',
          onPress: () => navigation.navigate('UserProfileDetail')
        },
        { 
          id: 'premium',
          icon: 'star', 
          title: t('profile.premium'), 
          subtitle: 'Débloquez toutes les fonctionnalités',
          color: '#FFB300',
          bgColor: '#FFF8E1',
          onPress: () => navigation.navigate('Premium')
        },
      ]
    },
    {
      title: 'Mes Animaux',
      icon: 'paw',
      items: [
        { 
          id: 'myPets',
          icon: 'paw', 
          title: t('profile.myAnimal'), 
          subtitle: 'Voir tous mes animaux',
          color: '#E91E63',
          bgColor: '#FCE4EC',
          onPress: () => navigation.navigate('PetProfile')
        },
        { 
          id: 'addPet',
          icon: 'add-circle', 
          title: t('profile.addAnimal'), 
          subtitle: 'Enregistrer un nouvel animal',
          color: colors.teal,
          bgColor: '#E0F2F1',
          onPress: () => navigation.navigate('AddPet')
        },
      ]
    },
    {
      title: 'Paramètres',
      icon: 'settings',
      items: [
        { 
          id: 'notifications',
          icon: 'notifications', 
          title: t('profile.notificationsTitle'), 
          subtitle: 'Gérer les notifications',
          color: '#FF9800',
          bgColor: '#FFF3E0',
          onPress: () => navigation.navigate('Notifications')
        },
        { 
          id: 'settings',
          icon: 'settings', 
          title: 'Paramètres', 
          subtitle: 'Modifier mon profil',
          color: '#9C27B0',
          bgColor: '#F3E5F5',
          onPress: () => navigation.navigate('EditProfile')
        },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with gradient background */}
      <View style={styles.headerContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.topRightButtons}>
            <LanguageSwitcher />
          </View>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {(user?.firstName?.[0] || 'J').toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.lightBlue} />
            <Text style={styles.location}>{user?.location || 'BELGIQUE'}</Text>
          </View>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={18} color={colors.white} />
            <Text style={styles.editButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#FCE4EC' }]}>
            <Ionicons name="paw" size={24} color="#E91E63" />
          </View>
          <Text style={styles.statNumber}>{isLoading ? '-' : petsCount}</Text>
          <Text style={styles.statLabel}>Animaux</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#E0F2F1' }]}>
            <MaterialCommunityIcons name="medical-bag" size={24} color={colors.teal} />
          </View>
          <Text style={styles.statNumber}>{isLoading ? '-' : 0}</Text>
          <Text style={styles.statLabel}>Visites</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconCircle, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="calendar" size={24} color="#FF9800" />
          </View>
          <Text style={styles.statNumber}>{isLoading ? '-' : remindersCount}</Text>
          <Text style={styles.statLabel}>Rappels</Text>
        </View>
      </View>

      {/* My Pets Horizontal Scroll */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mes Compagnons</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PetProfile')}>
          <Text style={styles.seeAllText}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {!isLoading && pets.length > 0 ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.petsScrollContainer}
        >
          {pets.map((pet) => (
            <TouchableOpacity 
              key={pet.id}
              style={styles.petCard}
              onPress={() => navigation.navigate('PetProfile')}
            >
              <Text style={styles.petEmoji}>{pet.emoji || '🐾'}</Text>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petAge}>{pet.age} ans</Text>
              <View style={styles.healthBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.teal} />
                <Text style={styles.healthBadgeText}>Sain</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={styles.addPetCardSmall}
            onPress={() => navigation.navigate('AddPet')}
          >
            <Ionicons name="add" size={32} color={colors.teal} />
            <Text style={styles.addPetTextSmall}>Ajouter</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : !isLoading ? (
        <View style={styles.noPetsMessage}>
          <Text style={styles.noPetsText}>Aucun animal enregistré</Text>
          <TouchableOpacity 
            style={styles.addPetButton}
            onPress={() => navigation.navigate('AddPet')}
          >
            <Ionicons name="add-circle" size={20} color={colors.teal} />
            <Text style={styles.addPetButtonText}>Ajouter votre premier animal</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Menu Sections */}
      {profileSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.menuSection}>
          <View style={styles.menuSectionHeader}>
            <Ionicons name={section.icon as any} size={20} color={colors.navy} />
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
          </View>

          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                itemIndex === section.items.length - 1 && styles.menuItemLast
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.bgColor }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.gray} />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={24} color={colors.red} />
        <Text style={styles.logoutText}>{t('common.logout')}</Text>
      </TouchableOpacity>

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
    paddingBottom: spacing.xl,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  name: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  location: {
    fontSize: typography.fontSize.sm,
    color: colors.lightBlue,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    marginTop: -spacing.xxl,
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
    marginTop: spacing.md,
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
  petsScrollContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  petCard: {
    width: 110,
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
  petEmoji: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  petName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  petAge: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  healthBadgeText: {
    fontSize: 10,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  addPetCardSmall: {
    width: 110,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.lightBlue,
    borderStyle: 'dashed',
    minHeight: 130,
  },
  addPetTextSmall: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
    marginTop: spacing.xs,
  },
  noPetsMessage: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  noPetsText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
  },
  addPetButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  menuSection: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#F8FAFB',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  menuSectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  menuItemSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.red,
    gap: spacing.sm,
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.red,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});
