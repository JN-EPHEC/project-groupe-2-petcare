import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface AdminDashboardScreenProps {
  navigation: any;
}

interface DashboardStats {
  totalUsers: number;
  totalPets: number;
  totalVets: number;
  premiumUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPets: 0,
    totalVets: 0,
    premiumUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);

      // Total des utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Vétérinaires
      const vetsQuery = query(collection(db, 'users'), where('role', '==', 'vet'));
      const vetsSnapshot = await getDocs(vetsQuery);
      const totalVets = vetsSnapshot.size;

      // Utilisateurs premium
      const premiumQuery = query(collection(db, 'users'), where('isPremium', '==', true));
      const premiumSnapshot = await getDocs(premiumQuery);
      const premiumUsers = premiumSnapshot.size;

      // Total des animaux
      const petsSnapshot = await getDocs(collection(db, 'pets'));
      const totalPets = petsSnapshot.size;

      // Nouveaux utilisateurs ce mois
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const newUsersQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', firstDayOfMonth)
      );
      const newUsersSnapshot = await getDocs(newUsersQuery);
      const newUsersThisMonth = newUsersSnapshot.size;

      // Utilisateurs actifs (simulé - à implémenter avec analytics)
      const activeUsers = Math.floor(totalUsers * 0.65);

      setStats({
        totalUsers,
        totalPets,
        totalVets,
        premiumUsers,
        activeUsers,
        newUsersThisMonth,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tableau de bord Admin</Text>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={20} color={colors.white} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />
        }
      >
        {/* Statistiques principales */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="people"
            iconColor="#4ECDC4"
            value={stats.totalUsers.toString()}
            label="Utilisateurs"
            onPress={() => navigation.navigate('UsersList')}
          />
          <StatCard
            icon="paw"
            iconColor="#FFB300"
            value={stats.totalPets.toString()}
            label="Animaux"
          />
          <StatCard
            icon="medical"
            iconColor="#1BA9B5"
            value={stats.totalVets.toString()}
            label="Vétérinaires"
            onPress={() => navigation.navigate('VetsList')}
          />
          <StatCard
            icon="star"
            iconColor="#FF6B6B"
            value={stats.premiumUsers.toString()}
            label="Premium"
          />
        </View>

        {/* Indicateurs de performance */}
        <View style={styles.performanceCard}>
          <Text style={styles.sectionTitle}>Performance</Text>
          
          <PerformanceItem
            icon="trending-up"
            label="Nouveaux utilisateurs ce mois"
            value={stats.newUsersThisMonth}
            color={colors.success}
          />
          
          <PerformanceItem
            icon="pulse"
            label="Utilisateurs actifs"
            value={stats.activeUsers}
            percentage={Math.round((stats.activeUsers / stats.totalUsers) * 100)}
            color={colors.teal}
          />
          
          <PerformanceItem
            icon="star-half"
            label="Taux de conversion Premium"
            value={stats.premiumUsers}
            percentage={Math.round((stats.premiumUsers / stats.totalUsers) * 100)}
            color="#FFB300"
          />
        </View>

        {/* Actions rapides */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <QuickActionButton
            icon="people-outline"
            title="Gérer les utilisateurs"
            subtitle="Consulter, suspendre, supprimer"
            color={colors.teal}
            onPress={() => navigation.navigate('UsersList')}
          />
          
          <QuickActionButton
            icon="medical-outline"
            title="Gérer les vétérinaires"
            subtitle="Valider, suspendre, statistiques"
            color="#1BA9B5"
            onPress={() => navigation.navigate('VetsList')}
          />
          
          <QuickActionButton
            icon="analytics-outline"
            title="Statistiques détaillées"
            subtitle="Graphiques, exports, rapports"
            color="#4ECDC4"
            onPress={() => navigation.navigate('DetailedStats')}
          />
          
          <QuickActionButton
            icon="settings-outline"
            title="Paramètres globaux"
            subtitle="Configuration de l'application"
            color="#FF6B6B"
            onPress={() => navigation.navigate('GlobalSettings')}
          />
        </View>

        {/* Distribution des animaux par espèce */}
        <View style={styles.distributionCard}>
          <Text style={styles.sectionTitle}>Distribution des animaux</Text>
          
          <DistributionItem label="Chiens" value={45} total={stats.totalPets} icon="🐕" />
          <DistributionItem label="Chats" value={38} total={stats.totalPets} icon="🐈" />
          <DistributionItem label="Lapins" value={8} total={stats.totalPets} icon="🐰" />
          <DistributionItem label="Rongeurs" value={5} total={stats.totalPets} icon="🐹" />
          <DistributionItem label="Oiseaux" value={4} total={stats.totalPets} icon="🐦" />
        </View>
      </ScrollView>
    </View>
  );
};

const StatCard: React.FC<{
  icon: string;
  iconColor: string;
  value: string;
  label: string;
  onPress?: () => void;
}> = ({ icon, iconColor, value, label, onPress }) => (
  <TouchableOpacity 
    style={styles.statCard}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={[styles.statIcon, { backgroundColor: iconColor + '20' }]}>
      <Ionicons name={icon as any} size={28} color={iconColor} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

const PerformanceItem: React.FC<{
  icon: string;
  label: string;
  value: number;
  percentage?: number;
  color: string;
}> = ({ icon, label, value, percentage, color }) => (
  <View style={styles.performanceItem}>
    <View style={[styles.performanceIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={20} color={color} />
    </View>
    <View style={styles.performanceContent}>
      <Text style={styles.performanceLabel}>{label}</Text>
      <View style={styles.performanceValues}>
        <Text style={styles.performanceValue}>{value}</Text>
        {percentage !== undefined && (
          <Text style={[styles.performancePercentage, { color }]}>
            ({percentage}%)
          </Text>
        )}
      </View>
    </View>
  </View>
);

const QuickActionButton: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}> = ({ icon, title, subtitle, color, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <View style={styles.actionContent}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.gray} />
  </TouchableOpacity>
);

const DistributionItem: React.FC<{
  label: string;
  value: number;
  total: number;
  icon: string;
}> = ({ label, value, total, icon }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <View style={styles.distributionItem}>
      <View style={styles.distributionHeader}>
        <Text style={styles.distributionIcon}>{icon}</Text>
        <Text style={styles.distributionLabel}>{label}</Text>
        <Text style={styles.distributionValue}>{value}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.gray,
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
    marginRight: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  adminBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  performanceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  performanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  performanceContent: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  performanceValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  performanceValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  performancePercentage: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  quickActionsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  distributionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  distributionItem: {
    marginBottom: spacing.md,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  distributionIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  distributionLabel: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  distributionValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 4,
  },
});
