import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { PetSelector } from '../../components';
import {
  getVaccinationsByOwnerId,
  getTreatmentsByOwnerId,
  getMedicalHistoryByOwnerId,
  migrateHealthRecordsOwnerIds,
  type Vaccination,
  type Treatment,
  type MedicalHistory,
} from '../../services/firestoreService';

interface HealthRecordScreenProps {
  navigation: any;
}

type CategoryType = 'all' | 'vaccination' | 'treatment' | 'medicalHistory';

interface MedicalRecord {
  id: string;
  type: 'vaccination' | 'treatment' | 'medicalHistory';
  title: string;
  date: string;
  petName: string;
  petId: string;
  description?: string;
  veterinarian?: string;
  notes?: string;
  data: Vaccination | Treatment | MedicalHistory;
}

export const HealthRecordScreen: React.FC<HealthRecordScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, pets } = useAuth();
  const [selectedPetId, setSelectedPetId] = useState<string | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [healthRecords, setHealthRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHealthRecords = async (isRefresh = false) => {
    if (!user?.id) {
      console.log('⚠️ [HealthRecordScreen] Pas d\'user ID, arrêt du chargement');
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 [HealthRecordScreen] Chargement de l\'historique médical');
      console.log('👤 User ID:', user.id);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Charger toutes les données en parallèle
      const [vaccinations, treatments, medicalHistories] = await Promise.all([
        getVaccinationsByOwnerId(user.id),
        getTreatmentsByOwnerId(user.id),
        getMedicalHistoryByOwnerId(user.id),
      ]);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ [HealthRecordScreen] Données chargées depuis Firestore:');
      console.log('   💉 Vaccinations:', vaccinations.length);
      console.log('   💊 Traitements:', treatments.length);
      console.log('   📋 Antécédents:', medicalHistories.length);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Si aucune donnée n'est trouvée, lancer la migration
      if (vaccinations.length === 0 && treatments.length === 0 && medicalHistories.length === 0) {
        console.log('⚠️ [HealthRecordScreen] Aucune donnée trouvée, lancement de la migration...');
        try {
          await migrateHealthRecordsOwnerIds(user.id);
          console.log('✅ [HealthRecordScreen] Migration terminée, rechargement des données...');
          
          // Recharger les données après migration
          const [newVaccinations, newTreatments, newMedicalHistories] = await Promise.all([
            getVaccinationsByOwnerId(user.id),
            getTreatmentsByOwnerId(user.id),
            getMedicalHistoryByOwnerId(user.id),
          ]);
          
          console.log('📊 [HealthRecordScreen] Données après migration:');
          console.log('   💉 Vaccinations:', newVaccinations.length);
          console.log('   💊 Traitements:', newTreatments.length);
          console.log('   📋 Antécédents:', newMedicalHistories.length);
          
          // Utiliser les nouvelles données
          vaccinations.push(...newVaccinations);
          treatments.push(...newTreatments);
          medicalHistories.push(...newMedicalHistories);
        } catch (migrationError) {
          console.error('❌ [HealthRecordScreen] Erreur migration:', migrationError);
        }
      }

      // Convertir en MedicalRecord unifié
      const records: MedicalRecord[] = [
        ...vaccinations.map((v): MedicalRecord => {
          console.log('🔄 [HealthRecordScreen] Conversion vaccin:', v.type, 'pour', v.petName);
          return {
            id: v.id,
            type: 'vaccination',
            title: v.type,
            date: v.date,
            petName: v.petName,
            petId: v.petId,
            veterinarian: v.vet,
            notes: v.notes,
            data: v,
          };
        }),
        ...treatments.map((t): MedicalRecord => {
          console.log('🔄 [HealthRecordScreen] Conversion traitement:', t.name, 'pour', t.petName);
          return {
            id: t.id,
            type: 'treatment',
            title: t.name,
            date: t.startDate,
            petName: t.petName,
            petId: t.petId,
            description: `${t.name} - ${t.type}`,
            notes: t.notes,
            data: t,
          };
        }),
        ...medicalHistories.map((m): MedicalRecord => {
          console.log('🔄 [HealthRecordScreen] Conversion antécédent:', m.title, 'pour', m.petName);
          return {
            id: m.id,
            type: 'medicalHistory',
            title: m.title,
            date: m.date,
            petName: m.petName || '',
            petId: m.petId,
            description: m.description,
            data: m,
          };
        }),
      ];

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💾 [HealthRecordScreen] Total enregistrements après conversion:', records.length);
      console.log('📊 [HealthRecordScreen] Détail des enregistrements:');
      records.forEach((r, i) => {
        console.log(`   ${i + 1}. [${r.type}] ${r.title} - ${r.petName} - ${r.date}`);
      });
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      setHealthRecords(records);
      console.log('✅ [HealthRecordScreen] État mis à jour avec', records.length, 'enregistrements');
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [HealthRecordScreen] ERREUR lors du chargement:');
      console.error(error);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      setHealthRecords([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHealthRecords();
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadHealthRecords();
    }, [user?.id])
  );

  const onRefresh = () => {
    loadHealthRecords(true);
  };

  // Trier par date (plus récent d'abord)
  const sortedRecords = [...healthRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter by pet
  let filteredRecords = selectedPetId === 'all'
    ? sortedRecords
    : sortedRecords.filter(r => r.petId === selectedPetId);

  // Filter by category
  filteredRecords = selectedCategory === 'all' 
    ? filteredRecords 
    : filteredRecords.filter(r => r.type === selectedCategory);

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredRecords = filteredRecords.filter(record => 
      record.title.toLowerCase().includes(query) ||
      record.petName.toLowerCase().includes(query) ||
      record.description?.toLowerCase().includes(query) ||
      record.veterinarian?.toLowerCase().includes(query) ||
      record.notes?.toLowerCase().includes(query)
    );
  }

  const categories = [
    { key: 'all' as CategoryType, label: 'Tous', icon: 'apps', count: healthRecords.length },
    { key: 'vaccination' as CategoryType, label: 'Vaccins', icon: 'medical', count: healthRecords.filter(r => r.type === 'vaccination').length },
    { key: 'treatment' as CategoryType, label: 'Traitements', icon: 'fitness', count: healthRecords.filter(r => r.type === 'treatment').length },
    { key: 'medicalHistory' as CategoryType, label: 'Antécédents', icon: 'document-text', count: healthRecords.filter(r => r.type === 'medicalHistory').length },
  ];

  const getRecordStyle = (type: string) => {
    switch (type) {
      case 'vaccination':
        return { color: '#4CAF50', icon: 'medical' as const, bgColor: '#4CAF5015' };
      case 'treatment':
        return { color: '#FF9800', icon: 'fitness' as const, bgColor: '#FF980015' };
      case 'medicalHistory':
        return { color: '#2196F3', icon: 'document-text' as const, bgColor: '#2196F315' };
      default:
        return { color: colors.teal, icon: 'document-text' as const, bgColor: colors.lightBlue };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      vaccination: 'Vaccin',
      treatment: 'Traitement',
      medicalHistory: 'Antécédent',
    };
    return typeMap[type] || type;
  };

  const renderRecordCard = (record: MedicalRecord) => {
    const style = getRecordStyle(record.type);
    
    return (
      <View key={record.id} style={styles.recordCard}>
        <View style={[styles.recordIconContainer, { backgroundColor: style.bgColor }]}>
          <Ionicons name={style.icon} size={28} color={style.color} />
        </View>

        <View style={styles.recordContent}>
          <View style={styles.recordHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.recordTitle}>{record.title}</Text>
              <View style={styles.petTag}>
                <Ionicons name="paw" size={12} color={colors.teal} />
                <Text style={styles.petTagText}>{record.petName}</Text>
              </View>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: style.color }]}>
              <Text style={styles.typeBadgeText}>
                {getTypeName(record.type)}
              </Text>
            </View>
          </View>

          <View style={styles.recordDetails}>
            <View style={styles.recordDetailRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.gray} />
              <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
            </View>

            {record.veterinarian && (
              <View style={styles.recordDetailRow}>
                <Ionicons name="person-outline" size={16} color={colors.gray} />
                <Text style={styles.recordVet}>Dr. {record.veterinarian}</Text>
              </View>
            )}
          </View>

          {record.description && record.type === 'medicalHistory' && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText} numberOfLines={2}>{record.description}</Text>
            </View>
          )}

          {record.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText} numberOfLines={2}>{record.notes}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => {
            // Navigation vers le détail selon le type
            if (record.type === 'vaccination') {
              // Naviguer vers l'écran de vaccination
            } else if (record.type === 'treatment') {
              // Naviguer vers l'écran de traitement
            } else if (record.type === 'medicalHistory') {
              // Naviguer vers l'écran d'antécédent
            }
          }}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.gray} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.getParent()?.navigate('HomeTab', { screen: 'Home' })}
        >
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Historique médical</Text>

        <View style={styles.addButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search') || 'Rechercher...'}
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Pet Selector */}
      {pets && pets.length > 1 && (
        <PetSelector
          pets={pets}
          selectedPetId={selectedPetId}
          onSelectPet={setSelectedPetId}
          showAllOption={true}
        />
      )}

      {/* Categories Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={18} 
              color={selectedCategory === category.key ? colors.white : colors.navy} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.key && styles.categoryTextActive
            ]}>
              {category.label}
            </Text>
            <View style={[
              styles.categoryCount,
              selectedCategory === category.key && styles.categoryCountActive
            ]}>
              <Text style={[
                styles.categoryCountText,
                selectedCategory === category.key && styles.categoryCountTextActive
              ]}>
                {category.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />
          }
        >
          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{healthRecords.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {healthRecords.filter(r => r.type === 'vaccination').length}
              </Text>
              <Text style={styles.statLabel}>Vaccins</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {healthRecords.filter(r => r.type === 'treatment').length}
              </Text>
              <Text style={styles.statLabel}>Traitements</Text>
            </View>
          </View>

          {/* Records List */}
          {filteredRecords.length > 0 ? (
            <View style={styles.recordsList}>
              {filteredRecords.map(record => renderRecordCard(record))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyTitle}>Aucun enregistrement</Text>
              <Text style={styles.emptyText}>
                {selectedCategory === 'all' 
                  ? "Aucun dossier médical trouvé"
                  : `Aucun ${categories.find(c => c.key === selectedCategory)?.label.toLowerCase()}`
                }
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: spacing.xs,
    width: 40,
    alignItems: 'flex-end',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 45,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.black,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
  },
  categoriesScroll: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.lightBlue,
    gap: spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: colors.navy,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  categoryTextActive: {
    color: colors.white,
  },
  categoryCount: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: spacing.xs,
    minWidth: 24,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCountActive: {
    backgroundColor: colors.teal,
  },
  categoryCountText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  categoryCountTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
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
  recordsList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: spacing.md,
  },
  recordIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordContent: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  recordTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  petTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  petTagText: {
    fontSize: typography.fontSize.xs,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  recordDetails: {
    gap: spacing.xs,
  },
  recordDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recordDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  recordVet: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  notesContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  notesText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    fontStyle: 'italic',
  },
  moreButton: {
    padding: spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
});
