import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import {
  getAppointmentsByVetId,
  updateAppointment,
  deleteAppointment,
} from '../../services/firestoreService';
import { sendAppointmentStatusNotification } from '../../services/notificationService';

interface ManageAppointmentsScreenProps {
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

export const ManageAppointmentsScreen: React.FC<ManageAppointmentsScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'confirm' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [confirmedTime, setConfirmedTime] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async (isRefresh = false) => {
    if (!user?.id) return;

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const appointmentsList = await getAppointmentsByVetId(user.id);
      
      // Trier: en attente d'abord, puis par date
      const sorted = appointmentsList.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

      setAppointments(sorted);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadAppointments(true);
  };

  const openConfirmModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setConfirmedDate(appointment.date);
    setConfirmedTime(appointment.time);
    setModalType('confirm');
    setModalVisible(true);
  };

  const openRejectModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRejectionReason('');
    setModalType('reject');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAppointment(null);
    setModalType(null);
    setRejectionReason('');
    setConfirmedDate('');
    setConfirmedTime('');
  };

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return;

    if (!confirmedDate || !confirmedTime) {
      Alert.alert('Erreur', 'Veuillez spécifier une date et une heure');
      return;
    }

    try {
      setIsProcessing(true);
      
      console.log('📅 Confirmation du rendez-vous:', selectedAppointment.id);
      
      await updateAppointment(selectedAppointment.id, {
        status: 'upcoming',
        confirmedDate,
        confirmedTime,
        date: confirmedDate,
        time: confirmedTime,
        updatedAt: new Date().toISOString(),
      });
      
      // Envoyer une notification au propriétaire
      try {
        console.log('🔔 Envoi notification acceptation au propriétaire:', selectedAppointment.ownerId);
        await sendAppointmentStatusNotification(
          selectedAppointment.ownerId,
          'Rendez-vous accepté ✅',
          `Votre rendez-vous pour ${selectedAppointment.petName} a été confirmé le ${confirmedDate} à ${confirmedTime}`,
          {
            type: 'appointment_accepted',
            appointmentId: selectedAppointment.id,
            petName: selectedAppointment.petName,
            date: confirmedDate,
            time: confirmedTime,
          }
        );
        console.log('✅ Notification envoyée');
      } catch (notifError) {
        console.error('⚠️ Erreur envoi notification (non bloquant):', notifError);
        // Ne pas bloquer si la notification échoue
      }
      
      closeModal();
      loadAppointments();
      
      if (Platform.OS === 'web') {
        window.alert('Rendez-vous confirmé avec succès');
      } else {
        Alert.alert('Succès', 'Rendez-vous confirmé avec succès');
      }
    } catch (error) {
      console.error('❌ Error confirming appointment:', error);
      Alert.alert('Erreur', 'Impossible de confirmer le rendez-vous');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAppointment = async () => {
    if (!selectedAppointment) return;

    if (!rejectionReason.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer une raison pour le refus');
      return;
    }

    try {
      setIsProcessing(true);
      
      console.log('🚫 Rejet du rendez-vous:', selectedAppointment.id);
      
      await updateAppointment(selectedAppointment.id, {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        updatedAt: new Date().toISOString(),
      });
      
      // Envoyer une notification au propriétaire
      try {
        console.log('🔔 Envoi notification refus au propriétaire:', selectedAppointment.ownerId);
        await sendAppointmentStatusNotification(
          selectedAppointment.ownerId,
          'Rendez-vous refusé ❌',
          `Votre demande de rendez-vous pour ${selectedAppointment.petName} a été refusée. Raison: ${rejectionReason.trim()}`,
          {
            type: 'appointment_rejected',
            appointmentId: selectedAppointment.id,
            petName: selectedAppointment.petName,
            reason: rejectionReason.trim(),
          }
        );
        console.log('✅ Notification envoyée');
      } catch (notifError) {
        console.error('⚠️ Erreur envoi notification (non bloquant):', notifError);
        // Ne pas bloquer si la notification échoue
      }
      
      closeModal();
      loadAppointments();
      
      if (Platform.OS === 'web') {
        window.alert('Rendez-vous refusé');
      } else {
        Alert.alert('Refusé', 'Le propriétaire sera notifié');
      }
    } catch (error) {
      console.error('❌ Error rejecting appointment:', error);
      Alert.alert('Erreur', 'Impossible de refuser le rendez-vous');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await updateAppointment(appointmentId, {
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
      loadAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
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
    const isPending = appointment.status === 'pending';
    const isUpcoming = appointment.status === 'upcoming';

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
          {isPending && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NOUVEAU</Text>
            </View>
          )}
        </View>

        {/* Info propriétaire */}
        <View style={styles.appointmentInfo}>
          <Ionicons name="person" size={24} color={colors.navy} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ownerName}>{appointment.ownerName}</Text>
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

        {/* Actions selon le statut */}
        {isPending && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => openConfirmModal(appointment)}
            >
              <Ionicons name="checkmark" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => openRejectModal(appointment)}
            >
              <Ionicons name="close" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Refuser</Text>
            </TouchableOpacity>
          </View>
        )}

        {isUpcoming && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleCompleteAppointment(appointment.id)}
          >
            <Ionicons name="checkmark-done" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Marquer comme terminé</Text>
          </TouchableOpacity>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rendez-vous</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rendez-vous</Text>
        <View style={{ width: 28 }} />
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
              Vous n'avez pas encore reçu de demandes de rendez-vous
            </Text>
          </View>
        ) : (
          <>
            {/* Stats rapides */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: '#FFA726' }]}>
                  {appointments.filter(a => a.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>En attente</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: '#66BB6A' }]}>
                  {appointments.filter(a => a.status === 'upcoming').length}
                </Text>
                <Text style={styles.statLabel}>À venir</Text>
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

      {/* Modal de confirmation/rejet */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalType === 'confirm' && (
              <>
                <Text style={styles.modalTitle}>Confirmer le rendez-vous</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedAppointment?.ownerName} • {selectedAppointment?.petName}
                </Text>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Date confirmée</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="date"
                      value={confirmedDate}
                      onChange={(e) => setConfirmedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${colors.lightGray}`,
                        fontSize: '16px',
                        fontFamily: 'system-ui',
                      }}
                    />
                  ) : (
                    <TextInput
                      style={styles.modalInput}
                      value={confirmedDate}
                      onChangeText={setConfirmedDate}
                      placeholder="AAAA-MM-JJ"
                    />
                  )}
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Heure confirmée</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="time"
                      value={confirmedTime}
                      onChange={(e) => setConfirmedTime(e.target.value)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${colors.lightGray}`,
                        fontSize: '16px',
                        fontFamily: 'system-ui',
                      }}
                    />
                  ) : (
                    <TextInput
                      style={styles.modalInput}
                      value={confirmedTime}
                      onChangeText={setConfirmedTime}
                      placeholder="HH:MM"
                    />
                  )}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={closeModal}
                    disabled={isProcessing}
                  >
                    <Text style={styles.modalCancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalConfirmButton]}
                    onPress={handleConfirmAppointment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.modalConfirmButtonText}>Confirmer</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}

            {modalType === 'reject' && (
              <>
                <Text style={styles.modalTitle}>Refuser le rendez-vous</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedAppointment?.ownerName} • {selectedAppointment?.petName}
                </Text>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Raison du refus *</Text>
                  <TextInput
                    style={[styles.modalInput, styles.modalTextArea]}
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                    placeholder="Expliquez pourquoi vous refusez ce rendez-vous..."
                    multiline
                    numberOfLines={4}
                    maxLength={300}
                    placeholderTextColor={colors.gray}
                  />
                  <Text style={styles.charCount}>{rejectionReason.length}/300</Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={closeModal}
                    disabled={isProcessing}
                  >
                    <Text style={styles.modalCancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalRejectButton]}
                    onPress={handleRejectAppointment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.modalRejectButtonText}>Refuser</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  newBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  newBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  appointmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ownerName: {
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
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  confirmButton: {
    backgroundColor: '#66BB6A',
  },
  rejectButton: {
    backgroundColor: '#EF5350',
  },
  completeButton: {
    backgroundColor: colors.teal,
    marginTop: spacing.md,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginBottom: spacing.lg,
  },
  modalInputGroup: {
    marginBottom: spacing.lg,
  },
  modalLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  modalInput: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  modalTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.lightGray,
  },
  modalCancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  modalConfirmButton: {
    backgroundColor: '#66BB6A',
  },
  modalConfirmButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  modalRejectButton: {
    backgroundColor: '#EF5350',
  },
  modalRejectButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

