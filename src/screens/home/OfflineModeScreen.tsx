import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface OfflineModeScreenProps {
  navigation: any;
}

export const OfflineModeScreen: React.FC<OfflineModeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  
  const sections = [
    { id: '1', titleKey: 'home.offlineMode.reminders', icon: 'notifications' as const, screen: 'Reminders' },
    { id: '2', titleKey: 'home.offlineMode.vaccinations', icon: 'medical' as const, screen: 'Vaccinations' },
    { id: '3', titleKey: 'home.offlineMode.medicalRecords', icon: 'clipboard' as const, screen: 'HealthRecord' },
    { id: '4', titleKey: 'home.offlineMode.vetContacts', icon: 'call' as const, screen: 'Emergency' },
  ];

  const handleSectionPress = (screen: string) => {
    // Navigate to the appropriate screen
    // Since we're in HomeStack, we need to navigate to other stacks via the parent navigator
    if (screen === 'Emergency') {
      navigation.navigate('SearchTab', { screen: 'Emergency' });
    } else if (screen === 'Vaccinations' || screen === 'HealthRecord') {
      navigation.navigate('ProfileTab', { screen: screen });
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color={colors.navy} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{t('home.offlineMode.title')}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          {t('home.offlineMode.description')}
        </Text>

        <View style={styles.sectionsContainer}>
          {sections.map((section) => (
            <TouchableOpacity 
              key={section.id} 
              style={styles.sectionCard}
              onPress={() => handleSectionPress(section.screen)}
            >
              <Ionicons name={section.icon} size={30} color={colors.navy} style={styles.sectionIcon} />
              <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
              <View style={styles.arrow}>
                <Ionicons name="chevron-forward" size={24} color={colors.teal} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoTitleContainer}>
            <Ionicons name="information-circle" size={20} color={colors.navy} />
            <Text style={styles.infoTitle}>{t('home.offlineMode.infoTitle')}</Text>
          </View>
          <Text style={styles.infoText}>
            {t('home.offlineMode.infoText')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  sectionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
  },
  sectionIcon: {
    marginRight: spacing.md,
  },
  sectionTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.navy,
  },
  infoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
  },
});

