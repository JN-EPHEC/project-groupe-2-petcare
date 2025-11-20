import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface VaccinationsScreenProps {
  navigation: any;
}

export const VaccinationsScreen: React.FC<VaccinationsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentPet } = useAuth();

  const vaccinations = [
    { date: '08/06/2025', vaccination: 'Rage', age: '7 ans' },
    { date: '15/03/2025', vaccination: 'DHPP', age: '7 ans' },
    { date: '10/01/2025', vaccination: 'Leishmaniose', age: '6 ans' },
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

        <View style={styles.headerButton}>
          <Text style={styles.headerButtonText}>{t('health.vaccinations.title')}</Text>
        </View>
      </View>

      <View style={styles.petInfo}>
        <View style={styles.petImagePlaceholder}>
          <Ionicons name="paw" size={35} color={colors.navy} />
        </View>
        <Text style={styles.petName}>{currentPet?.name || 'kitty'}</Text>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>{t('health.vaccinations.tableTitle')}</Text>
          <View style={styles.pawIcons}>
            <Ionicons name="paw" size={16} color={colors.navy} />
            <Ionicons name="paw" size={16} color={colors.navy} />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>{t('health.vaccinations.petName')}</Text>
          <Text style={styles.infoValue}>{currentPet?.name || 'kitty'}</Text>
          
          <Text style={styles.infoLabel}>{t('health.vaccinations.locationOfBirth')}</Text>
          <Text style={styles.infoValue}>{currentPet?.location || 'Belgique'}</Text>
          
          <Text style={styles.infoLabel}>{t('health.vaccinations.sire')}</Text>
          <Text style={styles.infoValue}>-</Text>
          
          <Text style={styles.infoLabel}>{t('health.vaccinations.breed')}</Text>
          <Text style={styles.infoValue}>{currentPet?.breed || 'European Shorthair'}</Text>
          
          <Text style={styles.infoLabel}>{t('health.vaccinations.breederName')}</Text>
          <Text style={styles.infoValue}>-</Text>
          
          <Text style={styles.infoLabel}>{t('health.vaccinations.dam')}</Text>
          <Text style={styles.infoValue}>-</Text>
          
          <Text style={styles.infoLabel}>{t('health.vaccinations.colour')}</Text>
          <Text style={styles.infoValue}>-</Text>
          
          <Text style={styles.infoLabel}>{t('health.vaccinations.breederContact')}</Text>
          <Text style={styles.infoValue}>-</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>{t('health.vaccinations.dateColumn')}</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>{t('health.vaccinations.vaccinationColumn')}</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>{t('health.vaccinations.ageColumn')}</Text>
          </View>

          {vaccinations.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.date}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.vaccination}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.age}</Text>
            </View>
          ))}
          
          {/* Empty rows */}
          {[...Array(8)].map((_, index) => (
            <View key={`empty-${index}`} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}> </Text>
              <Text style={[styles.tableCell, { flex: 2 }]}> </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}> </Text>
            </View>
          ))}
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
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerButton: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  headerButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  petInfo: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  petImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  petName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  tableContainer: {
    margin: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.black,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  pawIcons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  infoSection: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.black,
    marginTop: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.xs,
  },
  table: {
    backgroundColor: colors.white,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
  },
  tableHeaderCell: {
    padding: spacing.sm,
    backgroundColor: colors.lightGray,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.black,
  },
  tableCell: {
    padding: spacing.sm,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.black,
    minHeight: 30,
  },
});

