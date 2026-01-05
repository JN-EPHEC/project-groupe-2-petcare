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
  getAllScheduledNotifications,
  cancelNotification,
} from '../../services/notificationService';
import type * as Notifications from 'expo-notifications';

interface ScheduledNotificationsScreenProps {
  navigation: any;
}

export const ScheduledNotificationsScreen: React.FC<ScheduledNotificationsScreenProps> = ({
  navigation,
}) => {
  const [notifications, setNotifications] = useState<Notifications.NotificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const scheduled = await getAllScheduledNotifications();
      console.log('📋 Notifications planifiées:', scheduled.length);
      setNotifications(scheduled);
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

  const handleCancelNotification = async (identifier: string, title: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Annuler la notification "${title}" ?`)) {
        return;
      }
    } else {
      Alert.alert(
        'Annuler la notification',
        `Êtes-vous sûr de vouloir annuler "${title}" ?`,
        [
          { text: 'Non', style: 'cancel' },
          {
            text: 'Oui, annuler',
            style: 'destructive',
            onPress: () => performCancel(identifier),
          },
        ]
      );
      return;
    }

    await performCancel(identifier);
  };

  const performCancel = async (identifier: string) => {
    try {
      await cancelNotification(identifier);
      console.log('✅ Notification annulée:', identifier);
      await loadNotifications();
      
      if (Platform.OS === 'web') {
        window.alert('Notification annulée avec succès');
      } else {
        Alert.alert('Succès', 'Notification annulée avec succès');
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur lors de l\'annulation');
      } else {
        Alert.alert('Erreur', 'Impossible d\'annuler la notification');
      }
    }
  };

  const handleEditNotification = (notification: Notifications.NotificationRequest) => {
    navigation.navigate('EditNotification', { notification });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
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

  const formatDate = (trigger: any): string => {
    if (!trigger || !trigger.value) {
      return 'Date non définie';
    }

    const date = new Date(trigger.value);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

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

    // Temps restant
    let timeRemaining = '';
    if (diffMs < 0) {
      timeRemaining = 'Expirée';
    } else if (diffDays > 0) {
      timeRemaining = `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      timeRemaining = `Dans ${diffHours}h ${diffMinutes}min`;
    } else if (diffMinutes > 0) {
      timeRemaining = `Dans ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      timeRemaining = 'Dans quelques instants';
    }

    return `${formattedDate} à ${formattedTime}\n${timeRemaining}`;
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
        <Text style={styles.headerTitle}>Notifications à venir</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateNotification')}>
          <Ionicons name="add-circle" size={28} color={colors.teal} />
        </TouchableOpacity>
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
            <Text style={styles.statLabel}>Planifiée{notifications.length > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Liste des notifications */}
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color={colors.lightGray} />
            <Text style={styles.emptyTitle}>Aucune notification planifiée</Text>
            <Text style={styles.emptySubtitle}>
              Créez votre première notification pour recevoir des rappels importants
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateNotification')}
            >
              <Ionicons name="add-circle" size={24} color={colors.white} />
              <Text style={styles.createButtonText}>Créer une notification</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {notifications.map((notification) => {
              const type = notification.content.data?.type || 'general';
              const icon = getNotificationIcon(type);
              const color = getNotificationColor(type);

              return (
                <View key={notification.identifier} style={styles.notificationCard}>
                  <View style={[styles.notificationIconContainer, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon as any} size={28} color={color} />
                  </View>

                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.content.title}</Text>
                    <Text style={styles.notificationBody} numberOfLines={2}>
                      {notification.content.body}
                    </Text>
                    <Text style={styles.notificationDate}>
                      {formatDate(notification.trigger)}
                    </Text>
                  </View>

                  <View style={styles.notificationActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditNotification(notification)}
                    >
                      <Ionicons name="create-outline" size={20} color={colors.teal} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() =>
                        handleCancelNotification(
                          notification.identifier,
                          notification.content.title || 'cette notification'
                        )
                      }
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bouton flottant */}
      {notifications.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('CreateNotification')}
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
    marginBottom: spacing.xl,
  },
  statBox: {
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
  notificationTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
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
  editButton: {
    backgroundColor: '#E0F2F1',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  floatingButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
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

