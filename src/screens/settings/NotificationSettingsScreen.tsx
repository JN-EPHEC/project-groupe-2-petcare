import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  resetNotificationPreferences,
  requestNotificationPermissions,
  getAllScheduledNotifications,
  type NotificationPreferences,
} from '../../services/notificationService';

interface NotificationSettingsScreenProps {
  navigation: any;
}

export const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    loadPreferences();
    loadScheduledNotifications();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadScheduledNotifications = async () => {
    try {
      const notifications = await getAllScheduledNotifications();
      setScheduledCount(notifications.length);
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!preferences) return;

    // Si on désactive les notifications globales, demander confirmation
    if (key === 'enabled' && preferences.enabled) {
      if (Platform.OS === 'web') {
        if (!window.confirm('Êtes-vous sûr de vouloir désactiver toutes les notifications ?')) {
          return;
        }
      } else {
        Alert.alert(
          'Désactiver les notifications',
          'Êtes-vous sûr de vouloir désactiver toutes les notifications ? Vous ne recevrez plus d\'alertes.',
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Désactiver', 
              style: 'destructive',
              onPress: () => updatePreference(key)
            },
          ]
        );
        return;
      }
    }

    await updatePreference(key);
  };

  const updatePreference = async (key: keyof NotificationPreferences) => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      const newPreferences = {
        ...preferences,
        [key]: !preferences[key],
      };

      await saveNotificationPreferences(newPreferences, user?.id);
      setPreferences(newPreferences);

      // Si on active les notifications et qu'elles ne sont pas encore autorisées
      if (key === 'enabled' && !preferences.enabled) {
        await requestNotificationPermissions();
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur lors de la sauvegarde des préférences');
      } else {
        Alert.alert('Erreur', 'Impossible de sauvegarder vos préférences');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Réinitialiser tous les paramètres de notifications aux valeurs par défaut ?')) {
        return;
      }
    } else {
      Alert.alert(
        'Réinitialiser les paramètres',
        'Êtes-vous sûr de vouloir réinitialiser tous les paramètres de notifications aux valeurs par défaut ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Réinitialiser', 
            style: 'destructive',
            onPress: performReset
          },
        ]
      );
      return;
    }

    await performReset();
  };

  const performReset = async () => {
    try {
      setIsSaving(true);
      await resetNotificationPreferences(user?.id);
      await loadPreferences();
      
      if (Platform.OS === 'web') {
        window.alert('Paramètres réinitialisés avec succès');
      } else {
        Alert.alert('Succès', 'Les paramètres ont été réinitialisés');
      }
    } catch (error) {
      console.error('Error resetting preferences:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur lors de la réinitialisation');
      } else {
        Alert.alert('Erreur', 'Impossible de réinitialiser les paramètres');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !preferences) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Main Toggle */}
        <View style={styles.mainSection}>
          <View style={styles.mainIconContainer}>
            <Ionicons 
              name={preferences.enabled ? "notifications" : "notifications-off"} 
              size={32} 
              color={preferences.enabled ? colors.teal : colors.gray} 
            />
          </View>
          <View style={styles.mainInfo}>
            <Text style={styles.mainTitle}>Notifications</Text>
            <Text style={styles.mainSubtitle}>
              {preferences.enabled 
                ? `Activées • ${scheduledCount} notification(s) planifiée(s)`
                : 'Désactivées'
              }
            </Text>
          </View>
          <Switch
            value={preferences.enabled}
            onValueChange={() => handleToggle('enabled')}
            trackColor={{ false: colors.lightGray, true: colors.teal }}
            thumbColor={colors.white}
            disabled={isSaving}
          />
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types de notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="alarm" size={24} color={colors.teal} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Rappels</Text>
              <Text style={styles.settingDescription}>
                Vaccins, vermifuges, soins
              </Text>
            </View>
            <Switch
              value={preferences.reminders}
              onValueChange={() => handleToggle('reminders')}
              trackColor={{ false: colors.lightGray, true: colors.teal }}
              thumbColor={colors.white}
              disabled={!preferences.enabled || isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="calendar" size={24} color={colors.teal} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Rendez-vous</Text>
              <Text style={styles.settingDescription}>
                Confirmations et rappels de RDV
              </Text>
            </View>
            <Switch
              value={preferences.appointments}
              onValueChange={() => handleToggle('appointments')}
              trackColor={{ false: colors.lightGray, true: colors.teal }}
              thumbColor={colors.white}
              disabled={!preferences.enabled || isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="medkit" size={24} color={colors.teal} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Vaccinations</Text>
              <Text style={styles.settingDescription}>
                Rappels de vaccins à prévoir
              </Text>
            </View>
            <Switch
              value={preferences.vaccinations}
              onValueChange={() => handleToggle('vaccinations')}
              trackColor={{ false: colors.lightGray, true: colors.teal }}
              thumbColor={colors.white}
              disabled={!preferences.enabled || isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="heart" size={24} color={colors.teal} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Santé & Bien-être</Text>
              <Text style={styles.settingDescription}>
                Conseils et astuces santé
              </Text>
            </View>
            <Switch
              value={preferences.health}
              onValueChange={() => handleToggle('health')}
              trackColor={{ false: colors.lightGray, true: colors.teal }}
              thumbColor={colors.white}
              disabled={!preferences.enabled || isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="megaphone" size={24} color={colors.teal} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Promotions</Text>
              <Text style={styles.settingDescription}>
                Offres spéciales et nouveautés
              </Text>
            </View>
            <Switch
              value={preferences.marketing}
              onValueChange={() => handleToggle('marketing')}
              trackColor={{ false: colors.lightGray, true: colors.teal }}
              thumbColor={colors.white}
              disabled={!preferences.enabled || isSaving}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apparence</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="volume-high" size={24} color={colors.navy} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Son</Text>
              <Text style={styles.settingDescription}>
                Jouer un son lors de la réception
              </Text>
            </View>
            <Switch
              value={preferences.sound}
              onValueChange={() => handleToggle('sound')}
              trackColor={{ false: colors.lightGray, true: colors.teal }}
              thumbColor={colors.white}
              disabled={!preferences.enabled || isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="phone-portrait" size={24} color={colors.navy} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Vibration</Text>
              <Text style={styles.settingDescription}>
                Faire vibrer l'appareil
              </Text>
            </View>
            <Switch
              value={preferences.vibration}
              onValueChange={() => handleToggle('vibration')}
              trackColor={{ false: colors.lightGray, true: colors.teal }}
              thumbColor={colors.white}
              disabled={!preferences.enabled || isSaving}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="radio-button-on" size={24} color={colors.navy} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Badge</Text>
              <Text style={styles.settingDescription}>
                Afficher le nombre sur l'icône
              </Text>
            </View>
            <Switch
              value={preferences.badge}
              onValueChange={() => handleToggle('badge')}
              trackColor={{ false: colors.lightGray, true: colors.teal }}
              thumbColor={colors.white}
              disabled={!preferences.enabled || isSaving}
            />
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidentialité</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="lock-closed" size={24} color={colors.navy} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Afficher sur écran verrouillé</Text>
              <Text style={styles.settingDescription}>
                {preferences.lockScreen 
                  ? 'Toutes les données sont visibles'
                  : 'Données sensibles masquées'
                }
              </Text>
            </View>
            <Switch
              value={preferences.lockScreen}
              onValueChange={() => handleToggle('lockScreen')}
              trackColor={{ false: colors.lightGray, true: colors.teal }}
              thumbColor={colors.white}
              disabled={!preferences.enabled || isSaving}
            />
          </View>

          {!preferences.lockScreen && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={colors.teal} />
              <Text style={styles.infoText}>
                Pour protéger votre vie privée, les notifications sur écran verrouillé afficheront uniquement "PetCare+" sans détails.
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.viewScheduledButton}
            onPress={() => navigation.navigate('ScheduledNotifications')}
          >
            <Ionicons name="list" size={24} color={colors.white} />
            <Text style={styles.viewScheduledButtonText}>Voir mes notifications planifiées</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{scheduledCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            disabled={isSaving}
          >
            <Ionicons name="refresh" size={24} color={colors.navy} />
            <Text style={styles.resetButtonText}>Réinitialiser les paramètres</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  mainIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  mainInfo: {
    flex: 1,
  },
  mainTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  mainSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E0F7FA',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
  },
  viewScheduledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
    position: 'relative',
  },
  viewScheduledButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF5722',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  resetButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
});

