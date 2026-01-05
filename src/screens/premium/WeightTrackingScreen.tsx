import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { PremiumGate } from '../../components';
import { useAuth } from '../../context/AuthContext';

interface WeightTrackingScreenProps {
  navigation: any;
  route: any;
}

interface WeightEntry {
  date: Date;
  weight: number;
  notes?: string;
}

export const WeightTrackingScreen: React.FC<WeightTrackingScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const pet = route.params?.pet;
  
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([
    { date: new Date('2024-01-15'), weight: 25.5, notes: 'Visite vétérinaire' },
    { date: new Date('2024-02-15'), weight: 26.2 },
    { date: new Date('2024-03-15'), weight: 26.8 },
    { date: new Date('2024-04-15'), weight: 27.5 },
    { date: new Date('2024-05-15'), weight: 28.0, notes: 'Changement alimentation' },
    { date: new Date('2024-06-15'), weight: 28.3 },
    { date: new Date('2024-07-15'), weight: 28.8 },
    { date: new Date('2024-08-15'), weight: 29.2 },
    { date: new Date('2024-09-15'), weight: 29.5 },
    { date: new Date('2024-10-15'), weight: 29.8 },
    { date: new Date('2024-11-15'), weight: 30.0 },
    { date: new Date('2024-12-15'), weight: 30.2 },
  ]);

  const screenWidth = Dimensions.get('window').width;

  // Calculer les statistiques
  const currentWeight = weightEntries[weightEntries.length - 1]?.weight || 0;
  const previousWeight = weightEntries[weightEntries.length - 2]?.weight || 0;
  const weightChange = currentWeight - previousWeight;
  const minWeight = Math.min(...weightEntries.map(e => e.weight));
  const maxWeight = Math.max(...weightEntries.map(e => e.weight));
  const avgWeight = weightEntries.reduce((sum, e) => sum + e.weight, 0) / weightEntries.length;

  // Préparer les données pour le graphique
  const chartData = {
    labels: weightEntries.slice(-6).map(e => 
      e.date.toLocaleDateString('fr-FR', { month: 'short' })
    ),
    datasets: [{
      data: weightEntries.slice(-6).map(e => e.weight),
      color: (opacity = 1) => `rgba(27, 169, 181, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  const handleAddWeight = () => {
    Alert.alert(
      'Ajouter une pesée',
      'Cette fonctionnalité sera bientôt disponible',
      [{ text: 'OK' }]
    );
  };

  return (
    <PremiumGate featureName="Le suivi de poids avancé" navigation={navigation}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Suivi de poids</Text>
            <Text style={styles.headerSubtitle}>{pet?.name || 'Mon animal'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddWeight}
          >
            <Ionicons name="add" size={28} color={colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Statistiques */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="speedometer" size={32} color={colors.teal} />
              <Text style={styles.statValue}>{currentWeight.toFixed(1)} kg</Text>
              <Text style={styles.statLabel}>Poids actuel</Text>
              {weightChange !== 0 && (
                <View style={[styles.changeBadge, weightChange > 0 ? styles.increaseBadge : styles.decreasebadge]}>
                  <Ionicons 
                    name={weightChange > 0 ? 'trending-up' : 'trending-down'} 
                    size={14} 
                    color={weightChange > 0 ? colors.success : colors.error} 
                  />
                  <Text style={[styles.changeText, weightChange > 0 ? styles.increaseText : styles.decreaseText]}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.statCard}>
              <Ionicons name="analytics" size={32} color="#FFB300" />
              <Text style={styles.statValue}>{avgWeight.toFixed(1)} kg</Text>
              <Text style={styles.statLabel}>Moyenne</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="arrow-down" size={32} color="#4ECDC4" />
              <Text style={styles.statValue}>{minWeight.toFixed(1)} kg</Text>
              <Text style={styles.statLabel}>Minimum</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="arrow-up" size={32} color="#FF6B6B" />
              <Text style={styles.statValue}>{maxWeight.toFixed(1)} kg</Text>
              <Text style={styles.statLabel}>Maximum</Text>
            </View>
          </View>

          {/* Graphique */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Évolution sur 6 mois</Text>
            <LineChart
              data={chartData}
              width={screenWidth - (spacing.xl * 2) - 40}
              height={220}
              chartConfig={{
                backgroundColor: colors.white,
                backgroundGradientFrom: colors.white,
                backgroundGradientTo: colors.white,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(27, 169, 181, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(63, 61, 124, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: colors.teal,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          {/* Alertes et recommandations */}
          <View style={styles.insightsCard}>
            <Text style={styles.sectionTitle}>Recommandations</Text>
            
            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Évolution saine</Text>
                <Text style={styles.insightText}>
                  Le poids de votre animal progresse normalement
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="alert-circle" size={24} color={colors.warning} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Augmentation constante</Text>
                <Text style={styles.insightText}>
                  Surveillez l'alimentation pour éviter le surpoids
                </Text>
              </View>
            </View>
          </View>

          {/* Historique */}
          <View style={styles.historyCard}>
            <Text style={styles.sectionTitle}>Historique des pesées</Text>
            
            {weightEntries.slice().reverse().map((entry, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Ionicons name="calendar" size={18} color={colors.teal} />
                  <Text style={styles.historyDateText}>
                    {entry.date.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={styles.historyWeight}>{entry.weight.toFixed(1)} kg</Text>
                {entry.notes && (
                  <Text style={styles.historyNotes}>{entry.notes}</Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </PremiumGate>
  );
};

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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  statsContainer: {
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
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  increaseBadge: {
    backgroundColor: colors.success + '20',
  },
  decreaseBadge: {
    backgroundColor: colors.error + '20',
  },
  changeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  increaseText: {
    color: colors.success,
  },
  decreaseText: {
    color: colors.error,
  },
  chartCard: {
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
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  insightsCard: {
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
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  insightText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    lineHeight: 20,
  },
  historyCard: {
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
  historyItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  historyDateText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  historyWeight: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  historyNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});




