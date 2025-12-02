import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardScreenProps {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.morningGreeting');
    if (hour < 18) return t('home.afternoonGreeting');
    return t('home.eveningGreeting');
  };

  // Mock data for demo
  const stats = {
    totalUsers: 1248,
    totalPets: 2156,
    totalVets: 89,
    pendingVets: 12,
    activeUsers: 856,
    reportsToday: 3,
    revenue: '€12,450',
    growth: '+15%',
  };

  const recentActivity = [
    { id: '1', type: 'user', action: 'Nouvel utilisateur inscrit', name: 'Marie Dubois', time: '5 min' },
    { id: '2', type: 'vet', action: 'Demande vétérinaire en attente', name: 'Dr. Laurent', time: '12 min' },
    { id: '3', type: 'report', action: 'Signalement reçu', name: 'Commentaire inapproprié', time: '1h' },
    { id: '4', type: 'pet', action: 'Nouveau profil animal', name: 'Bella (Chien)', time: '2h' },
    { id: '5', type: 'vet', action: 'Vétérinaire validé', name: 'Dr. Sophie Martin', time: '3h' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return { name: 'person-add', library: 'Ionicons', color: colors.teal };
      case 'vet': return { name: 'medical', library: 'Ionicons', color: '#9B59B6' };
      case 'report': return { name: 'warning', library: 'Ionicons', color: '#FF6B6B' };
      case 'pet': return { name: 'paw', library: 'Ionicons', color: '#4ECDC4' };
      default: return { name: 'notifications', library: 'Ionicons', color: colors.gray };
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()} {user?.firstName}</Text>
          <Text style={styles.subtitle}>🔐 Administrateur</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('AdminProfile')}
        >
          <View style={styles.notificationWrapper}>
            <Ionicons name="person-circle" size={40} color={colors.teal} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.teal }]}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <Ionicons name="people" size={32} color={colors.white} />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Utilisateurs</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#4ECDC4' }]}
            onPress={() => navigation.navigate('AdminPets')}
          >
            <Ionicons name="paw" size={32} color={colors.white} />
            <Text style={styles.statNumber}>{stats.totalPets}</Text>
            <Text style={styles.statLabel}>Animaux</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#9B59B6' }]}
            onPress={() => navigation.navigate('AdminVets')}
          >
            <MaterialCommunityIcons name="stethoscope" size={32} color={colors.white} />
            <Text style={styles.statNumber}>{stats.totalVets}</Text>
            <Text style={styles.statLabel}>Vétérinaires</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#FF6B6B' }]}
            onPress={() => navigation.navigate('AdminVets')}
          >
            <Ionicons name="hourglass" size={32} color={colors.white} />
            <Text style={styles.statNumber}>{stats.pendingVets}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </TouchableOpacity>
        </View>

        {/* Performance Cards */}
        <View style={styles.performanceContainer}>
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Ionicons name="pulse" size={24} color={colors.teal} />
              <Text style={styles.performanceTitle}>Utilisateurs actifs</Text>
            </View>
            <Text style={styles.performanceNumber}>{stats.activeUsers}</Text>
            <Text style={styles.performanceSubtext}>En ligne maintenant</Text>
          </View>

          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Ionicons name="trending-up" size={24} color={colors.green} />
              <Text style={styles.performanceTitle}>Croissance</Text>
            </View>
            <Text style={styles.performanceNumber}>{stats.growth}</Text>
            <Text style={styles.performanceSubtext}>Ce mois-ci</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
        </View>

        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.teal + '20' }]}>
              <Ionicons name="people" size={32} color={colors.teal} />
            </View>
            <Text style={styles.actionText}>Gérer utilisateurs</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminVets')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#9B59B620' }]}>
              <MaterialCommunityIcons name="stethoscope" size={32} color="#9B59B6" />
            </View>
            <Text style={styles.actionText}>Valider vétérinaires</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminAnalytics')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#4ECDC420' }]}>
              <Ionicons name="stats-chart" size={32} color="#4ECDC4" />
            </View>
            <Text style={styles.actionText}>Statistiques</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminProfile')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: colors.navy + '20' }]}>
              <Ionicons name="settings" size={32} color={colors.navy} />
            </View>
            <Text style={styles.actionText}>Paramètres</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Tout voir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityContainer}>
          {recentActivity.map((activity) => {
            const icon = getActivityIcon(activity.type);
            return (
              <View key={activity.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: icon.color + '20' }]}>
                  <Ionicons name={icon.name as any} size={20} color={icon.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityAction}>{activity.action}</Text>
                  <Text style={styles.activityName}>{activity.name}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            );
          })}
        </View>

        {/* Alerts Section */}
        {stats.reportsToday > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning" size={24} color="#FF6B6B" />
              <Text style={styles.alertTitle}>Signalements à traiter</Text>
            </View>
            <Text style={styles.alertText}>
              {stats.reportsToday} nouveau{stats.reportsToday > 1 ? 'x' : ''} signalement{stats.reportsToday > 1 ? 's' : ''} nécessite{stats.reportsToday > 1 ? 'nt' : ''} votre attention
            </Text>
            <TouchableOpacity style={styles.alertButton}>
              <Text style={styles.alertButtonText}>Voir les signalements</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  profileButton: {
    padding: spacing.xs,
  },
  notificationWrapper: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statNumber: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  performanceContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  performanceTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  performanceNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.xs,
  },
  performanceSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  activityName: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
    marginTop: spacing.xs,
  },
  activityTime: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  alertCard: {
    backgroundColor: '#FF6B6B20',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: '#FF6B6B',
    marginLeft: spacing.sm,
  },
  alertText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    marginBottom: spacing.md,
  },
  alertButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  alertButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
});

