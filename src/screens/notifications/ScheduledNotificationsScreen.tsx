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
  getAllNotificationsFromFirestore,
  deleteNotificationFromFirestore,
  markNotificationAsRead,
  type FirestoreNotification,
} from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

interface ScheduledNotificationsScreenProps {
  navigation: any;
}

export const ScheduledNotificationsScreen: React.FC<ScheduledNotificationsScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    if (!user?.id) {
      console.log('⚠️ Pas d\'utilisateur connecté');
      setIsLoading(false);
      setRefreshing(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const firestoreNotifications = await getAllNotificationsFromFirestore(user.id);
      console.log('📋 Notifications Firestore récupérées:', firestoreNotifications.length);
      setNotifications(firestoreNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Recharger quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleDeleteNotification = async (notificationId: string, title: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Supprimer la notification "${title}" ?`)) {
        return;
      }
    } else {
      Alert.alert(
        'Supprimer la notification',
        `Êtes-vous sûr de vouloir supprimer "${title}" ?`,
        [
          { text: 'Non', style: 'cancel' },
          {
            text: 'Oui, supprimer',
            style: 'destructive',
            onPress: () => performDelete(notificationId),
          },
        ]
      );
      return;
    }

    await performDelete(notificationId);
  };

  const performDelete = async (notificationId: string) => {
    try {
      await deleteNotificationFromFirestore(notificationId);
      console.log('✅ Notification supprimée:', notificationId);
      await loadNotifications();
      
      if (Platform.OS === 'web') {
        window.alert('Notification supprimée avec succès');
      } else {
        Alert.alert('Succès', 'Notification supprimée avec succès');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur lors de la suppression');
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer la notification');
      }
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      console.log('✅ Notification marquée comme lue:', notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = async (notification: FirestoreNotification) => {
    console.log('🔔 Notification pressée:', notification);
    
    // Marquer comme lue si pas encore lue
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigation selon le type de notification
    switch (notification.type) {
      case 'new_appointment_request':
        // Pour les vétérinaires : aller vers la page de gestion des RDV
        console.log('→ Navigation vers ManageAppointments');
        navigation.navigate('ManageAppointments', { 
          appointmentId: notification.data?.appointmentId 
        });
        break;

      case 'appointment_accepted':
      case 'appointment_rejected':
        // Pour les propriétaires : aller vers la page "Mes rendez-vous"
        console.log('→ Navigation vers MyAppointments');
        navigation.navigate('MyAppointments', { 
          appointmentId: notification.data?.appointmentId 
        });
        break;

      case 'reminder':
        // Naviguer vers la page des rappels
        console.log('→ Navigation vers Reminders');
        if (notification.data?.reminderId) {
          navigation.navigate('Reminders');
        }
        break;

      case 'vaccination':
        // Naviguer vers la page des vaccinations
        console.log('→ Navigation vers Vaccinations');
        if (notification.data?.petId) {
          navigation.navigate('Vaccinations', { 
            petId: notification.data.petId 
          });
        }
        break;

      default:
        console.log('⚠️ Type de notification non géré:', notification.type);
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_appointment_request':
        return 'calendar';
      case 'appointment_accepted':
        return 'checkmark-circle';
      case 'appointment_rejected':
        return 'close-circle';
      case 'reminder':
        return 'alarm';
      case 'appointment':
        return 'calendar';
      case 'vaccination':
        return 'medkit';
      case 'health':
        return 'heart';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_appointment_request':
        return '#FF9800';
      case 'appointment_accepted':
        return '#4CAF50';
      case 'appointment_rejected':
        return '#F44336';
      case 'reminder':
        return '#FF9800';
      case 'appointment':
        return '#2196F3';
      case 'vaccination':
        return '#4CAF50';
      case 'health':
        return '#E91E63';
      default:
        return colors.teal;
    }
  };

  const formatDate = (createdAt: any): string => {
    if (!createdAt) {
      return 'Date inconnue';
    }

    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Date formatée
    const formattedDate = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Temps écoulé
    let timeAgo = '';
    if (diffMinutes < 1) {
      timeAgo = 'À l\'instant';
    } else if (diffMinutes < 60) {
      timeAgo = `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      timeAgo = `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      timeAgo = `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      timeAgo = formattedDate;
    }

    return `${timeAgo}\n${formattedDate} à ${formattedTime}`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications à venir</Text>
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
          <Text style={styles.headerTitle}>Mes notifications</Text>
          <View style={{ width: 28 }} />
        </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="notifications" size={24} color={colors.teal} />
            <Text style={styles.statNumber}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Notification{notifications.length > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="eye-off" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>{notifications.filter(n => !n.read).length}</Text>
            <Text style={styles.statLabel}>Non lue{notifications.filter(n => !n.read).length > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Liste des notifications */}
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color={colors.lightGray} />
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptySubtitle}>
              Vous recevrez ici vos notifications de rendez-vous, rappels, et autres messages importants
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {notifications.map((notification) => {
              const icon = getNotificationIcon(notification.type);
              const color = getNotificationColor(notification.type);

              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.unreadNotificationCard
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View style={[styles.notificationIconContainer, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon as any} size={28} color={color} />
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      {!notification.read && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>Nouveau</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.notificationBody} numberOfLines={2}>
                      {notification.body}
                    </Text>
                    <Text style={styles.notificationDate}>
                      {formatDate(notification.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.notificationActions}>
                    {!notification.read && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.readButton]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        <Ionicons name="checkmark" size={20} color="#4CAF50" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(
                          notification.id,
                          notification.title || 'cette notification'
                        );
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  createButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  listContainer: {
    gap: spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: spacing.md,
  },
  unreadNotificationCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: colors.teal,
  },
  notificationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.teal,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  unreadBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  notificationBody: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: typography.fontSize.xs,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  notificationActions: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readButton: {
    backgroundColor: '#E8F5E9',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
});

