import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { offlineService } from '../services/offlineService';

interface OfflineIndicatorProps {
  style?: any;
}

/**
 * Indicateur visuel du mode hors ligne
 * Affiche un badge quand le mode est actif et/ou quand des données sont en attente
 */
export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ style }) => {
  const navigation = useNavigation();
  const [isOfflineEnabled, setIsOfflineEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const checkStatus = async () => {
    try {
      const stats = await offlineService.getOfflineStats();
      setIsOfflineEnabled(stats.enabled);
      setIsOnline(stats.isOnline);
      setPendingCount(stats.pendingCount);
    } catch (error) {
      console.error('Error checking offline status:', error);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Ne rien afficher si le mode n'est pas activé et qu'il n'y a pas de données en attente
  if (!isOfflineEnabled && pendingCount === 0) {
    return null;
  }

  const handlePress = () => {
    // @ts-ignore - Navigation typing
    navigation.navigate('OfflineMode');
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.badge,
        !isOnline ? styles.badgeOffline : styles.badgeOnline,
      ]}>
        <Ionicons 
          name={!isOnline ? 'cloud-offline' : 'cloud-done'} 
          size={16} 
          color={colors.white} 
        />
        {pendingCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{pendingCount > 9 ? '9+' : pendingCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    minWidth: 36,
    height: 28,
  },
  badgeOnline: {
    backgroundColor: colors.teal,
  },
  badgeOffline: {
    backgroundColor: '#FF9800',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  countText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

