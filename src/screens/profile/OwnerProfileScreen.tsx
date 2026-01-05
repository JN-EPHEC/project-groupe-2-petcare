import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, CommonActions } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { LanguageSwitcher, PremiumBadge } from '../../components';
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    console.log('🚪 Bouton déconnexion cliqué');
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    console.log('🚪 Déconnexion confirmée');
    try {
      await signOut();
      console.log('✅ SignOut effectué');
      
      // Réinitialiser complètement la navigation pour revenir à Splash
      // Utiliser CommonActions pour un reset global depuis un nested navigator
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Splash' }],
        })
      );
      console.log('✅ Navigation réinitialisée');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
    }
  };

  const profileSections = [
    {
      title: 'Paramètres du compte',
      icon: 'settings',
      items: [
        { 
          id: 'profile',
          icon: 'person-circle', 
          title: 'Mes informations', 
          subtitle: 'Modifier mon profil',
          color: colors.teal,
          bgColor: '#E0F2F1',
          onPress: () => navigation.navigate('UserProfileDetail')
        },
        ...(user?.isPremium ? [] : [{ 
          id: 'premium',
          icon: 'star', 
          title: 'Passer à Premium', 
          subtitle: 'Débloquez toutes les fonctionnalités',
          color: '#FFB300',
          bgColor: '#FFF8E1',
          onPress: () => navigation.navigate('Premium')
        }]),
        { 
          id: 'notifications',
          icon: 'notifications', 
          title: 'Notifications', 
          subtitle: 'Gérer les notifications',
          color: '#FF9800',
          bgColor: '#FFF3E0',
          onPress: () => navigation.navigate('NotificationSettings')
        },
        { 
          id: 'cookies',
          icon: 'shield-checkmark', 
          title: 'Gestion des cookies', 
          subtitle: 'Contrôlez vos données et préférences',
          color: colors.teal,
          bgColor: '#E0F2F1',
          onPress: () => navigation.navigate('CookieSettings')
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
          
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
            {user?.isPremium && (
              <PremiumBadge size="small" />
            )}
          </View>
          
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={colors.lightBlue} />
            <Text style={styles.location}>{user?.location || 'BELGIQUE'}</Text>
          </View>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('UserProfileDetail')}
          >
            <Ionicons name="create-outline" size={18} color={colors.white} />
            <Text style={styles.editButtonText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Spacer */}
      <View style={{ height: spacing.lg }} />

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

              {(item as any).badge && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>{(item as any).badge}</Text>
                </View>
              )}

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
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalIcon}>
              <Ionicons name="log-out-outline" size={48} color="#FF6B6B" />
            </View>
            
            <Text style={styles.modalTitle}>🚪 Déconnexion</Text>
            <Text style={styles.modalMessage}>
              Voulez-vous vraiment vous déconnecter ?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.modalConfirmText}>Déconnexion</Text>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
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
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: colors.white,
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
  addPremiumCardSmall: {
    width: 110,
    backgroundColor: '#FFF8E1',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFB300',
    minHeight: 130,
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addPremiumTextSmall: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#FFB300',
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
  activeBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  activeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
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
