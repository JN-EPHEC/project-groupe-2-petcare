import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface VetPatientsScreenProps {
  navigation: any;
}

export const VetPatientsScreen: React.FC<VetPatientsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecies, setFilterSpecies] = useState<'all' | 'cat' | 'dog'>('all');

  const patients = [
    {
      id: '1',
      name: 'Kitty',
      species: 'cat',
      breed: 'European Shorthair',
      age: 7,
      weight: 6,
      ownerName: 'John Doe',
      ownerPhone: '+32 49 90 89 808',
      lastVisit: '2025-11-15',
      nextVisit: '2026-06-08',
      status: 'healthy',
      imageEmoji: '🐱',
    },
    {
      id: '2',
      name: 'Max',
      species: 'dog',
      breed: 'Golden Retriever',
      age: 3,
      weight: 28,
      ownerName: 'Charles DuBois',
      ownerPhone: '+32 2 123 4567',
      lastVisit: '2025-11-10',
      nextVisit: '2025-12-15',
      status: 'healthy',
      imageEmoji: '🐕',
    },
    {
      id: '3',
      name: 'Luna',
      species: 'cat',
      breed: 'Siamois',
      age: 2,
      weight: 4,
      ownerName: 'Marie Martin',
      ownerPhone: '+32 2 345 6789',
      lastVisit: '2025-11-18',
      nextVisit: '2025-11-21',
      status: 'followup',
      imageEmoji: '🐈',
    },
    {
      id: '4',
      name: 'Rocky',
      species: 'dog',
      breed: 'Labrador',
      age: 5,
      weight: 32,
      ownerName: 'Sophie Laurent',
      ownerPhone: '+32 2 456 7890',
      lastVisit: '2025-11-20',
      nextVisit: '2025-12-20',
      status: 'healthy',
      imageEmoji: '🐕‍🦺',
    },
  ];

  const filteredPatients = patients
    .filter(patient => 
      filterSpecies === 'all' || 
      patient.species === filterSpecies
    )
    .filter(patient =>
      searchQuery.trim() === '' ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#4ECDC4';
      case 'followup':
        return '#FFB347';
      case 'treatment':
        return '#FF6B6B';
      default:
        return colors.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'En bonne santé';
      case 'followup':
        return 'Suivi requis';
      case 'treatment':
        return 'En traitement';
      default:
        return 'Inconnu';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mes Patients</Text>

        <View style={styles.headerRight}>
          <Text style={styles.countBadge}>{filteredPatients.length}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un patient ou propriétaire..."
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

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filterSpecies === 'all' && styles.filterChipActive]}
          onPress={() => setFilterSpecies('all')}
        >
          <Text style={[styles.filterText, filterSpecies === 'all' && styles.filterTextActive]}>
            Tous ({patients.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterSpecies === 'cat' && styles.filterChipActive]}
          onPress={() => setFilterSpecies('cat')}
        >
          <Text style={[styles.filterText, filterSpecies === 'cat' && styles.filterTextActive]}>
            🐱 Chats ({patients.filter(p => p.species === 'cat').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterSpecies === 'dog' && styles.filterChipActive]}
          onPress={() => setFilterSpecies('dog')}
        >
          <Text style={[styles.filterText, filterSpecies === 'dog' && styles.filterTextActive]}>
            🐕 Chiens ({patients.filter(p => p.species === 'dog').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Patients List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <TouchableOpacity key={patient.id} style={styles.patientCard}>
              <View style={styles.patientAvatar}>
                <Text style={styles.avatarEmoji}>{patient.imageEmoji}</Text>
              </View>

              <View style={styles.patientInfo}>
                <View style={styles.patientHeader}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(patient.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(patient.status) }]}>
                      {getStatusText(patient.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.breedText}>{patient.breed} • {patient.age} ans • {patient.weight}kg</Text>

                <View style={styles.ownerInfo}>
                  <Ionicons name="person" size={14} color={colors.gray} />
                  <Text style={styles.ownerText}>{patient.ownerName}</Text>
                  <Ionicons name="call" size={14} color={colors.gray} style={{ marginLeft: spacing.sm }} />
                  <Text style={styles.ownerText}>{patient.ownerPhone}</Text>
                </View>

                <View style={styles.visitsInfo}>
                  <View style={styles.visitItem}>
                    <Ionicons name="checkmark-circle" size={14} color="#4ECDC4" />
                    <Text style={styles.visitText}>
                      Dernière visite: {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <View style={styles.visitItem}>
                    <Ionicons name="calendar" size={14} color={colors.teal} />
                    <Text style={styles.visitText}>
                      Prochain RDV: {new Date(patient.nextVisit).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="clipboard" size={18} color={colors.teal} />
                    <Text style={styles.actionText}>Dossier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="call" size={18} color={colors.teal} />
                    <Text style={styles.actionText}>Appeler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="calendar" size={18} color={colors.teal} />
                    <Text style={styles.actionText}>RDV</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="paw-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>Aucun patient</Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'Aucun résultat pour cette recherche' : 'Aucun patient enregistré'}
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
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  countBadge: {
    backgroundColor: colors.teal,
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.lightBlue,
  },
  filterChipActive: {
    backgroundColor: colors.teal,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  filterTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: spacing.md,
  },
  patientAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  patientInfo: {
    flex: 1,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  patientName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  breedText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  ownerText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  visitsInfo: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  visitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  visitText: {
    fontSize: typography.fontSize.xs,
    color: colors.black,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  emptyState: {
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
    height: spacing.xxl,
  },
});

