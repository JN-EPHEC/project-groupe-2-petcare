import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import type { Pet } from '../services/firestoreService';

interface PetSelectorProps {
  pets: Pet[];
  selectedPetId: string | 'all';
  onSelectPet: (petId: string | 'all') => void;
  showAllOption?: boolean;
}

export const PetSelector: React.FC<PetSelectorProps> = ({
  pets,
  selectedPetId,
  onSelectPet,
  showAllOption = true,
}) => {
  if (pets.length === 0) {
    return null;
  }

  // Si un seul animal, pas besoin de sélecteur
  if (pets.length === 1 && !showAllOption) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🐾 Sélectionner un animal</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {showAllOption && (
          <TouchableOpacity
            style={[
              styles.petCard,
              selectedPetId === 'all' && styles.petCardSelected
            ]}
            onPress={() => onSelectPet('all')}
          >
            <View style={[
              styles.petImageContainer,
              selectedPetId === 'all' && styles.petImageContainerSelected
            ]}>
              <Ionicons 
                name="paw" 
                size={32} 
                color={selectedPetId === 'all' ? colors.teal : colors.gray} 
              />
            </View>
            <Text style={[
              styles.petName,
              selectedPetId === 'all' && styles.petNameSelected
            ]}>
              Tous
            </Text>
            {selectedPetId === 'all' && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
              </View>
            )}
          </TouchableOpacity>
        )}

        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            style={[
              styles.petCard,
              selectedPetId === pet.id && styles.petCardSelected
            ]}
            onPress={() => onSelectPet(pet.id)}
          >
            <View style={[
              styles.petImageContainer,
              selectedPetId === pet.id && styles.petImageContainerSelected
            ]}>
              {pet.avatarUrl ? (
                <Image 
                  source={{ uri: pet.avatarUrl }} 
                  style={styles.petImage}
                />
              ) : (
                <Text style={styles.petEmoji}>{pet.emoji || '🐾'}</Text>
              )}
            </View>
            <Text style={[
              styles.petName,
              selectedPetId === pet.id && styles.petNameSelected
            ]} numberOfLines={1}>
              {pet.name}
            </Text>
            {selectedPetId === pet.id && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.teal} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  petCard: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 90,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  petCardSelected: {
    borderColor: colors.teal,
    backgroundColor: '#F0F9FF',
  },
  petImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  petImageContainerSelected: {
    borderWidth: 3,
    borderColor: colors.teal,
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  petEmoji: {
    fontSize: 32,
  },
  petName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
    textAlign: 'center',
    maxWidth: 80,
  },
  petNameSelected: {
    color: colors.teal,
    fontWeight: typography.fontWeight.bold,
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});


