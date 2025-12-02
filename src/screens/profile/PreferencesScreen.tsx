import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components';

interface PreferencesScreenProps {
  navigation: any;
}

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [strictlyNecessary, setStrictlyNecessary] = useState(true);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleAcceptAll = () => {
    setPreferences(true);
    setAnalytics(true);
    setMarketing(true);
    navigation.goBack();
  };

  const handleRejectAll = () => {
    setPreferences(false);
    setAnalytics(false);
    setMarketing(false);
    navigation.goBack();
  };

  const handleSavePreferences = () => {
    navigation.goBack();
  };

  const ToggleButton: React.FC<{ value: boolean; onToggle: () => void; disabled?: boolean }> = ({ 
    value, 
    onToggle, 
    disabled = false 
  }) => (
    <TouchableOpacity 
      style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]} 
      onPress={disabled ? undefined : onToggle}
      disabled={disabled}
    >
      <View style={[styles.toggleCircle, value && styles.toggleCircleActive]} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.preferences.title')}</Text>
        </View>

        <Text style={styles.description}>
          {t('profile.preferences.description')}
        </Text>

        <View style={styles.section}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>{t('profile.preferences.strictlyNecessary')}</Text>
            <ToggleButton 
              value={strictlyNecessary} 
              onToggle={() => {}} 
              disabled={true}
            />
          </View>
          <Text style={styles.optionDescription}>
            {t('profile.preferences.strictlyNecessaryDesc')}
          </Text>
          <Text style={styles.optionStatus}>{t('profile.preferences.strictlyNecessaryStatus')}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>{t('profile.preferences.preferences')}</Text>
            <ToggleButton 
              value={preferences} 
              onToggle={() => setPreferences(!preferences)}
            />
          </View>
          <Text style={styles.optionDescription}>
            {t('profile.preferences.preferencesDesc')}
          </Text>
          <Text style={styles.optionStatus}>{preferences ? t('profile.preferences.on') : t('profile.preferences.off')}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>{t('profile.preferences.analytics')}</Text>
            <ToggleButton 
              value={analytics} 
              onToggle={() => setAnalytics(!analytics)}
            />
          </View>
          <Text style={styles.optionDescription}>
            {t('profile.preferences.analyticsDesc')}
          </Text>
          <Text style={styles.optionStatus}>{analytics ? t('profile.preferences.on') : t('profile.preferences.off')}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>{t('profile.preferences.marketing')}</Text>
            <ToggleButton 
              value={marketing} 
              onToggle={() => setMarketing(!marketing)}
            />
          </View>
          <Text style={styles.optionDescription}>
            {t('profile.preferences.marketingDesc')}
          </Text>
          <Text style={styles.optionStatus}>{marketing ? t('profile.preferences.on') : t('profile.preferences.off')}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={t('profile.preferences.acceptAllButton')}
            onPress={handleAcceptAll}
            variant="primary"
            style={styles.button}
          />

          <Button
            title={t('profile.preferences.rejectAllButton')}
            onPress={handleRejectAll}
            variant="primary"
            style={styles.button}
          />

          <Button
            title={t('profile.preferences.saveButton')}
            onPress={handleSavePreferences}
            variant="primary"
            style={styles.button}
          />
        </View>

        <Text style={styles.footer}>
          {t('profile.preferences.footer')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBlue,
  },
  content: {
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.xl,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  optionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  optionStatus: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  toggle: {
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOff: {
    backgroundColor: colors.gray,
    alignItems: 'flex-start',
  },
  toggleOn: {
    backgroundColor: colors.navy,
    alignItems: 'flex-end',
  },
  toggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
  },
  toggleCircleActive: {
    backgroundColor: colors.lightBlue,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  button: {
    width: '100%',
  },
  footer: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});

