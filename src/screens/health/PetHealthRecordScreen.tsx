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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  getVaccinationsByPetId,
  getTreatmentsByPetId,
  getMedicalHistoryByPetId,
  deleteVaccination,
  deleteTreatment,
  deleteMedicalHistory,
  type Vaccination,
  type Treatment,
  type MedicalHistory,
} from '../../services/firestoreService';

interface PetHealthRecordScreenProps {
  navigation: any;
  route: any;
}

type TabType = 'vaccinations' | 'treatments' | 'history';

export const PetHealthRecordScreen: React.FC<PetHealthRecordScreenProps> = ({
  navigation,
  route,
}) => {
  const { pet } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('vaccinations');
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [vacc, treat, hist] = await Promise.all([
        getVaccinationsByPetId(pet.id),
        getTreatmentsByPetId(pet.id),
        getMedicalHistoryByPetId(pet.id),
      ]);
      setVaccinations(vacc);
      setTreatments(treat);
      setMedicalHistory(hist);
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pet.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [pet.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDeleteVaccination = async (vaccination: Vaccination) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Supprimer le vaccin "${vaccination.type}" ?`)) {
        return;
      }
    } else {
      Alert.alert(
        'Supprimer le vaccin',
        `Êtes-vous sûr de vouloir supprimer le vaccin "${vaccination.type}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => performDeleteVaccination(vaccination.id),
          },
        ]
      );
      return;
    }

    await performDeleteVaccination(vaccination.id);
  };

  const performDeleteVaccination = async (id: string) => {
    try {
      await deleteVaccination(id);
      await loadData();
      if (Platform.OS === 'web') {
        window.alert('Vaccin supprimé avec succès');
      } else {
        Alert.alert('Succès', 'Vaccin supprimé avec succès');
      }
    } catch (error) {
      console.error('Error deleting vaccination:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur lors de la suppression');
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer le vaccin');
      }
    }
  };

  const handleDeleteTreatment = async (treatment: Treatment) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Supprimer le traitement "${treatment.name}" ?`)) {
        return;
      }
    } else {
      Alert.alert(
        'Supprimer le traitement',
        `Êtes-vous sûr de vouloir supprimer le traitement "${treatment.name}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => performDeleteTreatment(treatment.id),
          },
        ]
      );
      return;
    }

    await performDeleteTreatment(treatment.id);
  };

  const performDeleteTreatment = async (id: string) => {
    try {
      await deleteTreatment(id);
      await loadData();
      if (Platform.OS === 'web') {
        window.alert('Traitement supprimé avec succès');
      } else {
        Alert.alert('Succès', 'Traitement supprimé avec succès');
      }
    } catch (error) {
      console.error('Error deleting treatment:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur lors de la suppression');
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer le traitement');
      }
    }
  };

  const handleDeleteHistory = async (history: MedicalHistory) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Supprimer l'antécédent "${history.title}" ?`)) {
        return;
      }
    } else {
      Alert.alert(
        "Supprimer l'antécédent",
        `Êtes-vous sûr de vouloir supprimer l'antécédent "${history.title}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => performDeleteHistory(history.id),
          },
        ]
      );
      return;
    }

    await performDeleteHistory(history.id);
  };

  const performDeleteHistory = async (id: string) => {
    try {
      await deleteMedicalHistory(id);
      await loadData();
      if (Platform.OS === 'web') {
        window.alert('Antécédent supprimé avec succès');
      } else {
        Alert.alert('Succès', 'Antécédent supprimé avec succès');
      }
    } catch (error) {
      console.error('Error deleting history:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur lors de la suppression');
      } else {
        Alert.alert('Erreur', "Impossible de supprimer l'antécédent");
      }
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getTreatmentTypeLabel = (type: string): string => {
    switch (type) {
      case 'antipuce':
        return 'Anti-puces';
      case 'antibiotique':
        return 'Antibiotique';
      case 'vermifuge':
        return 'Vermifuge';
      case 'autre':
        return 'Autre';
      default:
        return type;
    }
  };

  const getTreatmentTypeColor = (type: string): string => {
    switch (type) {
      case 'antipuce':
        return '#FF9800';
      case 'antibiotique':
        return '#F44336';
      case 'vermifuge':
        return '#9C27B0';
      case 'autre':
        return colors.gray;
      default:
        return colors.teal;
    }
  };

  const getHistoryTypeLabel = (type: string): string => {
    switch (type) {
      case 'maladie':
        return 'Maladie';
      case 'allergie':
        return 'Allergie';
      case 'chirurgie':
        return 'Chirurgie';
      case 'autre':
        return 'Autre';
      default:
        return type;
    }
  };

  const renderVaccinations = () => {
    if (vaccinations.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="medkit-outline" size={60} color={colors.lightGray} />
          <Text style={styles.emptyTitle}>Aucun vaccin enregistré</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez les vaccins de {pet.name} pour suivre son carnet de santé
          </Text>
        </View>
      );
    }

    return vaccinations.map((vaccination) => (
      <View key={vaccination.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: '#4CAF5015' }]}>
            <Ionicons name="medical" size={24} color="#4CAF50" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{vaccination.type}</Text>
            <Text style={styles.cardDate}>{formatDate(vaccination.date)}</Text>
            {vaccination.vet && <Text style={styles.cardInfo}>Dr. {vaccination.vet}</Text>}
            {vaccination.notes && (
              <Text style={styles.cardNotes} numberOfLines={2}>
                {vaccination.notes}
              </Text>
            )}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate('EditVaccination', { vaccination, pet, onSave: loadData })
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
      </View>
    ));
  };

  const renderTreatments = () => {
    if (treatments.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="fitness-outline" size={60} color={colors.lightGray} />
          <Text style={styles.emptyTitle}>Aucun traitement enregistré</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez les traitements en cours ou passés de {pet.name}
          </Text>
        </View>
      );
    }

    return treatments.map((treatment) => (
      <View key={treatment.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.cardIcon,
              { backgroundColor: `${getTreatmentTypeColor(treatment.type)}15` },
            ]}
          >
            <Ionicons name="medical" size={24} color={getTreatmentTypeColor(treatment.type)} />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{treatment.name}</Text>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: getTreatmentTypeColor(treatment.type) },
                ]}
              >
                <Text style={styles.typeBadgeText}>{getTreatmentTypeLabel(treatment.type)}</Text>
              </View>
            </View>
            <Text style={styles.cardDate}>
              {formatDate(treatment.startDate)} → {formatDate(treatment.endDate)}
            </Text>
            {treatment.dosage && <Text style={styles.cardInfo}>Dosage : {treatment.dosage}</Text>}
            {treatment.frequency && (
              <Text style={styles.cardInfo}>Fréquence : {treatment.frequency}</Text>
            )}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate('EditTreatment', { treatment, pet, onSave: loadData })
              }
            >
              <Ionicons name="create-outline" size={20} color={colors.teal} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteTreatment(treatment)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ));
  };

  const renderMedicalHistory = () => {
    if (medicalHistory.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={60} color={colors.lightGray} />
          <Text style={styles.emptyTitle}>Aucun antécédent enregistré</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez les antécédents médicaux de {pet.name}
          </Text>
        </View>
      );
    }

    return medicalHistory.map((history) => (
      <View key={history.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: '#2196F315' }]}>
            <Ionicons name="document-text" size={24} color="#2196F3" />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{history.title}</Text>
              <View style={[styles.typeBadge, { backgroundColor: colors.lightGray }]}>
                <Text style={[styles.typeBadgeText, { color: colors.navy }]}>
                  {getHistoryTypeLabel(history.type)}
                </Text>
              </View>
            </View>
            <Text style={styles.cardDate}>{formatDate(history.date)}</Text>
            <Text style={styles.cardDescription} numberOfLines={3}>
              {history.description}
            </Text>
            {history.documents && history.documents.length > 0 && (
              <View style={styles.documentsInfo}>
                <Ionicons name="attach" size={16} color={colors.teal} />
                <Text style={styles.documentsText}>{history.documents.length} document(s)</Text>
              </View>
            )}
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate('EditMedicalHistory', { history, pet, onSave: loadData })
              }
            >
              <Ionicons name="create-outline" size={20} color={colors.teal} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteHistory(history)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ));
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'vaccinations':
        return 'Ajouter un vaccin';
      case 'treatments':
        return 'Ajouter un traitement';
      case 'history':
        return 'Ajouter un antécédent';
      default:
        return 'Ajouter';
    }
  };

  const handleAddButton = () => {
    switch (activeTab) {
      case 'vaccinations':
        navigation.navigate('AddVaccination', { pet, onSave: loadData });
        break;
      case 'treatments':
        navigation.navigate('AddTreatment', { pet, onSave: loadData });
        break;
      case 'history':
        navigation.navigate('AddMedicalHistory', { pet, onSave: loadData });
        break;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carnet de santé</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Carnet de santé</Text>
          <Text style={styles.headerSubtitle}>{pet.name}</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vaccinations' && styles.activeTab]}
          onPress={() => setActiveTab('vaccinations')}
        >
          <Ionicons
            name="medical"
            size={20}
            color={activeTab === 'vaccinations' ? colors.white : colors.gray}
          />
          <Text style={[styles.tabText, activeTab === 'vaccinations' && styles.activeTabText]}>
            Vaccins ({vaccinations.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'treatments' && styles.activeTab]}
          onPress={() => setActiveTab('treatments')}
        >
          <Ionicons
            name="fitness"
            size={20}
            color={activeTab === 'treatments' ? colors.white : colors.gray}
          />
          <Text style={[styles.tabText, activeTab === 'treatments' && styles.activeTabText]}>
            Traitements ({treatments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={activeTab === 'history' ? colors.white : colors.gray}
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Antécédents ({medicalHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'vaccinations' && renderVaccinations()}
        {activeTab === 'treatments' && renderTreatments()}
        {activeTab === 'history' && renderMedicalHistory()}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddButton}>
        <Ionicons name="add" size={28} color={colors.white} />
        <Text style={styles.addButtonText}>{getAddButtonText()}</Text>
      </TouchableOpacity>
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
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.teal,
  },
  tabText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
  },
  activeTabText: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 3,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    flex: 1,
  },
  cardDate: {
    fontSize: typography.fontSize.sm,
    color: colors.teal,
    marginBottom: spacing.xs,
  },
  cardInfo: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: 2,
  },
  cardNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  typeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  documentsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  documentsText: {
    fontSize: typography.fontSize.xs,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  cardActions: {
    flexDirection: 'column',
    gap: spacing.sm,
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
    fontSize: typography.fontSize.lg,
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
  },
  addButton: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

