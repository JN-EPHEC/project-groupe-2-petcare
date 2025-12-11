import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  onIconRightPress?: () => void;
  error?: string;
  success?: boolean;
  editable?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  iconLeft,
  iconRight,
  onIconRightPress,
  error,
  success,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Si c'est un champ password et qu'il n'y a pas d'icône right custom, on ajoute le toggle
  const showPasswordToggle = secureTextEntry && !iconRight;
  const actualSecureEntry = secureTextEntry && !isPasswordVisible;

  const getInputContainerStyle = () => {
    if (error) return [styles.inputContainer, styles.inputContainerError];
    if (success) return [styles.inputContainer, styles.inputContainerSuccess];
    if (isFocused) return [styles.inputContainer, styles.inputContainerFocused];
    return styles.inputContainer;
  };

  const handleIconRightPress = () => {
    if (showPasswordToggle) {
      setIsPasswordVisible(!isPasswordVisible);
    } else if (onIconRightPress) {
      onIconRightPress();
    }
  };

  const getRightIcon = () => {
    if (showPasswordToggle) {
      return isPasswordVisible ? 'eye-off' : 'eye';
    }
    if (success && !iconRight) {
      return 'checkmark-circle';
    }
    return iconRight;
  };

  const getRightIconColor = () => {
    if (success && !iconRight) return '#34C759';
    if (error) return colors.red;
    return colors.lightGray;
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={getInputContainerStyle()}>
        {iconLeft && (
          <Ionicons
            name={iconLeft}
            size={20}
            color={error ? colors.red : isFocused ? colors.teal : colors.lightGray}
            style={styles.iconLeft}
          />
        )}
        <TextInput
          style={[
            styles.input,
            iconLeft && styles.inputWithIconLeft,
            (getRightIcon() || showPasswordToggle) && styles.inputWithIconRight,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.lightGray}
          secureTextEntry={actualSecureEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
        />
        {(getRightIcon() || showPasswordToggle) && (
          <TouchableOpacity
            onPress={handleIconRightPress}
            style={styles.iconRightContainer}
            disabled={!showPasswordToggle && !onIconRightPress}
          >
            <Ionicons
              name={getRightIcon() as any}
              size={20}
              color={getRightIconColor()}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 56,
  },
  inputContainerFocused: {
    borderColor: colors.teal,
    backgroundColor: colors.white,
  },
  inputContainerError: {
    borderColor: colors.red,
    backgroundColor: '#FFF5F5',
  },
  inputContainerSuccess: {
    borderColor: '#34C759',
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  inputWithIconLeft: {
    paddingLeft: spacing.sm,
  },
  inputWithIconRight: {
    paddingRight: spacing.sm,
  },
  iconLeft: {
    marginLeft: spacing.lg,
  },
  iconRightContainer: {
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.red,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
});

