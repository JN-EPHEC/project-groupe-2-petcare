import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import * as Notifications from 'expo-notifications';

interface NotificationBellProps {
  onPress: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onPress }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log('🔔 NotificationBell: useEffect déclenché, user:', user?.id);
    if (!user) {
      console.log('🔔 NotificationBell: Pas d\'utilisateur connecté, affichage quand même');
      setIsLoaded(true);
      return;
    }

    console.log('🔔 NotificationBell: Initialisation pour user:', user.id);

    try {
      // Écouter les notifications entrantes pour mettre à jour le badge
      const subscription = Notifications.addNotificationReceivedListener((notification) => {
        console.log('🔔 Notification reçue:', notification);
        setUnreadCount(prev => prev + 1);
      });

      // Charger le nombre initial de notifications non lues
      loadUnreadCount();
      setIsLoaded(true);

      return () => {
        subscription.remove();
      };
    } catch (error) {
      console.error('🔔 Erreur initialisation NotificationBell:', error);
      setIsLoaded(true);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      console.log('🔔 loadUnreadCount: Début chargement...');
      // Pour l'instant, simuler avec les notifications planifiées
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Dans une implémentation complète, vous feriez une requête Firestore
      // pour compter les notifications non lues de l'utilisateur
      // Exemple : const unread = await getUnreadNotificationsCount(user.id);
      
      console.log('🔔 Notifications planifiées:', scheduledNotifications.length);
      setUnreadCount(scheduledNotifications.length);
    } catch (error) {
      console.error('🔔 Erreur chargement count notifications:', error);
      // Continuer quand même, afficher 0
      setUnreadCount(0);
    }
  };

  const handlePress = () => {
    // Réinitialiser le compteur quand on ouvre les notifications
    setUnreadCount(0);
    onPress();
  };

  console.log('🔔 NotificationBell render - unreadCount:', unreadCount, 'isLoaded:', isLoaded);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      accessibilityLabel="Notifications"
      accessibilityHint={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
      testID="notification-bell"
    >
      <Ionicons 
        name={unreadCount > 0 ? "notifications" : "notifications-outline"} 
        size={28} 
        color="#FFFFFF" 
      />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: spacing.sm,
    marginRight: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.red,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
});

