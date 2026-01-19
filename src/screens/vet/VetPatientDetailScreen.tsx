import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { 
  Pet, 
  getUserById, 
  getVaccinationsByPetId, 
  getTreatmentsByPetId, 
  getMedicalHistoryByPetId,
  getAppointmentsByVetId,
  Vaccination,
  Treatment,
  MedicalHistory,
  Appointment
} from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

interface VetPatientDetailScreenProps {
  navigation: any;
  route: any;
}

export const VetPatientDetailScreen: React.FC<VetPatientDetailScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { patient, patientId } = route.params;
  const [activeTab, setActiveTab] = useState<'vaccinations' | 'treatments' | 'history' | 'appointments'>('vaccinations');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  // Recharger les données quand on revient sur cet écran (après ajout d'un élément)
  useFocusEffect(
    useCallback(() => {
      if (!isLoading) {
        console.log('🔄 VetPatientDetailScreen focused - Rechargement des données...');
        loadPatientData();
      }
    }, [patientId])
  );

  const loadPatientData = async () => {
    try {
      setIsLoading(true);
      console.log(`📋 Loading data for patient: ${patient.name} (${patientId})`);
      
      // Charger les infos du propriétaire
      const owner = await getUserById(patient.ownerId);
      setOwnerInfo(owner);
      
      // Charger le carnet de santé
      const [vaccs, treats, history] = await Promise.all([
        getVaccinationsByPetId(patientId),
        getTreatmentsByPetId(patientId),
        getMedicalHistoryByPetId(patientId),
      ]);
      
      setVaccinations(vaccs);
      setTreatments(treats);
      setMedicalHistory(history);
      
      // Charger les rendez-vous de ce patient
      if (user?.id) {
        const allAppointments = await getAppointmentsByVetId(user.id);
        const patientAppointments = allAppointments
          .filter(apt => apt.petId === patientId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAppointments(patientAppointments);
      }
      
      console.log('✅ Patient data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading patient data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPatientData();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: string; label: string }> = {
      upcoming: { color: colors.teal, icon: 'checkmark-circle', label: 'À venir' },
      pending: { color: colors.orange, icon: 'time', label: 'En attente' },
      completed: { color: colors.success, icon: 'checkmark-done', label: 'Terminé' },
      cancelled: { color: colors.error, icon: 'close-circle', label: 'Annulé' },
      rejected: { color: colors.error, icon: 'ban', label: 'Refusé' },
    };
    return statusConfig[status] || { color: colors.gray, icon: 'help-circle', label: status };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Chargement du dossier...</Text>
      </View>
    );
  }

  const upcomingAppointments = appointments.filter(apt => 
    (apt.status === 'upcoming' || apt.status === 'pending') &&
    new Date(apt.date) >= new Date()
  );

  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' ||
    new Date(apt.date) < new Date()
  );

  // Fonction pour ajouter des éléments au carnet de santé
  const handleAddHealthRecord = () => {
    const petParam = {
      id: patientId,
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      ownerId: patient.ownerId,
    };

    switch (activeTab) {
      case 'vaccinations':
        navigation.navigate('AddVaccination', { pet: petParam });
        break;
      case 'treatments':
        navigation.navigate('AddTreatment', { pet: petParam });
        break;
      case 'history':
        navigation.navigate('AddMedicalHistory', { pet: petParam });
        break;
      default:
        break;
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
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.patientHeader}>
            <View style={styles.patientAvatar}>
              <Text style={styles.avatarEmoji}>{patient.emoji || patient.imageEmoji || '🐾'}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientBreed}>{patient.breed} • {patient.age} ans • {patient.weight}kg</Text>
              {ownerInfo && (
                <View style={styles.ownerRow}>
                  <Ionicons name="person" size={14} color={colors.lightBlue} />
                  <Text style={styles.ownerText}>
                    {ownerInfo.firstName} {ownerInfo.lastName}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'vaccinations' && styles.tabActive]}
          onPress={() => setActiveTab('vaccinations')}
        >
          <Ionicons name="medical" size={20} color={activeTab === 'vaccinations' ? colors.white : colors.navy} />
          <Text style={[styles.tabText, activeTab === 'vaccinations' && styles.tabTextActive]}>
            Vaccins ({vaccinations.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'treatments' && styles.tabActive]}
          onPress={() => setActiveTab('treatments')}
        >
          <Ionicons name="medkit" size={20} color={activeTab === 'treatments' ? colors.white : colors.navy} />
          <Text style={[styles.tabText, activeTab === 'treatments' && styles.tabTextActive]}>
            Traitements ({treatments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons name="document-text" size={20} color={activeTab === 'history' ? colors.white : colors.navy} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Antécédents ({medicalHistory.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'appointments' && styles.tabActive]}
          onPress={() => setActiveTab('appointments')}
        >
          <Ionicons name="calendar" size={20} color={activeTab === 'appointments' ? colors.white : colors.navy} />
          <Text style={[styles.tabText, activeTab === 'appointments' && styles.tabTextActive]}>
            RDV ({appointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.teal]} />
        }
      >
        {/* Vaccinations */}
        {activeTab === 'vaccinations' && (
          <View style={styles.tabContent}>
            {vaccinations.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="medical-outline" size={48} color={colors.lightGray} />
                <Text style={styles.emptyText}>Aucune vaccination enregistrée</Text>
              </View>
            ) : (
              vaccinations.map((vacc) => (
                <View key={vacc.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="medical" size={20} color={colors.teal} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{vacc.vaccineName}</Text>
                      <Text style={styles.cardDate}>
                        {new Date(vacc.date).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardDetailText}>Vétérinaire: {vacc.vet}</Text>
                    {vacc.nextDueDate && (
                      <Text style={styles.cardDetailText}>
                        Prochain rappel: {new Date(vacc.nextDueDate).toLocaleDateString('fr-FR')}
                      </Text>
                    )}
                    {vacc.notes && (
                      <Text style={styles.cardDetailNotes}>{vacc.notes}</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Treatments */}
        {activeTab === 'treatments' && (
          <View style={styles.tabContent}>
            {treatments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="medkit-outline" size={48} color={colors.lightGray} />
                <Text style={styles.emptyText}>Aucun traitement enregistré</Text>
              </View>
            ) : (
              treatments.map((treatment) => (
                <View key={treatment.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="medkit" size={20} color={colors.teal} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{treatment.treatmentType}</Text>
                      <Text style={styles.cardDate}>
                        Du {new Date(treatment.startDate).toLocaleDateString('fr-FR')} au {new Date(treatment.endDate).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>
                  {treatment.notes && (
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardDetailNotes}>{treatment.notes}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Medical History */}
        {activeTab === 'history' && (
          <View style={styles.tabContent}>
            {medicalHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={colors.lightGray} />
                <Text style={styles.emptyText}>Aucun antécédent enregistré</Text>
              </View>
            ) : (
              medicalHistory.map((history) => (
                <View key={history.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="document-text" size={20} color={colors.teal} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{history.conditionType}</Text>
                      <Text style={styles.cardDate}>
                        {new Date(history.date).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>
                  {history.description && (
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardDetailNotes}>{history.description}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Appointments */}
        {activeTab === 'appointments' && (
          <View style={styles.tabContent}>
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <View style={styles.appointmentSection}>
                <Text style={styles.sectionTitle}>Rendez-vous à venir ({upcomingAppointments.length})</Text>
                {upcomingAppointments.map((apt) => {
                  const statusInfo = getStatusBadge(apt.status);
                  return (
                    <View key={apt.id} style={styles.appointmentCard}>
                      <View style={styles.appointmentHeader}>
                        <View style={[styles.appointmentStatusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                          <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
                          <Text style={[styles.appointmentStatusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                          </Text>
                        </View>
                        <Text style={styles.appointmentDate}>
                          {new Date(apt.date).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      <Text style={styles.appointmentTime}>🕐 {apt.time}</Text>
                      <Text style={styles.appointmentType}>📋 {apt.type || apt.reason || 'Consultation'}</Text>
                      {apt.notes && (
                        <Text style={styles.appointmentNotes}>{apt.notes}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <View style={styles.appointmentSection}>
                <Text style={styles.sectionTitle}>Historique des rendez-vous ({pastAppointments.length})</Text>
                {pastAppointments.slice(0, 5).map((apt) => {
                  const statusInfo = getStatusBadge(apt.status);
                  return (
                    <View key={apt.id} style={[styles.appointmentCard, styles.appointmentCardPast]}>
                      <View style={styles.appointmentHeader}>
                        <View style={[styles.appointmentStatusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                          <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
                          <Text style={[styles.appointmentStatusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                          </Text>
                        </View>
                        <Text style={styles.appointmentDate}>
                          {new Date(apt.date).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      <Text style={styles.appointmentTime}>🕐 {apt.time}</Text>
                      <Text style={styles.appointmentType}>📋 {apt.type || apt.reason || 'Consultation'}</Text>
                    </View>
                  );
                })}
                {pastAppointments.length > 5 && (
                  <Text style={styles.moreAppointmentsText}>
                    +{pastAppointments.length - 5} rendez-vous antérieurs
                  </Text>
                )}
              </View>
            )}

            {appointments.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.lightGray} />
                <Text style={styles.emptyText}>Aucun rendez-vous enregistré</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button - Visible seulement pour vaccinations, treatments, history */}
      {(activeTab === 'vaccinations' || activeTab === 'treatments' || activeTab === 'history') && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleAddHealthRecord}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={colors.white} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  header: {
    backgroundColor: colors.navy,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  patientName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  patientBreed: {
    fontSize: typography.fontSize.sm,
    color: colors.lightBlue,
    marginBottom: spacing.xs,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ownerText: {
    fontSize: typography.fontSize.sm,
    color: colors.lightBlue,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  tabActive: {
    backgroundColor: colors.teal,
  },
  tabText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  cardDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  cardDetails: {
    marginLeft: 56, // width of icon + marginRight
  },
  cardDetailText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  cardDetailNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  appointmentSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  appointmentCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentCardPast: {
    opacity: 0.7,
    borderLeftColor: colors.gray,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appointmentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  appointmentStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  appointmentDate: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  appointmentTime: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  appointmentType: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  appointmentNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  moreAppointmentsText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

