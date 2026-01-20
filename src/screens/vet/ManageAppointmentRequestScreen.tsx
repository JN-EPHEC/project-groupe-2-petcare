import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  acceptAppointmentRequest,
  proposeAlternativeAppointment,
  rejectAppointmentRequest,
} from '../../services/firestoreService';
import { sendAppointmentStatusNotification } from '../../services/notificationService';
import { InAppAlert } from '../../components';

interface ManageAppointmentRequestScreenProps {
  navigation: any;
  route: any;
}

export const ManageAppointmentRequestScreen: React.FC<ManageAppointmentRequestScreenProps> = ({
  navigation,
  route,
}) => {
  const appointment = route.params?.appointment;
  
  const [selectedAction, setSelectedAction] = useState<'accept' | 'propose' | 'reject' | null>(null);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text>Erreur : Rendez-vous non trouvé</Text>
      </View>
    );
  }

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      await acceptAppointmentRequest(appointment.id);
      
      // Envoyer notification au propriétaire
      await sendAppointmentStatusNotification(
        appointment.ownerId,
        'Rendez-vous confirmé',
        `Votre rendez-vous pour ${appointment.petName} le ${appointment.date} à ${appointment.time} a été confirmé`,
        {
          type: 'appointment_accepted',
          appointmentId: appointment.id,
          petName: appointment.petName,
          date: appointment.date,
          time: appointment.time,
        }
      );

      setAlert({
        visible: true,
        title: 'Confirmé !',
        message: 'Le rendez-vous a été confirmé et le propriétaire a été notifié.',
        type: 'success',
      });

      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error('Error accepting appointment:', error);
      setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Impossible de confirmer le rendez-vous',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropose = async () => {
    if (!proposedDate || !proposedTime) {
      setAlert({
        visible: true,
        title: 'Champs manquants',
        message: 'Veuillez sélectionner une date et une heure',
        type: 'warning',
      });
      return;
    }

    try {
      setIsLoading(true);
      await proposeAlternativeAppointment(
        appointment.id,
        proposedDate,
        proposedTime,
        proposalMessage
      );

      // Envoyer notification au propriétaire
      await sendAppointmentStatusNotification(
        appointment.ownerId,
        'Nouvelle proposition de rendez-vous',
        proposalMessage
          ? `Le vétérinaire propose le ${proposedDate} à ${proposedTime} : ${proposalMessage}`
          : `Le vétérinaire propose le ${proposedDate} à ${proposedTime} pour ${appointment.petName}`,
        {
          type: 'appointment_alternative_proposed',
          appointmentId: appointment.id,
          petName: appointment.petName,
          proposedDate,
          proposedTime,
          proposalMessage,
        }
      );

      setAlert({
        visible: true,
        title: 'Proposition envoyée !',
        message: 'Le propriétaire a été notifié de votre proposition.',
        type: 'success',
      });

      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error('Error proposing alternative:', error);
      setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Impossible d\'envoyer la proposition',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      await rejectAppointmentRequest(appointment.id, rejectionReason);

      // Envoyer notification au propriétaire
      await sendAppointmentStatusNotification(
        appointment.ownerId,
        'Rendez-vous refusé',
        rejectionReason
          ? `Le vétérinaire ne peut pas recevoir ${appointment.petName} : ${rejectionReason}`
          : `Le vétérinaire ne peut pas recevoir ${appointment.petName}`,
        {
          type: 'appointment_rejected',
          appointmentId: appointment.id,
          petName: appointment.petName,
          rejectionReason,
        }
      );

      setAlert({
        visible: true,
        title: 'Refusé',
        message: 'Le propriétaire a été notifié du refus.',
        type: 'success',
      });

      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      setAlert({
        visible: true,
        title: 'Erreur',
        message: 'Impossible de refuser le rendez-vous',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gérer la demande</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Appointment Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="calendar-outline" size={32} color={colors.teal} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Demande de rendez-vous</Text>
              <Text style={styles.infoSubtitle}>
                {appointment.ownerName} • {appointment.petName}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={colors.navy} />
            <Text style={styles.infoText}>Date souhaitée : {appointment.date}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={colors.navy} />
            <Text style={styles.infoText}>Heure souhaitée : {appointment.time}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="document-text" size={20} color={colors.navy} />
            <Text style={styles.infoText}>Raison : {appointment.reason}</Text>
          </View>

          {appointment.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Notes :</Text>
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {!selectedAction && (
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Que souhaitez-vous faire ?</Text>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => setSelectedAction('accept')}
            >
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
              <Text style={styles.actionButtonText}>Accepter la demande</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.proposeButton]}
              onPress={() => setSelectedAction('propose')}
            >
              <Ionicons name="calendar-outline" size={24} color={colors.white} />
              <Text style={styles.actionButtonText}>Proposer une autre date</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => setSelectedAction('reject')}
            >
              <Ionicons name="close-circle" size={24} color={colors.white} />
              <Text style={styles.actionButtonText}>Refuser la demande</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Accept Form */}
        {selectedAction === 'accept' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>✅ Confirmer le rendez-vous</Text>
            <Text style={styles.formDescription}>
              Le rendez-vous sera confirmé pour le {appointment.date} à {appointment.time}.
            </Text>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelFormButton}
                onPress={() => setSelectedAction(null)}
              >
                <Text style={styles.cancelFormButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitFormButton, styles.submitAccept]}
                onPress={handleAccept}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color={colors.white} />
                    <Text style={styles.submitFormButtonText}>Confirmer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Propose Alternative Form */}
        {selectedAction === 'propose' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>📅 Proposer une autre date</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date proposée *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
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
                  style={styles.input}
                  placeholder="AAAA-MM-JJ"
                  value={proposedDate}
                  onChangeText={setProposedDate}
                  placeholderTextColor={colors.gray}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Heure proposée *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="time"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
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
                  style={styles.input}
                  placeholder="HH:MM"
                  value={proposedTime}
                  onChangeText={setProposedTime}
                  placeholderTextColor={colors.gray}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Expliquez pourquoi cette date convient mieux..."
                value={proposalMessage}
                onChangeText={setProposalMessage}
                multiline
                numberOfLines={3}
                maxLength={200}
                placeholderTextColor={colors.gray}
              />
              <Text style={styles.charCount}>{proposalMessage.length}/200</Text>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelFormButton}
                onPress={() => setSelectedAction(null)}
              >
                <Text style={styles.cancelFormButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitFormButton, styles.submitPropose]}
                onPress={handlePropose}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color={colors.white} />
                    <Text style={styles.submitFormButtonText}>Envoyer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reject Form */}
        {selectedAction === 'reject' && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>❌ Refuser la demande</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Raison du refus (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Expliquez pourquoi vous ne pouvez pas accepter..."
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={3}
                maxLength={200}
                placeholderTextColor={colors.gray}
              />
              <Text style={styles.charCount}>{rejectionReason.length}/200</Text>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelFormButton}
                onPress={() => setSelectedAction(null)}
              >
                <Text style={styles.cancelFormButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitFormButton, styles.submitReject]}
                onPress={handleReject}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="close" size={20} color={colors.white} />
                    <Text style={styles.submitFormButtonText}>Refuser</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Alert */}
      {alert && (
        <InAppAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
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
  infoCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.teal + '30',
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  infoSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  notesBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  notesLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  acceptButton: {
    backgroundColor: '#66BB6A',
  },
  proposeButton: {
    backgroundColor: colors.teal,
  },
  rejectButton: {
    backgroundColor: '#EF5350',
  },
  actionButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  formContainer: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  formDescription: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.navy,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelFormButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray,
    alignItems: 'center',
  },
  cancelFormButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
  },
  submitFormButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  submitAccept: {
    backgroundColor: '#66BB6A',
  },
  submitPropose: {
    backgroundColor: colors.teal,
  },
  submitReject: {
    backgroundColor: '#EF5350',
  },
  submitFormButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

