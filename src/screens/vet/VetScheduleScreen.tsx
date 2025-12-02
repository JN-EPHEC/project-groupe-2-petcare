import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface VetScheduleScreenProps {
  navigation: any;
}

export const VetScheduleScreen: React.FC<VetScheduleScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  
  const [schedule, setSchedule] = useState({
    monday: { enabled: true, start: '09:00', end: '18:00' },
    tuesday: { enabled: true, start: '09:00', end: '18:00' },
    wednesday: { enabled: true, start: '09:00', end: '18:00' },
    thursday: { enabled: true, start: '09:00', end: '18:00' },
    friday: { enabled: true, start: '09:00', end: '18:00' },
    saturday: { enabled: true, start: '09:00', end: '12:00' },
    sunday: { enabled: false, start: '09:00', end: '18:00' },
  });

  const [emergencyAvailable, setEmergencyAvailable] = useState(true);
  const [acceptNewPatients, setAcceptNewPatients] = useState(true);

  const dayNames: Record<string, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  };

  const toggleDay = (day: keyof typeof schedule) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const handleSaveSchedule = () => {
    Alert.alert(
      'Horaires sauvegardés',
      'Vos horaires de disponibilité ont été mis à jour avec succès.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Mes Disponibilités</Text>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSchedule}
        >
          <Ionicons name="checkmark-circle" size={28} color={colors.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres généraux</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Urgences disponibles</Text>
                  <Text style={styles.settingDescription}>
                    Accepter les urgences en dehors des heures d'ouverture
                  </Text>
                </View>
              </View>
              <Switch
                value={emergencyAvailable}
                onValueChange={setEmergencyAvailable}
                trackColor={{ false: colors.gray, true: colors.teal }}
                thumbColor={colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="add-circle" size={24} color="#4ECDC4" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Accepter nouveaux patients</Text>
                  <Text style={styles.settingDescription}>
                    Autoriser les nouveaux propriétaires à prendre RDV
                  </Text>
                </View>
              </View>
              <Switch
                value={acceptNewPatients}
                onValueChange={setAcceptNewPatients}
                trackColor={{ false: colors.gray, true: colors.teal }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        {/* Weekly Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horaires hebdomadaires</Text>

          {Object.entries(schedule).map(([day, info]) => (
            <View key={day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayName, !info.enabled && styles.dayNameDisabled]}>
                    {dayNames[day as keyof typeof schedule]}
                  </Text>
                  {info.enabled && (
                    <Text style={styles.dayHours}>
                      {info.start} - {info.end}
                    </Text>
                  )}
                  {!info.enabled && (
                    <Text style={styles.dayHoursDisabled}>Fermé</Text>
                  )}
                </View>
                <Switch
                  value={info.enabled}
                  onValueChange={() => toggleDay(day as keyof typeof schedule)}
                  trackColor={{ false: colors.gray, true: colors.teal }}
                  thumbColor={colors.white}
                />
              </View>

              {info.enabled && (
                <View style={styles.timeControls}>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => {
                      Alert.alert('Heure de début', `Modifier l'heure de début pour ${dayNames[day as keyof typeof schedule]}`);
                    }}
                  >
                    <Ionicons name="time-outline" size={20} color={colors.teal} />
                    <Text style={styles.timeButtonText}>Début: {info.start}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => {
                      Alert.alert('Heure de fin', `Modifier l'heure de fin pour ${dayNames[day as keyof typeof schedule]}`);
                    }}
                  >
                    <Ionicons name="time-outline" size={20} color={colors.teal} />
                    <Text style={styles.timeButtonText}>Fin: {info.end}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Appointment Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durée des consultations</Text>

          <View style={styles.durationCard}>
            <TouchableOpacity style={styles.durationOption}>
              <Ionicons name="time" size={24} color={colors.teal} />
              <Text style={styles.durationText}>15 minutes</Text>
              <Ionicons name="checkmark-circle" size={24} color={colors.gray} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.durationOption}>
              <Ionicons name="time" size={24} color={colors.teal} />
              <Text style={styles.durationText}>30 minutes</Text>
              <Ionicons name="checkmark-circle" size={24} color={colors.teal} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.durationOption}>
              <Ionicons name="time" size={24} color={colors.teal} />
              <Text style={styles.durationText}>45 minutes</Text>
              <Ionicons name="checkmark-circle" size={24} color={colors.gray} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.durationOption}>
              <Ionicons name="time" size={24} color={colors.teal} />
              <Text style={styles.durationText}>1 heure</Text>
              <Ionicons name="checkmark-circle" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={colors.teal} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Modification des horaires</Text>
            <Text style={styles.infoText}>
              Les modifications prendront effet immédiatement. Les patients existants avec des RDV confirmés ne seront pas affectés.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButtonLarge} onPress={handleSaveSchedule}>
          <Ionicons name="save" size={24} color={colors.white} />
          <Text style={styles.saveButtonText}>Sauvegarder les modifications</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  saveButton: {
    padding: spacing.xs,
    width: 40,
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  settingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
  },
  dayCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  dayNameDisabled: {
    color: colors.gray,
  },
  dayHours: {
    fontSize: typography.fontSize.md,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  dayHoursDisabled: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    fontStyle: 'italic',
  },
  timeControls: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
  },
  timeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  durationCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  durationText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
  },
  saveButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

