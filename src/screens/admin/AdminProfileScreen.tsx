import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface AdminProfileScreenProps {
  navigation: any;
}

export const AdminProfileScreen: React.FC<AdminProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

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

  const adminStats = {
    usersManaged: 1248,
    vetsApproved: 89,
    reportsHandled: 342,
    actionsToday: 23,
  };

  const quickActions = [
    { id: '1', icon: 'people', label: 'Gérer utilisateurs', screen: 'AdminUsers', color: colors.teal, bgColor: colors.teal + '20' },
    { id: '2', icon: 'stethoscope', library: 'MaterialCommunityIcons', label: 'Valider vétérinaires', screen: 'AdminVets', color: '#9B59B6', bgColor: '#9B59B620' },
    { id: '3', icon: 'paw', label: 'Gérer animaux', screen: 'AdminPets', color: '#4ECDC4', bgColor: '#4ECDC420' },
    { id: '4', icon: 'stats-chart', label: 'Statistiques', screen: 'AdminAnalytics', color: colors.green, bgColor: colors.green + '20' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil Admin</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.profileImageContainer}>
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="shield-checkmark" size={60} color={colors.white} />
          </View>
        )}
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={16} color={colors.white} />
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      <View style={styles.contentCard}>
        <View style={styles.userInfoHeader}>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName?.toUpperCase()}</Text>
          <Text style={styles.userEmail}>{user?.email || 'admin@petcare.com'}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={colors.gray} />
            <Text style={styles.location}>Belgique - Administrateur Système</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Admin Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistiques d'administration</Text>
          <View style={styles.adminStatsGrid}>
            <View style={styles.adminStatCard}>
              <Ionicons name="people" size={24} color={colors.teal} />
              <Text style={styles.adminStatNumber}>{adminStats.usersManaged}</Text>
              <Text style={styles.adminStatLabel}>Utilisateurs</Text>
            </View>
            <View style={styles.adminStatCard}>
              <MaterialCommunityIcons name="stethoscope" size={24} color="#9B59B6" />
              <Text style={styles.adminStatNumber}>{adminStats.vetsApproved}</Text>
              <Text style={styles.adminStatLabel}>Vétérinaires</Text>
            </View>
            <View style={styles.adminStatCard}>
              <Ionicons name="flag" size={24} color="#FF6B6B" />
              <Text style={styles.adminStatNumber}>{adminStats.reportsHandled}</Text>
              <Text style={styles.adminStatLabel}>Signalements</Text>
            </View>
            <View style={styles.adminStatCard}>
              <Ionicons name="today" size={24} color={colors.green} />
              <Text style={styles.adminStatNumber}>{adminStats.actionsToday}</Text>
              <Text style={styles.adminStatLabel}>Aujourd'hui</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.bgColor }]}>
                  {action.library === 'MaterialCommunityIcons' ? (
                    <MaterialCommunityIcons name={action.icon as any} size={32} color={action.color} />
                  ) : (
                    <Ionicons name={action.icon as any} size={32} color={action.color} />
                  )}
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Account Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Paramètres du compte</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="person" size={24} color={colors.gray} />
              <Text style={styles.settingLabel}>Modifier le profil</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark" size={24} color={colors.gray} />
              <Text style={styles.settingLabel}>Sécurité & Permissions</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={24} color={colors.gray} />
              <Text style={styles.settingLabel}>Notifications admin</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text" size={24} color={colors.gray} />
              <Text style={styles.settingLabel}>Logs & Rapports</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="language" size={24} color={colors.gray} />
              <Text style={styles.settingLabel}>Langue</Text>
            </View>
            <Text style={styles.settingValue}>Français</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* System Info */}
        <View style={styles.systemInfoSection}>
          <Text style={styles.sectionTitle}>Informations système</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version de l'app:</Text>
              <Text style={styles.infoValue}>v2.1.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Environnement:</Text>
              <Text style={styles.infoValue}>Production</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dernière MAJ:</Text>
              <Text style={styles.infoValue}>20 Avr 2024</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={styles.logoutButtonText}>{t('common.logout')}</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.teal,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.teal,
  },
  adminBadge: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  adminBadgeText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  contentCard: {
    backgroundColor: colors.lightBlue,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  userInfoHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray,
    marginVertical: spacing.lg,
  },
  statsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  adminStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  adminStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  adminStatNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  adminStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  quickActionsSection: {
    marginBottom: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
    textAlign: 'center',
  },
  settingsSection: {
    marginBottom: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  settingValue: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginRight: spacing.sm,
  },
  systemInfoSection: {
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  logoutButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    fontWeight: typography.fontWeight.semiBold,
  },
});

