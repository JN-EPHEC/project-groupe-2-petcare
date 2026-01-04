import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getHealthRecordsByOwnerId } from '../../services/firestoreService';

interface HealthRecordScreenProps {
  navigation: any;
}

type CategoryType = 'all' | 'vaccine' | 'treatment' | 'surgery' | 'operation' | 'vermifuge';

export const HealthRecordScreen: React.FC<HealthRecordScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentPet, user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [healthRecords, setHealthRecords] = useState<any[]>([]);

  useEffect(() => {
    const loadHealthRecords = async () => {
      if (user?.id) {
        try {
          const records = await getHealthRecordsByOwnerId(user.id);
          setHealthRecords(records);
        } catch (error) {
          console.error('Error loading health records:', error);
          setHealthRecords([]);
        }
      }
    };
    loadHealthRecords();
  }, [user?.id]);

  // Trier par date (plus récent d'abord)
  const sortedRecords = [...healthRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Filter by category
  let filteredRecords = selectedCategory === 'all' 
    ? sortedRecords 
    : sortedRecords.filter(r => r.type === selectedCategory);

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredRecords = filteredRecords.filter(record => 
      record.description.toLowerCase().includes(query) ||
      record.veterinarian?.toLowerCase().includes(query) ||
      record.notes?.toLowerCase().includes(query)
    );
  }

  const categories = [
    { key: 'all' as CategoryType, label: 'Tous', icon: 'apps', count: healthRecords.length },
    { key: 'vaccine' as CategoryType, label: t('health.healthRecord.vaccines'), icon: 'medical', count: healthRecords.filter(r => r.type === 'vaccine').length },
    { key: 'treatment' as CategoryType, label: t('health.healthRecord.treatments'), icon: 'bandage', count: healthRecords.filter(r => r.type === 'treatment').length },
    { key: 'surgery' as CategoryType, label: t('health.healthRecord.surgeries'), icon: 'cut', count: healthRecords.filter(r => r.type === 'surgery').length },
    { key: 'vermifuge' as CategoryType, label: t('health.healthRecord.vermifuges'), icon: 'water', count: healthRecords.filter(r => r.type === 'vermifuge').length },
  ];

  const getRecordStyle = (type: string) => {
    switch (type) {
      case 'vaccine':
        return { color: '#4ECDC4', icon: 'medical' as const, bgColor: '#4ECDC420' };
      case 'treatment':
        return { color: '#FF6B6B', icon: 'bandage' as const, bgColor: '#FF6B6B20' };
      case 'surgery':
        return { color: '#9B59B6', icon: 'cut' as const, bgColor: '#9B59B620' };
      case 'operation':
        return { color: '#E67E22', icon: 'clipboard' as const, bgColor: '#E67E2220' };
      case 'vermifuge':
        return { color: '#3498DB', icon: 'water' as const, bgColor: '#3498DB20' };
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
      vaccine: t('health.healthRecord.vaccines'),
      treatment: t('health.healthRecord.treatments'),
      surgery: t('health.healthRecord.surgeries'),
      operation: t('health.healthRecord.operations'),
      vermifuge: t('health.healthRecord.vermifuges'),
    };
    return typeMap[type]?.slice(0, -1) || type;
  };

  const renderRecordCard = (record: any) => {
    const style = getRecordStyle(record.type);
    
    return (
      <View key={record.id} style={styles.recordCard}>
        <View style={[styles.recordIconContainer, { backgroundColor: style.bgColor }]}>
          <Ionicons name={style.icon} size={28} color={style.color} />
        </View>

        <View style={styles.recordContent}>
          <View style={styles.recordHeader}>
            <Text style={styles.recordTitle}>{record.description}</Text>
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
                <Text style={styles.recordVet}>{record.veterinarian}</Text>
              </View>
            )}
          </View>

          {record.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{record.notes}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.gray} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('health.healthRecord.title')}</Text>

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.teal} />
        </TouchableOpacity>
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{healthRecords.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {new Date().getFullYear() - new Date(sortedRecords[0]?.date || new Date()).getFullYear() || 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Années</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {[...new Set(healthRecords.map(r => r.veterinarian))].filter(Boolean).length}
            </Text>
            <Text style={styles.statLabel}>Vétérinaires</Text>
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
            <Text style={styles.emptyTitle}>Aucun dossier</Text>
            <Text style={styles.emptyText}>
              {selectedCategory === 'all' 
                ? "Aucun dossier médical trouvé"
                : `Aucun dossier de type "${categories.find(c => c.key === selectedCategory)?.label}"`
              }
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
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
});
