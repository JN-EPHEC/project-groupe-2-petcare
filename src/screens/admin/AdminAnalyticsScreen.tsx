import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface AdminAnalyticsScreenProps {
  navigation: any;
}

export const AdminAnalyticsScreen: React.FC<AdminAnalyticsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();

  // Mock analytics data
  const analytics = {
    overview: {
      totalUsers: 1248,
      activeToday: 856,
      newThisMonth: 127,
      growth: '+15.3%',
    },
    pets: {
      total: 2156,
      cats: 987,
      dogs: 1053,
      others: 116,
      newThisMonth: 89,
    },
    vets: {
      total: 89,
      active: 78,
      pending: 12,
      avgRating: 4.6,
    },
    engagement: {
      dailyActive: 856,
      monthlyActive: 1102,
      retention: '87%',
      avgSessionTime: '12min',
    },
    revenue: {
      monthly: '€12,450',
      subscriptions: 423,
      growth: '+18.5%',
      churnRate: '3.2%',
    },
  };

  const topVets = [
    { name: 'Dr. Sophie Martin', specialty: 'Dentiste', rating: 4.9, patients: 42 },
    { name: 'Dr. Jean Laurent', specialty: 'Chirurgien', rating: 4.8, patients: 38 },
    { name: 'Dr. Marie Dupont', specialty: 'Généraliste', rating: 4.7, patients: 35 },
  ];

  const recentTrends = [
    { metric: 'Inscriptions', value: '+23%', trend: 'up', color: colors.green },
    { metric: 'Consultations', value: '+15%', trend: 'up', color: colors.green },
    { metric: 'Rétention', value: '+5%', trend: 'up', color: colors.green },
    { metric: 'Désabonnements', value: '-2%', trend: 'down', color: '#FF6B6B' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Statistiques & Analytics</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download" size={24} color={colors.teal} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Overview Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          <Text style={styles.sectionSubtitle}>Ce mois-ci</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.teal }]}>
            <Ionicons name="people" size={28} color={colors.white} />
            <Text style={styles.statCardNumber}>{analytics.overview.totalUsers}</Text>
            <Text style={styles.statCardLabel}>Utilisateurs totaux</Text>
            <View style={styles.growthBadge}>
              <Ionicons name="trending-up" size={12} color={colors.white} />
              <Text style={styles.growthText}>{analytics.overview.growth}</Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#4ECDC4' }]}>
            <Ionicons name="pulse" size={28} color={colors.white} />
            <Text style={styles.statCardNumber}>{analytics.overview.activeToday}</Text>
            <Text style={styles.statCardLabel}>Actifs aujourd'hui</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#9B59B6' }]}>
            <MaterialCommunityIcons name="stethoscope" size={28} color={colors.white} />
            <Text style={styles.statCardNumber}>{analytics.vets.total}</Text>
            <Text style={styles.statCardLabel}>Vétérinaires</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.green }]}>
            <Ionicons name="paw" size={28} color={colors.white} />
            <Text style={styles.statCardNumber}>{analytics.pets.total}</Text>
            <Text style={styles.statCardLabel}>Animaux</Text>
          </View>
        </View>

        {/* Trends Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tendances récentes</Text>
        </View>

        <View style={styles.trendsContainer}>
          {recentTrends.map((trend, index) => (
            <View key={index} style={styles.trendCard}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendMetric}>{trend.metric}</Text>
                <Ionicons 
                  name={trend.trend === 'up' ? 'trending-up' : 'trending-down'} 
                  size={20} 
                  color={trend.color} 
                />
              </View>
              <Text style={[styles.trendValue, { color: trend.color }]}>{trend.value}</Text>
            </View>
          ))}
        </View>

        {/* Pet Distribution */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Distribution des animaux</Text>
        </View>

        <View style={styles.distributionContainer}>
          <View style={styles.distributionItem}>
            <View style={[styles.distributionBar, { width: `${(analytics.pets.cats / analytics.pets.total) * 100}%`, backgroundColor: '#4ECDC4' }]} />
            <View style={styles.distributionInfo}>
              <Text style={styles.distributionEmoji}>🐱</Text>
              <View style={styles.distributionTextContainer}>
                <Text style={styles.distributionLabel}>Chats</Text>
                <Text style={styles.distributionValue}>{analytics.pets.cats}</Text>
              </View>
              <Text style={styles.distributionPercent}>
                {Math.round((analytics.pets.cats / analytics.pets.total) * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.distributionItem}>
            <View style={[styles.distributionBar, { width: `${(analytics.pets.dogs / analytics.pets.total) * 100}%`, backgroundColor: colors.teal }]} />
            <View style={styles.distributionInfo}>
              <Text style={styles.distributionEmoji}>🐕</Text>
              <View style={styles.distributionTextContainer}>
                <Text style={styles.distributionLabel}>Chiens</Text>
                <Text style={styles.distributionValue}>{analytics.pets.dogs}</Text>
              </View>
              <Text style={styles.distributionPercent}>
                {Math.round((analytics.pets.dogs / analytics.pets.total) * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.distributionItem}>
            <View style={[styles.distributionBar, { width: `${(analytics.pets.others / analytics.pets.total) * 100}%`, backgroundColor: '#9B59B6' }]} />
            <View style={styles.distributionInfo}>
              <Text style={styles.distributionEmoji}>🐰</Text>
              <View style={styles.distributionTextContainer}>
                <Text style={styles.distributionLabel}>Autres</Text>
                <Text style={styles.distributionValue}>{analytics.pets.others}</Text>
              </View>
              <Text style={styles.distributionPercent}>
                {Math.round((analytics.pets.others / analytics.pets.total) * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Top Vets */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top vétérinaires</Text>
        </View>

        <View style={styles.topVetsContainer}>
          {topVets.map((vet, index) => (
            <View key={index} style={styles.topVetCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.topVetInfo}>
                <Text style={styles.topVetName}>{vet.name}</Text>
                <Text style={styles.topVetSpecialty}>{vet.specialty}</Text>
              </View>
              <View style={styles.topVetStats}>
                <View style={styles.topVetStat}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.topVetStatText}>{vet.rating}</Text>
                </View>
                <View style={styles.topVetStat}>
                  <Ionicons name="people" size={14} color={colors.gray} />
                  <Text style={styles.topVetStatText}>{vet.patients}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Engagement Metrics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Engagement utilisateurs</Text>
        </View>

        <View style={styles.engagementGrid}>
          <View style={styles.engagementCard}>
            <Ionicons name="today" size={24} color={colors.teal} />
            <Text style={styles.engagementNumber}>{analytics.engagement.dailyActive}</Text>
            <Text style={styles.engagementLabel}>Actifs quotidiens</Text>
          </View>

          <View style={styles.engagementCard}>
            <Ionicons name="calendar" size={24} color={colors.teal} />
            <Text style={styles.engagementNumber}>{analytics.engagement.monthlyActive}</Text>
            <Text style={styles.engagementLabel}>Actifs mensuels</Text>
          </View>

          <View style={styles.engagementCard}>
            <Ionicons name="repeat" size={24} color={colors.green} />
            <Text style={styles.engagementNumber}>{analytics.engagement.retention}</Text>
            <Text style={styles.engagementLabel}>Rétention</Text>
          </View>

          <View style={styles.engagementCard}>
            <Ionicons name="time" size={24} color={colors.teal} />
            <Text style={styles.engagementNumber}>{analytics.engagement.avgSessionTime}</Text>
            <Text style={styles.engagementLabel}>Session moyenne</Text>
          </View>
        </View>

        {/* Revenue Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Revenus & Abonnements</Text>
        </View>

        <View style={styles.revenueContainer}>
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <Ionicons name="cash" size={28} color={colors.green} />
              <View style={styles.revenueGrowth}>
                <Ionicons name="trending-up" size={16} color={colors.green} />
                <Text style={styles.revenueGrowthText}>{analytics.revenue.growth}</Text>
              </View>
            </View>
            <Text style={styles.revenueAmount}>{analytics.revenue.monthly}</Text>
            <Text style={styles.revenueLabel}>Revenus mensuels</Text>
          </View>

          <View style={styles.revenueStatsGrid}>
            <View style={styles.revenueStatCard}>
              <Text style={styles.revenueStatNumber}>{analytics.revenue.subscriptions}</Text>
              <Text style={styles.revenueStatLabel}>Abonnements actifs</Text>
            </View>
            <View style={styles.revenueStatCard}>
              <Text style={styles.revenueStatNumber}>{analytics.revenue.churnRate}</Text>
              <Text style={styles.revenueStatLabel}>Taux de désabonnement</Text>
            </View>
          </View>
        </View>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  exportButton: {
    padding: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  statCardNumber: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  statCardLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    marginTop: spacing.xs,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  growthText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  trendsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  trendCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  trendMetric: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontWeight: typography.fontWeight.semiBold,
  },
  trendValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  distributionContainer: {
    gap: spacing.md,
  },
  distributionItem: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    overflow: 'hidden',
  },
  distributionBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  distributionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  distributionEmoji: {
    fontSize: 24,
  },
  distributionTextContainer: {
    flex: 1,
  },
  distributionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  distributionValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  distributionPercent: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  topVetsContainer: {
    gap: spacing.sm,
  },
  topVetCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  topVetInfo: {
    flex: 1,
  },
  topVetName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  topVetSpecialty: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  topVetStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  topVetStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  topVetStatText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  engagementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  engagementCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  engagementNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.sm,
  },
  engagementLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  revenueContainer: {
    gap: spacing.md,
  },
  revenueCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  revenueGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  revenueGrowthText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.green,
  },
  revenueAmount: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  revenueLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  revenueStatsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  revenueStatCard: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  revenueStatNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  revenueStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

