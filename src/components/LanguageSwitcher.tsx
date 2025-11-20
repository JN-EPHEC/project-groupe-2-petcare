import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing, typography } from '../theme';

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'fr' ? 'en' : 'fr';
    changeLanguage(newLanguage);
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={toggleLanguage}
      activeOpacity={0.7}
    >
      <View style={styles.languageButton}>
        <Text style={[styles.languageText, currentLanguage === 'fr' && styles.activeLanguage]}>
          FR
        </Text>
        <Text style={styles.separator}>|</Text>
        <Text style={[styles.languageText, currentLanguage === 'en' && styles.activeLanguage]}>
          EN
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },
  languageText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
  },
  activeLanguage: {
    color: colors.navy,
    fontWeight: typography.fontWeight.bold,
  },
  separator: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
});

