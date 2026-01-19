import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { getSharedPetData } from '../../services/firestoreService';
import { SharedPetData } from '../../types/premium';

interface SharedPetProfileScreenProps {
  navigation: any;
  route: any;
}

export const SharedPetProfileScreen: React.FC<SharedPetProfileScreenProps> = ({ navigation, route }) => {
  const { shareToken } = route.params;
  const [data, setData] = useState<SharedPetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadSharedData();
  }, [shareToken]);
  
  const loadSharedData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const sharedData = await getSharedPetData(shareToken);
      setData(sharedData);
    } catch (err: any) {
      console.error('Error loading shared data:', err);
      setError(err.message || 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }
  
  if (error || !data) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>Lien invalide</Text>
        <Text style={styles.errorText}>
          {error || 'Ce lien de partage n\'existe pas ou a été révoqué'}
        </Text>
      </View>
    );
  }
  
  const { pet, vaccinations, healthRecords, reminders, owner } = data;
  
  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <Ionicons name="eye-outline" size={20} color={colors.white} />
        <Text style={styles.bannerText}>Vue partagée - Lecture seule</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.petEmoji}>{pet.emoji || '🐾'}</Text>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>{pet.breed}</Text>
          <Text style={styles.sharedBy}>
            Partagé par {owner.firstName} {owner.lastName}
          </Text>
        </View>
        
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <InfoRow icon="paw" label="Type" value={pet.type === 'dog' ? 'Chien' : pet.type === 'cat' ? 'Chat' : 'Autre'} />
          <InfoRow icon="calendar" label="Âge" value={`${pet.age} ans`} />
          <InfoRow icon="scale" label="Poids" value={`${pet.weight} kg`} />
          {pet.gender && <InfoRow icon="male-female" label="Sexe" value={pet.gender} />}
          {pet.color && <InfoRow icon="color-palette" label="Couleur" value={pet.color} />}
          {pet.microchipId && <InfoRow icon="barcode" label="Puce" value={pet.microchipId} />}
        </View>
        
        {/* Vaccinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={24} color={colors.teal} />
            <Text style={styles.sectionTitle}>Vaccinations ({vaccinations.length})</Text>
          </View>
          
          {vaccinations.length === 0 ? (
            <Text style={styles.emptyText}>Aucune vaccination enregistrée</Text>
          ) : (
            vaccinations.map((vacc, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{vacc.vaccineName}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(vacc.date).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <Text style={styles.cardInfo}>Vétérinaire: {vacc.vet}</Text>
                <Text style={styles.cardInfo}>
                  Prochain rappel: {new Date(vacc.nextDueDate).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            ))
          )}
        </View>
        
        {/* Health Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={24} color={colors.teal} />
            <Text style={styles.sectionTitle}>Historique santé ({healthRecords.length})</Text>
          </View>
          
          {healthRecords.length === 0 ? (
            <Text style={styles.emptyText}>Aucun historique enregistré</Text>
          ) : (
            healthRecords.slice(0, 5).map((record, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{record.title}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(record.date).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <Text style={styles.cardType}>{record.type}</Text>
                <Text style={styles.cardInfo}>Vétérinaire: {record.vet}</Text>
                {record.description && (
                  <Text style={styles.cardDescription} numberOfLines={3}>
                    {record.description}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
        
        {/* Reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={24} color={colors.teal} />
            <Text style={styles.sectionTitle}>Rappels à venir ({reminders.filter(r => !r.completed).length})</Text>
          </View>
          
          {reminders.filter(r => !r.completed).length === 0 ? (
            <Text style={styles.emptyText}>Aucun rappel à venir</Text>
          ) : (
            reminders
              .filter(r => !r.completed)
              .slice(0, 5)
              .map((reminder, index) => (
                <View key={index} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{reminder.title}</Text>
                    <Text style={styles.cardDate}>
                      {new Date(reminder.date).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <Text style={styles.cardType}>{reminder.type}</Text>
                  {reminder.notes && (
                    <Text style={styles.cardInfo}>{reminder.notes}</Text>
                  )}
                </View>
              ))
          )}
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark" size={24} color={colors.teal} />
          <Text style={styles.footerText}>
            Ces informations sont partagées de manière sécurisée via PetCare+
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <Ionicons name={icon as any} size={18} color={colors.gray} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.md,
  },
  errorTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  bannerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.navy,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  petEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  petName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  petBreed: {
    fontSize: typography.fontSize.lg,
    color: colors.lightBlue,
    marginBottom: spacing.sm,
  },
  sharedBy: {
    fontSize: typography.fontSize.sm,
    color: colors.lightBlue,
    fontStyle: 'italic',
  },
  section: {
    padding: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginRight: spacing.sm,
  },
  cardDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  cardType: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  cardInfo: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.lightBlue,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  footerText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.teal,
    lineHeight: 20,
  },
});







