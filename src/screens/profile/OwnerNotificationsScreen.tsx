import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { 
  getNotificationsByUserId, 
  markNotificationAsRead, 
  deleteNotification,
  Notification
} from '../../services/firestoreService';
import { InAppAlert } from '../../components';

interface OwnerNotificationsScreenProps {
  navigation: any;
}

export const OwnerNotificationsScreen: React.FC<OwnerNotificationsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
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
    console.log('🔔 Notification pressée:', notification);

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

    // Gérer les différents types de notifications
    switch (notification.type) {
      case 'pet_assignment_accepted':
        showAlert(
          'Demande acceptée ! 🎉',
          notification.message,
          'success'
        );
        break;
      
      case 'pet_assignment_rejected':
        showAlert(
          'Demande refusée',
          notification.message,
          'info'
        );
        break;
      
      case 'appointment_confirmed':
        // Naviguer vers les rendez-vous
        showAlert(
          'Rendez-vous confirmé',
          notification.message,
          'success'
        );
        break;
      
      case 'appointment_cancelled':
        showAlert(
          'Rendez-vous annulé',
          notification.message,
          'warning'
        );
        break;
      
      default:
        console.log('ℹ️ Type de notification:', notification.type);
        showAlert(
          notification.title,
          notification.message,
          'info'
        );
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
      case 'pet_assignment_accepted':
        return 'checkmark-circle';
      case 'pet_assignment_rejected':
        return 'close-circle';
      case 'appointment_confirmed':
        return 'calendar';
      case 'appointment_cancelled':
        return 'calendar-outline';
      case 'appointment_request':
        return 'time';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'pet_assignment_accepted':
      case 'appointment_confirmed':
        return colors.green;
      case 'pet_assignment_rejected':
      case 'appointment_cancelled':
        return colors.error;
      case 'appointment_request':
        return colors.orange;
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
    
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
            <Text style={styles.emptySubtext}>Vous serez notifié(e) ici des demandes de vétérinaires et des rendez-vous</Text>
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
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.gray,
    marginTop: spacing.md,
    fontWeight: typography.fontWeight.bold,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});


