import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { demoAuth } from '../../services/demoAuth';

interface MapScreenProps {
  navigation: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const vets = demoAuth.getAllVets();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>
        
        <Text style={styles.title}>{t('emergency.map.title')}</Text>
        
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="menu" size={24} color={colors.navy} />
        </TouchableOpacity>
      </View>

      <View style={styles.webPlaceholder}>
        <Ionicons name="map" size={80} color={colors.gray} />
        <Text style={styles.webPlaceholderTitle}>Carte interactive</Text>
        <Text style={styles.webPlaceholderText}>
          {Platform.OS === 'web' 
            ? "La carte interactive est disponible sur l'application mobile.\n\nListe des vétérinaires disponibles ci-dessous."
            : "Carte en cours de chargement..."
          }
        </Text>
        
        <View style={styles.vetsList}>
          {vets.map((vet) => (
            <View key={vet.id} style={styles.webVetCard}>
              <Ionicons name="location" size={24} color={colors.navy} />
              <View style={styles.webVetInfo}>
                <Text style={styles.webVetName}>{vet.name}</Text>
                <Text style={styles.webVetLocation}>{vet.location}</Text>
                <Text style={styles.webVetSpecialty}>{vet.specialty}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendIcon}>
            <Ionicons name="add" size={16} color={colors.white} />
          </View>
          <Text style={styles.legendText}>{t('emergency.map.legend')}</Text>
        </View>
      </View>
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
    zIndex: 10,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    flex: 1,
    textAlign: 'center',
  },
  filterButton: {
    padding: spacing.sm,
  },
  webPlaceholder: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  webPlaceholderTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  webPlaceholderText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  vetsList: {
    width: '100%',
    gap: spacing.md,
  },
  webVetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  webVetInfo: {
    flex: 1,
  },
  webVetName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  webVetLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  webVetSpecialty: {
    fontSize: typography.fontSize.xs,
    color: colors.navy,
    marginTop: spacing.xs,
  },
  legend: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
  },
});
