import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { getUnreadNotificationsCount } from '../services/notificationService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

interface NotificationBellProps {
  onPress: () => void;
  iconColor?: string;
  backgroundColor?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  onPress, 
  iconColor = colors.navy, 
  backgroundColor = colors.lightBlue 
}) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log('🔔 NotificationBell: useEffect déclenché, user:', user?.id);
    if (!user?.id) {
      console.log('🔔 NotificationBell: Pas d\'utilisateur connecté');
      setIsLoaded(true);
      setUnreadCount(0);
      return;
    }

    console.log('🔔 NotificationBell: Initialisation pour user:', user.id);

    try {
      // Écouter les changements de notifications en temps réel depuis Firestore
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.id),
        where('read', '==', false)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const count = snapshot.size;
        console.log('🔔 Notifications non lues:', count);
        setUnreadCount(count);
        setIsLoaded(true);
      }, (error) => {
        console.error('🔔 Erreur écoute notifications:', error);
        setUnreadCount(0);
        setIsLoaded(true);
      });

      return () => {
        console.log('🔔 Nettoyage listener notifications');
        unsubscribe();
      };
    } catch (error) {
      console.error('🔔 Erreur initialisation NotificationBell:', error);
      setUnreadCount(0);
      setIsLoaded(true);
    }
  }, [user?.id]);

  const handlePress = () => {
    // Le compteur sera mis à jour automatiquement via onSnapshot
    // quand les notifications seront marquées comme lues
    onPress();
  };

  console.log('🔔 NotificationBell render - unreadCount:', unreadCount, 'isLoaded:', isLoaded);

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor }]} 
      onPress={handlePress}
      accessibilityLabel="Notifications"
      accessibilityHint={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
      testID="notification-bell"
    >
      <Ionicons 
        name={unreadCount > 0 ? "notifications" : "notifications-outline"} 
        size={28} 
        color={iconColor} 
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

