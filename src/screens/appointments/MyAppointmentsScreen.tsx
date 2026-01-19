import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentsByOwnerId, deleteAppointment } from '../../services/firestoreService';

interface MyAppointmentsScreenProps {
  navigation: any;
}

interface Appointment {
  id: string;
  vetId: string;
  vetName: string;
  ownerId: string;
  ownerName: string;
  petId: string;
  petName: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  status: 'pending' | 'upcoming' | 'rejected' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string;
  confirmedDate?: string;
  confirmedTime?: string;
}

export const MyAppointmentsScreen: React.FC<MyAppointmentsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Utiliser useFocusEffect pour rafraîchir à chaque fois que l'écran revient en focus
  useFocusEffect(
    useCallback(() => {
      console.log('📅 MyAppointmentsScreen - Écran en focus, chargement des RDV...');
      loadAppointments();
    }, [user])
  );

  const loadAppointments = async (isRefresh = false) => {
    if (!user?.id) {
      console.log('⚠️ Pas d\'utilisateur connecté');
      return;
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      console.log('📥 Récupération des RDV pour ownerId:', user.id);
      const appointmentsList = await getAppointmentsByOwnerId(user.id);
      console.log('✅ RDV récupérés:', appointmentsList.length);
      
      if (appointmentsList.length > 0) {
        console.log('📋 Statuts des RDV:', appointmentsList.map(a => `${a.id}: ${a.status}`));
        const pending = appointmentsList.filter(a => a.status === 'pending');
        const upcoming = appointmentsList.filter(a => a.status === 'upcoming');
        console.log(`   🟠 Pending: ${pending.length}, 🟢 À venir: ${upcoming.length}`);
      }
      
      // Trier par date (plus récent en premier)
      const sorted = appointmentsList.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });

      setAppointments(sorted);
      console.log('💾 État mis à jour avec', sorted.length, 'RDV');
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadAppointments(true);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
        return;
      }
    }

    try {
      await deleteAppointment(appointmentId);
      loadAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return '#FFA726';
      case 'upcoming':
        return '#66BB6A';
      case 'rejected':
        return '#EF5350';
      case 'cancelled':
        return colors.gray;
      case 'completed':
        return colors.teal;
      default:
        return colors.gray;
    }
  };

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'upcoming':
        return 'Confirmé';
      case 'rejected':
        return 'Refusé';
      case 'cancelled':
        return 'Annulé';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'upcoming':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'cancelled':
        return 'ban';
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'help-circle';
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const statusColor = getStatusColor(appointment.status);
    const isPast = new Date(`${appointment.date} ${appointment.time}`) < new Date();

    return (
      <View key={appointment.id} style={styles.appointmentCard}>
        {/* Header avec statut */}
        <View style={styles.appointmentHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons
              name={getStatusIcon(appointment.status) as any}
              size={16}
              color={colors.white}
            />
            <Text style={styles.statusText}>{getStatusLabel(appointment.status)}</Text>
          </View>
          {appointment.status === 'pending' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelAppointment(appointment.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF5350" />
            </TouchableOpacity>
          )}
        </View>

        {/* Info vétérinaire */}
        <View style={styles.appointmentInfo}>
          <Ionicons name="medical" size={24} color={colors.teal} />
          <View style={{ flex: 1 }}>
            <Text style={styles.vetName}>{appointment.vetName}</Text>
            <Text style={styles.petName}>🐾 {appointment.petName}</Text>
          </View>
        </View>

        {/* Date et heure */}
        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeItem}>
            <Ionicons name="calendar-outline" size={20} color={colors.navy} />
            <Text style={styles.dateTimeText}>
              {appointment.status === 'upcoming' && appointment.confirmedDate
                ? appointment.confirmedDate
                : appointment.date}
            </Text>
          </View>
          <View style={styles.dateTimeItem}>
            <Ionicons name="time-outline" size={20} color={colors.navy} />
            <Text style={styles.dateTimeText}>
              {appointment.status === 'upcoming' && appointment.confirmedTime
                ? appointment.confirmedTime
                : appointment.time}
            </Text>
          </View>
        </View>

        {/* Raison */}
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Raison :</Text>
          <Text style={styles.reasonText}>{appointment.reason}</Text>
        </View>

        {/* Notes */}
        {appointment.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.reasonLabel}>Notes :</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        )}

        {/* Raison du rejet */}
        {appointment.status === 'rejected' && appointment.rejectionReason && (
          <View style={[styles.notesBox, { backgroundColor: '#FFEBEE' }]}>
            <Text style={[styles.reasonLabel, { color: '#EF5350' }]}>Raison du refus :</Text>
            <Text style={[styles.notesText, { color: '#C62828' }]}>
              {appointment.rejectionReason}
            </Text>
          </View>
        )}

        {/* Date de création */}
        <Text style={styles.createdAt}>
          Demandé le {new Date(appointment.createdAt).toLocaleDateString('fr-FR')}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('HomeTab', { screen: 'Home' })}>
            <Ionicons name="arrow-back" size={28} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes rendez-vous</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('HomeTab', { screen: 'Home' })}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes rendez-vous</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RequestAppointment')}>
          <Ionicons name="add-circle" size={28} color={colors.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={80} color={colors.lightGray} />
            <Text style={styles.emptyStateTitle}>Aucun rendez-vous</Text>
            <Text style={styles.emptyStateText}>
              Vous n'avez pas encore demandé de rendez-vous
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('RequestAppointment')}
            >
              <Ionicons name="add" size={24} color={colors.white} />
              <Text style={styles.addButtonText}>Demander un rendez-vous</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats rapides */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {appointments.filter(a => a.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>En attente</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: '#66BB6A' }]}>
                  {appointments.filter(a => a.status === 'upcoming').length}
                </Text>
                <Text style={styles.statLabel}>Confirmés</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: colors.teal }]}>
                  {appointments.filter(a => a.status === 'completed').length}
                </Text>
                <Text style={styles.statLabel}>Terminés</Text>
              </View>
            </View>

            {/* Liste des rendez-vous */}
            {appointments.map(renderAppointmentCard)}
          </>
        )}
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
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  appointmentCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textTransform: 'uppercase',
  },
  cancelButton: {
    padding: spacing.xs,
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  vetName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  petName: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: 2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.lightBlue,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  dateTimeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  reasonBox: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  reasonLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
  },
  notesBox: {
    backgroundColor: '#FFF9C4',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  notesText: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  createdAt: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

