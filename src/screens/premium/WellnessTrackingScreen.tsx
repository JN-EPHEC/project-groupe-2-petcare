import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { PremiumGate, WellnessChart, WellnessAlert } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { getPetsByOwnerId } from '../../services/firestoreService';
import { getWellnessData, getActiveAlerts, dismissAlert } from '../../services/wellnessService';
import { WellnessEntry, WellnessAlert as WellnessAlertType } from '../../types/premium';
import { getWellnessIcon, getWellnessLabel } from '../../utils/wellnessAnalytics';

interface WellnessTrackingScreenProps {
  navigation: any;
}

export const WellnessTrackingScreen: React.FC<WellnessTrackingScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<'weight' | 'activity' | 'food' | 'growth'>('weight');
  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [wellnessData, setWellnessData] = useState<WellnessEntry[]>([]);
  const [alerts, setAlerts] = useState<WellnessAlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const types = [
    { id: 'weight', label: 'Poids', icon: 'scale-outline', color: '#FF6B6B' },
    { id: 'activity', label: 'Activité', icon: 'walk-outline', color: '#4ECDC4' },
    { id: 'food', label: 'Alimentation', icon: 'restaurant-outline', color: '#FFB300' },
    { id: 'growth', label: 'Croissance', icon: 'trending-up-outline', color: '#95E1D3' },
  ];
  
  const periods = [
    { id: '7d', label: '7j' },
    { id: '1m', label: '1m' },
    { id: '3m', label: '3m' },
    { id: '1y', label: '1an' },
    { id: 'all', label: 'Tout' },
  ];
  
  useEffect(() => {
    loadPets();
  }, [user]);
  
  useFocusEffect(
    useCallback(() => {
      if (selectedPet) {
        loadWellnessData();
        loadAlerts();
      }
    }, [selectedPet, selectedType, selectedPeriod])
  );
  
  const loadPets = async () => {
    if (!user?.id) return;
    
    try {
      const userPets = await getPetsByOwnerId(user.id);
      setPets(userPets);
      if (userPets.length > 0 && !selectedPet) {
        setSelectedPet(userPets[0]);
      }
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };
  
  const loadWellnessData = async () => {
    if (!selectedPet) return;
    
    try {
      setIsLoading(true);
      const data = await getWellnessData(selectedPet.id, selectedType, selectedPeriod);
      setWellnessData(data);
    } catch (error) {
      console.error('Error loading wellness data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadAlerts = async () => {
    if (!selectedPet) return;
    
    try {
      const activeAlerts = await getActiveAlerts(selectedPet.id);
      setAlerts(activeAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };
  
  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };
  
  return (
    <PremiumGate featureName="Le suivi bien-être" navigation={navigation}>
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
            <Text style={styles.headerTitle}>Suivi Bien-être</Text>
            <Text style={styles.headerSubtitle}>Suivez la santé de votre animal</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddWellnessEntry', { petId: selectedPet?.id })}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Pet Selector */}
          {pets.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.petSelector}
            >
              {pets.map(pet => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petChip,
                    selectedPet?.id === pet.id && styles.petChipSelected
                  ]}
                  onPress={() => setSelectedPet(pet)}
                >
                  <Text style={styles.petEmoji}>{pet.emoji}</Text>
                  <Text style={[
                    styles.petName,
                    selectedPet?.id === pet.id && styles.petNameSelected
                  ]}>
                    {pet.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          {/* Alerts */}
          {alerts.length > 0 && (
            <View style={styles.alertsSection}>
              <Text style={styles.sectionTitle}>Alertes</Text>
              {alerts.map(alert => (
                <WellnessAlert
                  key={alert.id}
                  alert={alert}
                  onDismiss={handleDismissAlert}
                />
              ))}
            </View>
          )}
          
          {/* Type Tabs */}
          <View style={styles.typeTabs}>
            {types.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeTab,
                  selectedType === type.id && { 
                    backgroundColor: type.color,
                    borderColor: type.color 
                  }
                ]}
                onPress={() => setSelectedType(type.id as any)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={24} 
                  color={selectedType === type.id ? colors.white : type.color} 
                />
                <Text style={[
                  styles.typeTabText,
                  selectedType === type.id && { color: colors.white }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {periods.map(period => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodChip,
                  selectedPeriod === period.id && styles.periodChipSelected
                ]}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period.id && styles.periodTextSelected
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Chart */}
          <View style={styles.chartSection}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.teal} />
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            ) : (
              <WellnessChart 
                data={wellnessData}
                type={selectedType}
                period={selectedPeriod}
              />
            )}
          </View>
          
          {/* Recent Entries */}
          {wellnessData.length > 0 && (
            <View style={styles.entriesSection}>
              <Text style={styles.sectionTitle}>Dernières mesures</Text>
              {wellnessData.slice(0, 5).map((entry, index) => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryIcon}>
                    <Ionicons 
                      name={getWellnessIcon(entry.type) as any} 
                      size={24} 
                      color={types.find(t => t.id === entry.type)?.color || colors.teal} 
                    />
                  </View>
                  
                  <View style={styles.entryContent}>
                    <Text style={styles.entryValue}>
                      {entry.value} {entry.unit}
                    </Text>
                    <Text style={styles.entryDate}>
                      {new Date(entry.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                    {entry.notes && (
                      <Text style={styles.entryNotes} numberOfLines={2}>{entry.notes}</Text>
                    )}
                  </View>
                  
                  {index === 0 && (
                    <View style={styles.latestBadge}>
                      <Text style={styles.latestBadgeText}>Dernier</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petSelector: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.lightGray,
    gap: spacing.xs,
  },
  petChipSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  petEmoji: {
    fontSize: 24,
  },
  petName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  petNameSelected: {
    color: colors.white,
  },
  alertsSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  typeTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    gap: spacing.xs,
  },
  typeTabText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  periodChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  periodChipSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  periodText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  periodTextSelected: {
    color: colors.white,
  },
  chartSection: {
    paddingHorizontal: spacing.xl,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.md,
  },
  entriesSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  entryCard: {
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
  entryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  entryContent: {
    flex: 1,
  },
  entryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  entryDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  entryNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  latestBadge: {
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  latestBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});





