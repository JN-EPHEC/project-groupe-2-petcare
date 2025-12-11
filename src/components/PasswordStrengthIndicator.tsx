import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

interface PasswordStrengthIndicatorProps {
  password: string;
  showLabel?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showLabel = true,
}) => {
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength; // 0-4
  };

  const strength = getPasswordStrength(password);

  const getStrengthLabel = (): string => {
    if (strength === 0 || password.length === 0) return '';
    if (strength === 1) return 'Très faible';
    if (strength === 2) return 'Faible';
    if (strength === 3) return 'Moyen';
    return 'Fort';
  };

  const getStrengthColor = (): string => {
    if (strength === 0 || password.length === 0) return colors.lightGray;
    if (strength === 1) return '#FF3B30'; // Red
    if (strength === 2) return '#FF9500'; // Orange
    if (strength === 3) return '#FF9800'; // Amber
    return '#34C759'; // Green
  };

  const getStrengthWidth = (): string => {
    if (strength === 0 || password.length === 0) return '0%';
    if (strength === 1) return '25%';
    if (strength === 2) return '50%';
    if (strength === 3) return '75%';
    return '100%';
  };

  if (password.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: getStrengthWidth(),
                backgroundColor: getStrengthColor(),
              },
            ]}
          />
        </View>
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: getStrengthColor() }]}>
          {getStrengthLabel()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  barContainer: {
    marginBottom: spacing.xs,
  },
  barBackground: {
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
    transition: 'width 0.3s ease',
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    marginLeft: spacing.xs,
  },
});

