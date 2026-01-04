import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../theme';

interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'gold' | 'outlined' | 'gradient';
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ 
  size = 'medium',
  showText = true,
  style,
  textStyle,
  variant = 'gold'
}) => {
  const sizeConfig = {
    small: { iconSize: 14, fontSize: 10, padding: 4, paddingH: 8 },
    medium: { iconSize: 18, fontSize: 12, padding: 6, paddingH: 12 },
    large: { iconSize: 24, fontSize: 14, padding: 8, paddingH: 16 },
  };

  const config = sizeConfig[size];

  let containerStyle = styles.containerGold;
  if (variant === 'outlined') {
    containerStyle = styles.containerOutlined;
  } else if (variant === 'gradient') {
    containerStyle = styles.containerGradient;
  }

  const textColor = variant === 'outlined' ? '#FFB300' : colors.white;

  return (
    <View style={[containerStyle, { 
      paddingVertical: config.padding, 
      paddingHorizontal: config.paddingH 
    }, style]}>
      <Ionicons name="star" size={config.iconSize} color={textColor} />
      {showText && (
        <Text style={[styles.text, { 
          fontSize: config.fontSize, 
          color: textColor 
        }, textStyle]}>
          PREMIUM
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  containerGold: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB300',
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  containerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6F00', // Fallback - gradient simulé avec une couleur plus foncée
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  containerOutlined: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: '#FFB300',
    gap: spacing.xs,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});


