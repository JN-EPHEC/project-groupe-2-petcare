import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface PetProfileScreenProps {
  navigation: any;
}

export const PetProfileScreen: React.FC<PetProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentPet } = useAuth();

  if (!currentPet) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPetText}>{t('profile.petProfile.noPet')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color={colors.navy} />
      </TouchableOpacity>

      <View style={styles.petImageContainer}>
        <View style={styles.petImagePlaceholder}>
          <Text style={styles.placeholderText}>{currentPet.imageEmoji}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.petName}>{currentPet.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={18} color={colors.black} />
          <Text style={styles.location}>{currentPet.location}</Text>
        </View>

        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t(`profile.petProfile.${currentPet.gender.toLowerCase()}`)}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{currentPet.age} {t('profile.petProfile.years')}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{currentPet.weight}kg</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Vaccinations')}
        >
          <Text style={styles.buttonText}>{t('profile.petProfile.myVaccinations')}</Text>
          <View style={styles.buttonArrow}>
            <Ionicons name="chevron-forward" size={25} color={colors.white} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('HealthRecord')}
        >
          <Text style={styles.buttonText}>{t('profile.petProfile.myHealthRecord')}</Text>
          <View style={styles.buttonArrow}>
            <Ionicons name="chevron-forward" size={25} color={colors.white} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Documents')}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>{t('profile.petProfile.myDocuments')}</Text>
            <Ionicons name="paw" size={20} color={colors.white} />
          </View>
          <View style={styles.buttonArrow}>
            <Ionicons name="chevron-forward" size={25} color={colors.white} />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  petImageContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  petImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
  },
  infoCard: {
    backgroundColor: colors.lightBlue,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  petName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  location: {
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  badge: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  button: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  buttonArrow: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPetText: {
    fontSize: typography.fontSize.lg,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});

