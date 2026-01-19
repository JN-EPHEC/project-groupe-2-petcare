import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { 
  getNotificationsByUserId, 
  markNotificationAsRead, 
  deleteNotification,
  acceptAssignmentRequest,
  rejectAssignmentRequest,
  addNotification,
  getAssignmentRequestsByVetId,
  getPetById,
  Notification
} from '../../services/firestoreService';
import { InAppAlert } from '../../components';

interface VetNotificationsScreenProps {
  navigation: any;
}

export const VetNotificationsScreen: React.FC<VetNotificationsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [petDetails, setPetDetails] = useState<any>(null);
  
  // État pour l'alert in-app
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setAlert({ visible: true, title, message, type });
  };

  const closeAlert = () => {
    setAlert({ ...alert, visible: false });
  };

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      console.log('🔔 Chargement notifications pour:', user.id);
      const notifs = await getNotificationsByUserId(user.id);
      setNotifications(notifs);
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
      showAlert('Erreur', 'Impossible de charger les notifications', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    console.log('🔔 Notification cliquée:', notification);

    // Marquer comme lue si pas déjà lue
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id!);
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
      } catch (error) {
        console.error('Erreur marquage notification:', error);
      }
    }

    // Si c'est une demande d'assignation, charger les détails et ouvrir le modal
    if (notification.type === 'pet_assignment_request' && notification.data?.requestId) {
      try {
        setIsLoading(true);
        
        // Récupérer les détails de l'animal
        if (notification.data.petId) {
          const pet = await getPetById(notification.data.petId);
          setPetDetails(pet);
        }
        
        setSelectedNotification(notification);
        setShowApprovalModal(true);
      } catch (error) {
        console.error('Erreur chargement détails:', error);
        showAlert('Erreur', 'Impossible de charger les détails', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleApprove = async () => {
    if (!selectedNotification?.data?.requestId || !selectedNotification?.data?.ownerId) return;

    try {
      setIsProcessing(true);
      console.log('✅ Approbation de la demande:', selectedNotification.data.requestId);

      // Accepter la demande
      await acceptAssignmentRequest(selectedNotification.data.requestId);

      // Créer une notification pour le propriétaire
      await addNotification({
        userId: selectedNotification.data.ownerId,
        type: 'pet_assignment_accepted',
        title: 'Demande acceptée ! 🎉',
        message: `Dr. ${user?.firstName} ${user?.lastName} a accepté de prendre en charge ${selectedNotification.data.petName}. Vous pouvez maintenant prendre rendez-vous !`,
        read: false,
        data: {
          petId: selectedNotification.data.petId,
          vetId: user?.id,
        },
      });

      // Supprimer la notification de la liste
      await deleteNotification(selectedNotification.id!);
      setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));

      // Fermer le modal
      setShowApprovalModal(false);
      setSelectedNotification(null);
      setPetDetails(null);

      showAlert('Succès', 'Demande acceptée avec succès !', 'success');
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      showAlert('Erreur', 'Impossible d\'accepter la demande', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedNotification?.data?.requestId || !selectedNotification?.data?.ownerId) return;

    try {
      setIsProcessing(true);
      console.log('❌ Refus de la demande:', selectedNotification.data.requestId);

      // Refuser la demande
      await rejectAssignmentRequest(selectedNotification.data.requestId);

      // Créer une notification pour le propriétaire
      await addNotification({
        userId: selectedNotification.data.ownerId,
        type: 'pet_assignment_rejected',
        title: 'Demande refusée',
        message: `Dr. ${user?.firstName} ${user?.lastName} ne peut pas prendre en charge ${selectedNotification.data.petName} pour le moment.`,
        read: false,
        data: {
          petId: selectedNotification.data.petId,
          vetId: user?.id,
        },
      });

      // Supprimer la notification de la liste
      await deleteNotification(selectedNotification.id!);
      setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));

      // Fermer le modal
      setShowApprovalModal(false);
      setSelectedNotification(null);
      setPetDetails(null);

      showAlert('Refusé', 'Demande refusée', 'info');
    } catch (error) {
      console.error('❌ Erreur refus:', error);
      showAlert('Erreur', 'Impossible de refuser la demande', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showAlert('Erreur', 'Impossible de supprimer la notification', 'error');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'pet_assignment_request':
        return 'medical';
      case 'appointment_request':
        return 'calendar';
      case 'appointment_confirmed':
        return 'checkmark-circle';
      case 'appointment_cancelled':
        return 'close-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'pet_assignment_request':
        return colors.teal;
      case 'appointment_request':
        return colors.orange;
      case 'appointment_confirmed':
        return colors.green;
      case 'appointment_cancelled':
        return colors.error;
      default:
        return colors.lightBlue;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* In-App Alert */}
      {alert.visible && (
        <InAppAlert
          message={`${alert.title}\n${alert.message}`}
          type={alert.type}
          onClose={closeAlert}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="notifications" size={32} color={colors.teal} />
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Notifications</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="notifications-off" size={32} color={colors.gray} />
          <Text style={styles.statNumber}>{unreadCount}</Text>
          <Text style={styles.statLabel}>Non lue</Text>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.teal} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color={colors.gray} />
            <Text style={styles.emptyText}>Aucune notification</Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadCard
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={styles.notificationHeader}>
                  <View style={[
                    styles.iconCircle,
                    { backgroundColor: `${getNotificationColor(notification.type)}20` }
                  ]}>
                    <Ionicons 
                      name={getNotificationIcon(notification.type) as any}
                      size={24} 
                      color={getNotificationColor(notification.type)} 
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationDate}>{formatDate(notification.createdAt)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(notification.id!)}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
                {!notification.read && (
                  <View style={styles.unreadDot} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Approval Modal */}
      <Modal
        visible={showApprovalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApprovalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="medical" size={48} color={colors.teal} />
              <Text style={styles.modalTitle}>Nouvelle demande de prise en charge</Text>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={colors.teal} />
            ) : petDetails ? (
              <View style={styles.petDetailsContainer}>
                <View style={styles.petDetailRow}>
                  <Text style={styles.petDetailLabel}>Animal :</Text>
                  <Text style={styles.petDetailValue}>{petDetails.name}</Text>
                </View>
                <View style={styles.petDetailRow}>
                  <Text style={styles.petDetailLabel}>Espèce :</Text>
                  <Text style={styles.petDetailValue}>{petDetails.type}</Text>
                </View>
                <View style={styles.petDetailRow}>
                  <Text style={styles.petDetailLabel}>Race :</Text>
                  <Text style={styles.petDetailValue}>{petDetails.breed}</Text>
                </View>
                <View style={styles.petDetailRow}>
                  <Text style={styles.petDetailLabel}>Âge :</Text>
                  <Text style={styles.petDetailValue}>{petDetails.age} ans</Text>
                </View>
                <View style={styles.petDetailRow}>
                  <Text style={styles.petDetailLabel}>Propriétaire :</Text>
                  <Text style={styles.petDetailValue}>{selectedNotification?.data?.ownerName}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={handleReject}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={24} color={colors.white} />
                    <Text style={styles.modalButtonText}>Refuser</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.approveButton]}
                onPress={handleApprove}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color={colors.white} />
                    <Text style={styles.modalButtonText}>Accepter</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowApprovalModal(false)}
              disabled={isProcessing}
            >
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  placeholder: {
    width: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
    marginVertical: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  scrollView: {
    flex: 1,
  },
  notificationsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  unreadCard: {
    backgroundColor: '#E0F7FA',
    borderColor: colors.teal,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xxs,
  },
  notificationMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  notificationDate: {
    fontSize: typography.fontSize.xs,
    color: colors.lightBlue,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  unreadDot: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.teal,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.gray,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  petDetailsContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  petDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  petDetailLabel: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    fontWeight: typography.fontWeight.semiBold,
  },
  petDetailValue: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
    fontWeight: typography.fontWeight.bold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  approveButton: {
    backgroundColor: colors.teal,
  },
  modalButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  modalCloseButton: {
    padding: spacing.sm,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
});

