import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform, TextInput, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getVetSchedule, updateVetSchedule, updateUserProfile, VetSchedule, DaySchedule } from '../../services/firestoreService';

interface VetScheduleScreenProps {
  navigation: any;
}

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type TimeType = 'start' | 'end';

export const VetScheduleScreen: React.FC<VetScheduleScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  
  const [schedule, setSchedule] = useState<Record<DayKey, DaySchedule>>({
    monday: { enabled: true, start: '09:00', end: '18:00' },
    tuesday: { enabled: true, start: '09:00', end: '18:00' },
    wednesday: { enabled: true, start: '09:00', end: '18:00' },
    thursday: { enabled: true, start: '09:00', end: '18:00' },
    friday: { enabled: true, start: '09:00', end: '18:00' },
    saturday: { enabled: true, start: '09:00', end: '12:00' },
    sunday: { enabled: false, start: '09:00', end: '18:00' },
  });

  const [onCallDates, setOnCallDates] = useState<string[]>([]);
  const [acceptNewPatients, setAcceptNewPatients] = useState(true);
  const [appointmentDuration, setAppointmentDuration] = useState(30);
  const [consultationRate, setConsultationRate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayKey | null>(null);
  const [selectedTimeType, setSelectedTimeType] = useState<TimeType | null>(null);
  const [tempTime, setTempTime] = useState(new Date());

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendarDatePicker, setShowCalendarDatePicker] = useState(false);

  const dayNames: Record<DayKey, string> = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    loadSchedule();
  }, [user]);

  const loadSchedule = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      console.log('📅 Chargement des horaires pour le vétérinaire:', user.id);
      const vetSchedule = await getVetSchedule(user.id);
      
      if (vetSchedule) {
        setSchedule({
          monday: vetSchedule.monday,
          tuesday: vetSchedule.tuesday,
          wednesday: vetSchedule.wednesday,
          thursday: vetSchedule.thursday,
          friday: vetSchedule.friday,
          saturday: vetSchedule.saturday,
          sunday: vetSchedule.sunday,
        });
        setOnCallDates(vetSchedule.onCallDates || []);
        setAcceptNewPatients(vetSchedule.acceptNewPatients !== false);
        setAppointmentDuration(vetSchedule.appointmentDuration || 30);
        setConsultationRate(vetSchedule.consultationRate || user.consultationRate || '');
        console.log('✅ Horaires chargés avec succès');
        console.log('📞 Dates d\'astreinte:', vetSchedule.onCallDates?.length || 0);
      }
    } catch (error) {
      console.error('❌ Erreur chargement horaires:', error);
      Alert.alert('Erreur', 'Impossible de charger les horaires');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (day: DayKey) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const openTimePicker = (day: DayKey, timeType: TimeType) => {
    const timeString = schedule[day][timeType];
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    setTempTime(date);
    setSelectedDay(day);
    setSelectedTimeType(timeType);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }

    if (selectedDate && selectedDay && selectedTimeType) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      setSchedule(prev => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          [selectedTimeType]: timeString
        }
      }));

      if (Platform.OS === 'ios') {
        setTempTime(selectedDate);
      }
    }
  };

  // Pour le web: gestion directe du changement d'heure via input
  const handleWebTimeChange = (day: DayKey, timeType: TimeType, value: string) => {
    if (value && value.match(/^\d{2}:\d{2}$/)) {
      setSchedule(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [timeType]: value
        }
      }));
    }
  };

  const closeTimePicker = () => {
    setShowTimePicker(false);
    setSelectedDay(null);
    setSelectedTimeType(null);
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toggleOnCallDate = (dateKey: string) => {
    setOnCallDates(prev => {
      if (prev.includes(dateKey)) {
        console.log('🗑️ Retrait astreinte:', dateKey);
        return prev.filter(d => d !== dateKey);
      } else {
        console.log('➕ Ajout astreinte:', dateKey);
        return [...prev, dateKey].sort();
      }
    });
  };

  const isDateInPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before the first day of the month
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = formatDateKey(date);
      const isSelected = onCallDates.includes(dateKey);
      const isPast = isDateInPast(date);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isSelected && styles.calendarDaySelected,
            isPast && styles.calendarDayPast,
          ]}
          onPress={() => !isPast && toggleOnCallDate(dateKey)}
          disabled={isPast}
        >
          <Text style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected,
            isPast && styles.calendarDayTextPast,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSaveSchedule = async () => {
    if (!user?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    setIsSaving(true);
    try {
      console.log('💾 Sauvegarde des horaires...');
      console.log('📞 Dates d\'astreinte à sauvegarder:', onCallDates.length);
      
      // Sauvegarder les horaires
      await updateVetSchedule(user.id, {
        monday: schedule.monday,
        tuesday: schedule.tuesday,
        wednesday: schedule.wednesday,
        thursday: schedule.thursday,
        friday: schedule.friday,
        saturday: schedule.saturday,
        sunday: schedule.sunday,
        onCallDates,
        acceptNewPatients,
        appointmentDuration,
        consultationRate,
      });

      // Mettre à jour le prix de consultation dans le profil utilisateur
      if (consultationRate) {
        await updateUserProfile(user.id, { consultationRate });
        // Rafraîchir le contexte utilisateur pour afficher le nouveau prix partout
        await refreshUser();
      }

      console.log('✅ Horaires sauvegardés avec succès');
      
      // Créer un résumé détaillé des horaires
      const openDays = (Object.keys(schedule) as DayKey[])
        .filter(day => schedule[day].enabled)
        .map(day => dayNames[day]);
      
      const closedDays = (Object.keys(schedule) as DayKey[])
        .filter(day => !schedule[day].enabled)
        .map(day => dayNames[day]);
      
      let summary = '✅ HORAIRES ENREGISTRÉS\n\n';
      
      // Jours ouverts
      if (openDays.length > 0) {
        summary += '📅 Jours d\'ouverture:\n';
        (Object.keys(schedule) as DayKey[]).forEach(day => {
          if (schedule[day].enabled) {
            summary += `   • ${dayNames[day]}: ${schedule[day].start} - ${schedule[day].end}\n`;
          }
        });
        summary += '\n';
      }
      
      // Jours fermés
      if (closedDays.length > 0) {
        summary += `🚫 Fermé: ${closedDays.join(', ')}\n\n`;
      }
      
      // Astreintes
      summary += `🌙 Astreintes: ${onCallDates.length} nuit(s)\n\n`;
      
      // Durée consultations
      summary += `⏱️ Durée consultations: ${appointmentDuration === 60 ? '1 heure' : `${appointmentDuration} min`}\n\n`;
      
      // Nouveaux patients
      summary += `${acceptNewPatients ? '✅' : '❌'} Nouveaux patients: ${acceptNewPatients ? 'Acceptés' : 'Refusés'}\n\n`;
      
      // Prix consultation
      if (consultationRate) {
        summary += `💰 Prix consultation: ${consultationRate}€`;
      }
      
      // Mettre à jour l'heure de dernière sauvegarde
      const now = new Date();
      setLastSaved(now);
      setShowSuccessBanner(true);
      
      // Masquer la bannière après 3 secondes
      setTimeout(() => {
        setShowSuccessBanner(false);
      }, 3000);
      
      Alert.alert(
        '✅ Sauvegarde réussie',
        summary,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Erreur sauvegarde horaires:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la sauvegarde des horaires. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDurationChange = (duration: number) => {
    setAppointmentDuration(duration);
  };

  const formatLastSaved = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins === 1) return 'Il y a 1 minute';
    if (diffMins < 60) return `Il y a ${diffMins} minutes`;
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `Aujourd'hui à ${hours}:${minutes}`;
  };

  const clearAllOnCallDates = () => {
    Alert.alert(
      'Supprimer toutes les astreintes',
      'Êtes-vous sûr de vouloir supprimer toutes les dates d\'astreinte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setOnCallDates([]);
            console.log('🗑️ Toutes les astreintes supprimées');
          }
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Chargement des horaires...</Text>
      </View>
    );
  }

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

        <Text style={styles.headerTitle}>Horaires & Astreintes</Text>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSchedule}
          disabled={isSaving}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={28} 
            color={isSaving ? colors.gray : colors.teal} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Banner */}
        {showSuccessBanner && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={24} color={colors.white} />
            <Text style={styles.successBannerText}>
              Horaires enregistrés avec succès !
            </Text>
          </View>
        )}

        {/* Last Saved Indicator */}
        {lastSaved && !showSuccessBanner && (
          <View style={styles.lastSavedIndicator}>
            <Ionicons name="cloud-done" size={16} color={colors.teal} />
            <Text style={styles.lastSavedText}>
              Dernière sauvegarde : {formatLastSaved(lastSaved)}
            </Text>
          </View>
        )}

        {/* On-Call Calendar Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="moon" size={24} color="#FFB347" />
              <Text style={styles.sectionTitle}>Astreintes de nuit</Text>
            </View>
            {onCallDates.length > 0 && (
              <TouchableOpacity onPress={clearAllOnCallDates}>
                <Text style={styles.clearAllText}>Tout supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.onCallInfo}>
            <Ionicons name="information-circle" size={20} color={colors.teal} />
            <Text style={styles.onCallInfoText}>
              Sélectionnez les nuits durant lesquelles vous êtes disponible pour les urgences
            </Text>
          </View>

          <View style={styles.calendarCard}>
            {/* Calendar Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={previousMonth} style={styles.calendarNavButton}>
                <Ionicons name="chevron-back" size={24} color={colors.navy} />
              </TouchableOpacity>
              
              <Text style={styles.calendarMonth}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              
              <TouchableOpacity onPress={nextMonth} style={styles.calendarNavButton}>
                <Ionicons name="chevron-forward" size={24} color={colors.navy} />
              </TouchableOpacity>
            </View>

            {/* Day names */}
            <View style={styles.calendarWeekDays}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                <View key={index} style={styles.calendarWeekDay}>
                  <Text style={styles.calendarWeekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>

            {/* Selected count */}
            <View style={styles.calendarFooter}>
              <Ionicons name="moon" size={18} color="#FFB347" />
              <Text style={styles.calendarFooterText}>
                {onCallDates.length} nuit{onCallDates.length !== 1 ? 's' : ''} d'astreinte sélectionnée{onCallDates.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres généraux</Text>

          <View style={styles.settingCard}>
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

        {/* Consultation Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarification</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="cash" size={24} color="#FFB347" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Prix de consultation</Text>
                  <Text style={styles.settingDescription}>
                    Tarif affiché pour vos consultations
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.priceInputContainer}>
              <TextInput
                style={styles.priceInput}
                value={consultationRate}
                onChangeText={setConsultationRate}
                placeholder="Ex: 50"
                keyboardType="numeric"
                placeholderTextColor={colors.gray}
              />
              <Text style={styles.priceUnit}>€</Text>
            </View>
          </View>
        </View>

        {/* Weekly Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horaires hebdomadaires</Text>

          {(Object.keys(schedule) as DayKey[]).map((day) => {
            const info = schedule[day];
            return (
            <View key={day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <Text style={[styles.dayName, !info.enabled && styles.dayNameDisabled]}>
                      {dayNames[day]}
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
                    onValueChange={() => toggleDay(day)}
                  trackColor={{ false: colors.gray, true: colors.teal }}
                  thumbColor={colors.white}
                />
              </View>

              {info.enabled && (
                <View style={styles.timeControls}>
                  {Platform.OS === 'web' ? (
                    <>
                      <View style={styles.timeInputContainer}>
                        <Ionicons name="time-outline" size={20} color={colors.teal} />
                        <Text style={styles.timeLabel}>Début:</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={info.start}
                          onChangeText={(value) => handleWebTimeChange(day, 'start', value)}
                          placeholder="09:00"
                          // @ts-ignore - type prop is web-only
                          type="time"
                        />
                      </View>

                      <View style={styles.timeInputContainer}>
                        <Ionicons name="time-outline" size={20} color={colors.teal} />
                        <Text style={styles.timeLabel}>Fin:</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={info.end}
                          onChangeText={(value) => handleWebTimeChange(day, 'end', value)}
                          placeholder="18:00"
                          // @ts-ignore - type prop is web-only
                          type="time"
                        />
                      </View>
                    </>
                  ) : (
                    <>
                  <TouchableOpacity 
                    style={styles.timeButton}
                        onPress={() => openTimePicker(day, 'start')}
                  >
                    <Ionicons name="time-outline" size={20} color={colors.teal} />
                    <Text style={styles.timeButtonText}>Début: {info.start}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.timeButton}
                        onPress={() => openTimePicker(day, 'end')}
                  >
                    <Ionicons name="time-outline" size={20} color={colors.teal} />
                    <Text style={styles.timeButtonText}>Fin: {info.end}</Text>
                  </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </View>
            );
          })}
        </View>

        {/* Appointment Duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durée des consultations</Text>

          <View style={styles.durationCard}>
            {[15, 30, 45, 60].map((duration) => (
              <React.Fragment key={duration}>
                <TouchableOpacity 
                  style={styles.durationOption}
                  onPress={() => handleDurationChange(duration)}
                >
              <Ionicons name="time" size={24} color={colors.teal} />
                  <Text style={styles.durationText}>
                    {duration === 60 ? '1 heure' : `${duration} minutes`}
                  </Text>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color={appointmentDuration === duration ? colors.teal : colors.gray} 
                  />
            </TouchableOpacity>
                {duration !== 60 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
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

        <TouchableOpacity 
          style={[styles.saveButtonLarge, isSaving && styles.saveButtonLargeDisabled]} 
          onPress={handleSaveSchedule}
          disabled={isSaving}
        >
          <Ionicons name="save" size={24} color={colors.white} />
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder les modifications'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <>
          {Platform.OS === 'ios' && (
            <View style={styles.timePickerModal}>
              <View style={styles.timePickerHeader}>
                <Text style={styles.timePickerTitle}>
                  {selectedDay && selectedTimeType && (
                    `${dayNames[selectedDay]} - ${selectedTimeType === 'start' ? 'Heure de début' : 'Heure de fin'}`
                  )}
                </Text>
                <TouchableOpacity onPress={closeTimePicker}>
                  <Text style={styles.timePickerDone}>Terminé</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempTime}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleTimeChange}
                locale="fr-FR"
              />
            </View>
          )}
          
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={tempTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  successBannerText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  lastSavedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  lastSavedText: {
    fontSize: typography.fontSize.sm,
    color: colors.teal,
    fontWeight: typography.fontWeight.medium,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clearAllText: {
    fontSize: typography.fontSize.sm,
    color: '#FF6B6B',
    fontWeight: typography.fontWeight.semiBold,
  },
  onCallInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.lightBlue,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  onCallInfoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 18,
  },
  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  calendarNavButton: {
    padding: spacing.xs,
  },
  calendarMonth: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  calendarWeekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  calendarWeekDayText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
  },
  calendarDaySelected: {
    backgroundColor: '#FFB347',
    borderRadius: borderRadius.md,
  },
  calendarDayPast: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    fontWeight: typography.fontWeight.medium,
  },
  calendarDayTextSelected: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  calendarDayTextPast: {
    color: colors.gray,
  },
  calendarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  calendarFooterText: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
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
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    borderWidth: 2,
    borderColor: colors.teal,
  },
  priceUnit: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
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
  timeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  timeLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  timeInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
    padding: spacing.xs,
    textAlign: 'center',
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
  saveButtonLargeDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  timePickerModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  timePickerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  timePickerDone: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
});
