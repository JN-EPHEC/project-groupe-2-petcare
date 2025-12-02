import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface AdminPetsScreenProps {
  navigation: any;
}

export const AdminPetsScreen: React.FC<AdminPetsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'cat', 'dog', 'other'

  // Mock data
  const allPets = [
    {
      id: '1',
      name: 'Kitty',
      species: 'Chat',
      breed: 'Européen',
      age: 3,
      owner: 'Charles DuBois',
      ownerEmail: 'admin@petcare.com',
      vaccinated: true,
      healthRecords: 5,
      lastVisit: '15 Mars 2024',
      emoji: '🐱',
    },
    {
      id: '2',
      name: 'Max',
      species: 'Chien',
      breed: 'Labrador',
      age: 5,
      owner: 'Marie Dubois',
      ownerEmail: 'marie.dubois@mail.com',
      vaccinated: true,
      healthRecords: 8,
      lastVisit: '10 Avril 2024',
      emoji: '🐕',
    },
    {
      id: '3',
      name: 'Luna',
      species: 'Chat',
      breed: 'Siamois',
      age: 2,
      owner: 'Lucas Bernard',
      ownerEmail: 'lucas.b@gmail.com',
      vaccinated: true,
      healthRecords: 3,
      lastVisit: '25 Mars 2024',
      emoji: '🐈',
    },
    {
      id: '4',
      name: 'Rocky',
      species: 'Chien',
      breed: 'Berger Allemand',
      age: 4,
      owner: 'Emma Petit',
      ownerEmail: 'emma.petit@mail.com',
      vaccinated: false,
      healthRecords: 2,
      lastVisit: '05 Février 2024',
      emoji: '🐕‍🦺',
    },
    {
      id: '5',
      name: 'Coco',
      species: 'Lapin',
      breed: 'Nain',
      age: 1,
      owner: 'Emma Petit',
      ownerEmail: 'emma.petit@mail.com',
      vaccinated: true,
      healthRecords: 1,
      lastVisit: '12 Avril 2024',
      emoji: '🐰',
    },
    {
      id: '6',
      name: 'Bella',
      species: 'Chat',
      breed: 'Persan',
      age: 6,
      owner: 'Marie Dubois',
      ownerEmail: 'marie.dubois@mail.com',
      vaccinated: true,
      healthRecords: 12,
      lastVisit: '08 Avril 2024',
      emoji: '🐱',
    },
  ];

  const filteredPets = allPets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pet.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === 'cat') {
      matchesFilter = pet.species === 'Chat';
    } else if (activeFilter === 'dog') {
      matchesFilter = pet.species === 'Chien';
    } else if (activeFilter === 'other') {
      matchesFilter = pet.species !== 'Chat' && pet.species !== 'Chien';
    }
    
    return matchesSearch && matchesFilter;
  });

  const getCategoryCount = (type: string) => {
    if (type === 'all') return allPets.length;
    if (type === 'cat') return allPets.filter(p => p.species === 'Chat').length;
    if (type === 'dog') return allPets.filter(p => p.species === 'Chien').length;
    return allPets.filter(p => p.species !== 'Chat' && p.species !== 'Chien').length;
  };

  const handleDeletePet = (pet: any) => {
    Alert.alert(
      'Supprimer l\'animal',
      `Êtes-vous sûr de vouloir supprimer ${pet.name} ? Cette action est irréversible.`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => Alert.alert('Supprimé', `${pet.name} a été supprimé`)
        }
      ]
    );
  };

  const renderPetCard = (pet: any) => {
    return (
      <View key={pet.id} style={styles.petCard}>
        <View style={styles.petHeader}>
          <View style={styles.petEmojiContainer}>
            <Text style={styles.petEmoji}>{pet.emoji}</Text>
          </View>
          <View style={styles.petHeaderInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petBreed}>{pet.breed} • {pet.age} ans</Text>
          </View>
          {pet.vaccinated ? (
            <View style={styles.vaccineBadge}>
              <Ionicons name="shield-checkmark" size={16} color={colors.white} />
            </View>
          ) : (
            <View style={[styles.vaccineBadge, { backgroundColor: '#FF6B6B' }]}>
              <Ionicons name="warning" size={16} color={colors.white} />
            </View>
          )}
        </View>

        <View style={styles.petDetails}>
          <View style={styles.petDetailRow}>
            <Ionicons name="person" size={16} color={colors.gray} />
            <Text style={styles.petDetailText}>{pet.owner}</Text>
          </View>
          <View style={styles.petDetailRow}>
            <Ionicons name="mail" size={16} color={colors.gray} />
            <Text style={styles.petDetailText}>{pet.ownerEmail}</Text>
          </View>
          <View style={styles.petDetailRow}>
            <Ionicons name="clipboard" size={16} color={colors.gray} />
            <Text style={styles.petDetailText}>{pet.healthRecords} dossiers médicaux</Text>
          </View>
          <View style={styles.petDetailRow}>
            <Ionicons name="calendar" size={16} color={colors.gray} />
            <Text style={styles.petDetailText}>Dernière visite: {pet.lastVisit}</Text>
          </View>
        </View>

        <View style={styles.petActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.teal }]}
            onPress={() => Alert.alert('Profil', `Voir le profil de ${pet.name}`)}
          >
            <Ionicons name="eye" size={18} color={colors.white} />
            <Text style={styles.actionButtonText}>Voir profil</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
            onPress={() => handleDeletePet(pet)}
          >
            <Ionicons name="trash" size={18} color={colors.white} />
            <Text style={styles.actionButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Gestion des animaux</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{allPets.length}</Text>
          <Text style={styles.statLabel}>Total animaux</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{allPets.filter(p => p.vaccinated).length}</Text>
          <Text style={styles.statLabel}>Vaccinés</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{allPets.filter(p => !p.vaccinated).length}</Text>
          <Text style={styles.statLabel}>Non vaccinés</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search')}
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
            <Ionicons name="close-circle" size={20} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'cat', label: 'Chats' },
          { key: 'dog', label: 'Chiens' },
          { key: 'other', label: 'Autres' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterChip, activeFilter === filter.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[styles.filterChipText, activeFilter === filter.key && styles.filterChipTextActive]}>
              {filter.label} ({getCategoryCount(filter.key)})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>
        {filteredPets.length > 0 ? (
          filteredPets.map(renderPetCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="paw-outline" size={80} color={colors.gray} />
            <Text style={styles.emptyStateText}>{t('common.noResults')}</Text>
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
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  clearSearchButton: {
    marginLeft: spacing.sm,
  },
  filterContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  filterChip: {
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.teal,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontWeight: typography.fontWeight.semiBold,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  petCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  petEmojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  petEmoji: {
    fontSize: 32,
  },
  petHeaderInfo: {
    flex: 1,
  },
  petName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  petBreed: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  vaccineBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDetails: {
    marginBottom: spacing.md,
  },
  petDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  petDetailText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginLeft: spacing.sm,
  },
  petActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.fontSize.lg,
    color: colors.gray,
    marginTop: spacing.md,
  },
});

