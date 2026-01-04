import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';
import { WellnessAlert as WellnessAlertType } from '../types/premium';

interface WellnessAlertProps {
  alert: WellnessAlertType;
  onDismiss?: (alertId: string) => void;
  onViewDetails?: (alert: WellnessAlertType) => void;
}

export const WellnessAlert: React.FC<WellnessAlertProps> = ({ 
  alert, 
  onDismiss, 
  onViewDetails 
}) => {
  const severityConfig = {
    info: {
      backgroundColor: '#E3F2FD',
      borderColor: '#2196F3',
      iconColor: '#2196F3',
      icon: 'information-circle' as const,
    },
    warning: {
      backgroundColor: '#FFF3E0',
      borderColor: '#FF9800',
      iconColor: '#FF9800',
      icon: 'warning' as const,
    },
    critical: {
      backgroundColor: '#FFEBEE',
      borderColor: '#F44336',
      iconColor: '#F44336',
      icon: 'alert-circle' as const,
    },
  };
  
  const config = severityConfig[alert.severity];
  
  const getAlertTitle = (type: string): string => {
    switch (type) {
      case 'weight_loss':
        return 'Perte de poids';
      case 'weight_gain':
        return 'Prise de poids';
      case 'low_activity':
        return 'Activité réduite';
      case 'food_change':
        return 'Changement alimentaire';
      default:
        return 'Alerte';
    }
  };
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor 
      }
    ]}>
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon} size={32} color={config.iconColor} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: config.iconColor }]}>
          {getAlertTitle(alert.type)}
        </Text>
        <Text style={styles.message}>{alert.message}</Text>
        <Text style={styles.date}>
          {new Date(alert.triggeredAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      
      <View style={styles.actions}>
        {onViewDetails && (
          <TouchableOpacity 
            style={[styles.button, styles.detailsButton]}
            onPress={() => onViewDetails(alert)}
          >
            <Ionicons name="eye-outline" size={20} color={config.iconColor} />
          </TouchableOpacity>
        )}
        
        {onDismiss && (
          <TouchableOpacity 
            style={[styles.button, styles.dismissButton]}
            onPress={() => onDismiss(alert.id)}
          >
            <Ionicons name="close" size={20} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: spacing.md,
    paddingTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  dismissButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});




