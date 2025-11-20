import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'light';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.primaryButton,
    variant === 'secondary' && styles.secondaryButton,
    variant === 'light' && styles.lightButton,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'light' && styles.lightText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'light' ? colors.navy : colors.white} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButton: {
    backgroundColor: colors.navy,
  },
  secondaryButton: {
    backgroundColor: colors.teal,
  },
  lightButton: {
    backgroundColor: colors.lightBlue,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  lightText: {
    color: colors.navy,
  },
});
