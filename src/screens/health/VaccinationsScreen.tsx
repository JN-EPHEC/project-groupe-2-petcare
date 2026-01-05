import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import {
  getVaccinationsByPetId,
  deleteVaccination,
  type Vaccination,
} from '../../services/firestoreService';

interface VaccinationsScreenProps {
  navigation: any;
  route: any;
}

export const VaccinationsScreen: React.FC<VaccinationsScreenProps> = ({
  navigation,
  route,
}) => {
  const { currentPet, user } = useAuth();
  const pet = route.params?.pet || currentPet;
  
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVaccinations = async () => {
    if (!pet?.id) {
      console.log('❌ Pas de pet sélectionné');
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log('💉 Chargement des vaccinations pour:', pet.name);
      const vaccs = await getVaccinationsByPetId(pet.id);
      console.log('✅ Vaccinations chargées:', vaccs.length);
      setVaccinations(vaccs);
    } catch (error) {
      console.error('❌ Erreur chargement vaccinations:', error);
      setVaccinations([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVaccinations();
  }, [pet?.id]);

  useFocusEffect(
    useCallback(() => {
      loadVaccinations();
    }, [pet?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadVaccinations();
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getVaccinationStatus = (date: string): 'ok' | 'warning' | 'expired' => {
    try {
      const vaccDate = new Date(date);
      const today = new Date();
      const monthsDiff = (today.getTime() - vaccDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

      if (monthsDiff < 11) return 'ok'; // Moins de 11 mois
      if (monthsDiff < 12) return 'warning'; // Entre 11 et 12 mois
      return 'expired'; // Plus de 12 mois
    } catch {
      return 'ok';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ok':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'expired':
        return '#F44336';
      default:
        return colors.gray;
    }
  };

  const getStatusIcon = (status: string): any => {
    switch (status) {
      case 'ok':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'expired':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'ok':
        return 'À jour';
      case 'warning':
        return 'Rappel bientôt';
      case 'expired':
        return 'Expiré';
      default:
        return '';
    }
  };

  const handleDeleteVaccination = async (vaccination: Vaccination) => {
    const confirmMessage = `Supprimer le vaccin "${vaccination.type}" ?`;

    if (Platform.OS === 'web') {
      if (!window.confirm(confirmMessage)) {
        return;
      }
      await performDelete(vaccination.id);
    } else {
      Alert.alert('Supprimer le vaccin', confirmMessage, [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => performDelete(vaccination.id),
        },
      ]);
    }
  };

  const performDelete = async (vaccinationId: string) => {
    try {
      console.log('🗑️ Suppression du vaccin:', vaccinationId);
      await deleteVaccination(vaccinationId);
      console.log('✅ Vaccin supprimé');
      await loadVaccinations();

      if (Platform.OS === 'web') {
        window.alert('Vaccin supprimé avec succès');
      } else {
        Alert.alert('Succès', 'Vaccin supprimé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur lors de la suppression');
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer le vaccin');
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vaccinations</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vaccinations</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="paw-outline" size={80} color={colors.lightGray} />
          <Text style={styles.emptyTitle}>Aucun animal sélectionné</Text>
        </View>
      </View>
    );
  }

  // Calculer les statistiques
  const okCount = vaccinations.filter((v) => getVaccinationStatus(v.date) === 'ok').length;
  const warningCount = vaccinations.filter((v) => getVaccinationStatus(v.date) === 'warning').length;
  const expiredCount = vaccinations.filter((v) => getVaccinationStatus(v.date) === 'expired').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vaccinations</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddVaccination', { pet, onSave: loadVaccinations })}
        >
          <Ionicons name="add-circle-outline" size={28} color={colors.teal} />
        </TouchableOpacity>
      </View>

      {/* Pet Info */}
      <View style={styles.petInfoContainer}>
        {pet.avatarUrl ? (
          <Image source={{ uri: pet.avatarUrl }} style={styles.petImage} />
        ) : (
          <View style={styles.petImagePlaceholder}>
            <Text style={styles.petEmoji}>{pet.emoji || '🐾'}</Text>
          </View>
        )}
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>{pet.breed}</Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{okCount}</Text>
          <Text style={styles.statLabel}>À jour</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="warning" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>{warningCount}</Text>
          <Text style={styles.statLabel}>Rappel</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
          <Ionicons name="close-circle" size={24} color="#F44336" />
          <Text style={styles.statNumber}>{expiredCount}</Text>
          <Text style={styles.statLabel}>Expirés</Text>
        </View>
      </View>

      {/* Vaccinations List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {vaccinations.length > 0 ? (
          vaccinations.map((vaccination) => {
            const status = getVaccinationStatus(vaccination.date);
            const statusColor = getStatusColor(status);

            return (
              <View key={vaccination.id} style={styles.vaccinationCard}>
                <View style={[styles.vaccinationIcon, { backgroundColor: `${statusColor}15` }]}>
                  <Ionicons name="medical" size={28} color={statusColor} />
                </View>

                <View style={styles.vaccinationContent}>
                  <View style={styles.vaccinationHeader}>
                    <Text style={styles.vaccinationType}>{vaccination.type}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                      <Ionicons
                        name={getStatusIcon(status)}
                        size={14}
                        color={colors.white}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
                    </View>
                  </View>

                  <Text style={styles.vaccinationDate}>📅 {formatDate(vaccination.date)}</Text>

                  {vaccination.vet && (
                    <Text style={styles.vaccinationInfo}>👨‍⚕️ Dr. {vaccination.vet}</Text>
                  )}

                  {vaccination.notes && (
                    <Text style={styles.vaccinationNotes} numberOfLines={2}>
                      📝 {vaccination.notes}
                    </Text>
                  )}
                </View>

                <View style={styles.vaccinationActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      navigation.navigate('EditVaccination', {
                        vaccination,
                        pet,
                        onSave: loadVaccinations,
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={20} color={colors.teal} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteVaccination(vaccination)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={80} color={colors.lightGray} />
            <Text style={styles.emptyTitle}>Aucune vaccination enregistrée</Text>
            <Text style={styles.emptySubtitle}>
              Ajoutez les vaccinations de {pet.name} pour suivre son carnet de santé
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                navigation.navigate('AddVaccination', { pet, onSave: loadVaccinations })
              }
            >
              <Ionicons name="add-circle" size={24} color={colors.white} />
              <Text style={styles.addButtonText}>Ajouter un vaccin</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {vaccinations.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddVaccination', { pet, onSave: loadVaccinations })}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  petInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightBlue,
  },
  petImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petEmoji: {
    fontSize: 32,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  petBreed: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.white,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginVertical: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    fontWeight: typography.fontWeight.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 4,
  },
  vaccinationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: spacing.md,
  },
  vaccinationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaccinationContent: {
    flex: 1,
  },
  vaccinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  vaccinationType: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  vaccinationDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: 4,
  },
  vaccinationInfo: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: 4,
  },
  vaccinationNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  vaccinationActions: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
