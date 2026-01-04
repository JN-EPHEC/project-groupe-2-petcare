import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getRemindersByOwnerId } from '../../services/firestoreService';

interface CalendarScreenProps {
  navigation: any;
}

interface DateInfo {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  hasReminders: boolean;
  reminders: any[];
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentPet, user } = useAuth();
  
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState<DateInfo | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderType, setNewReminderType] = useState<'vaccine' | 'vermifuge' | 'checkup' | 'medication'>('vaccine');
  const [allReminders, setAllReminders] = useState<any[]>([]);

  useEffect(() => {
    const loadReminders = async () => {
      if (user?.id) {
        try {
          const reminders = await getRemindersByOwnerId(user.id);
          setAllReminders(reminders);
        } catch (error) {
          console.error('Error loading reminders:', error);
          setAllReminders([]);
        }
      }
    };
    loadReminders();
  }, [user?.id]);

  // Get month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Month names (translated)
  const monthNames = [
    t('common.months.january'),
    t('common.months.february'),
    t('common.months.march'),
    t('common.months.april'),
    t('common.months.may'),
    t('common.months.june'),
    t('common.months.july'),
    t('common.months.august'),
    t('common.months.september'),
    t('common.months.october'),
    t('common.months.november'),
    t('common.months.december'),
  ];

  const dayNames = [
    t('common.days.monday'),
    t('common.days.tuesday'),
    t('common.days.wednesday'),
    t('common.days.thursday'),
    t('common.days.friday'),
    t('common.days.saturday'),
    t('common.days.sunday'),
  ];

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust so Monday is 0

  // Get number of days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Generate calendar dates
  const calendarDates: DateInfo[] = [];

  // Previous month days
  for (let i = adjustedFirstDay - 1; i >= 0; i--) {
    const date = daysInPrevMonth - i;
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const dateReminders = allReminders.filter(r => r.date === dateStr);
    
    calendarDates.push({
      date,
      month: currentMonth - 1,
      year: currentYear,
      isCurrentMonth: false,
      hasReminders: dateReminders.length > 0,
      reminders: dateReminders,
    });
  }

  // Current month days
  for (let date = 1; date <= daysInMonth; date++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const dateReminders = allReminders.filter(r => r.date === dateStr);
    
    calendarDates.push({
      date,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
      hasReminders: dateReminders.length > 0,
      reminders: dateReminders,
    });
  }

  // Next month days
  const remainingDays = 42 - calendarDates.length; // 6 rows * 7 days
  for (let date = 1; date <= remainingDays; date++) {
    const dateStr = `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const dateReminders = allReminders.filter(r => r.date === dateStr);
    
    calendarDates.push({
      date,
      month: currentMonth + 1,
      year: currentYear,
      isCurrentMonth: false,
      hasReminders: dateReminders.length > 0,
      reminders: dateReminders,
    });
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  // Get week dates
  const getWeekDates = () => {
    const week: DateInfo[] = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dateReminders = allReminders.filter(r => r.date === dateStr);

      week.push({
        date: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isCurrentMonth: true,
        hasReminders: dateReminders.length > 0,
        reminders: dateReminders,
      });
    }

    return week;
  };

  const isToday = (dateInfo: DateInfo) => {
    return (
      dateInfo.date === today.getDate() &&
      dateInfo.month === today.getMonth() &&
      dateInfo.year === today.getFullYear() &&
      dateInfo.isCurrentMonth
    );
  };

  const isSelected = (dateInfo: DateInfo) => {
    return selectedDate && 
      selectedDate.date === dateInfo.date &&
      selectedDate.month === dateInfo.month &&
      selectedDate.year === dateInfo.year;
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'vaccine':
        return { name: 'medical', color: '#4ECDC4' };
      case 'vermifuge':
        return { name: 'water', color: '#FF6B6B' };
      case 'checkup':
        return { name: 'clipboard', color: '#9B59B6' };
      case 'medication':
        return { name: 'medical-outline', color: '#E67E22' };
      default:
        return { name: 'notifications', color: colors.teal };
    }
  };

  const handleAddReminder = () => {
    if (!newReminderTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un titre pour le rappel');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date');
      return;
    }

    // Format date as YYYY-MM-DD
    const dateStr = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.date).padStart(2, '0')}`;
    
    // In production, this would save to database
    console.log('New reminder:', {
      title: newReminderTitle,
      type: newReminderType,
      date: dateStr,
      petId: currentPet?.id,
    });

    Alert.alert(
      'Rappel ajouté !',
      `"${newReminderTitle}" a été ajouté pour le ${selectedDate.date} ${monthNames[selectedDate.month]}`,
      [{ text: 'OK', onPress: () => {
        setShowAddModal(false);
        setNewReminderTitle('');
        setNewReminderType('vaccine');
      }}]
    );
  };

  const handleSyncCalendar = () => {
    Alert.alert(
      'Synchronisation Calendrier',
      'Cette fonctionnalité synchronisera vos rappels PetCare avec le calendrier de votre téléphone.\n\n' +
      'Les rappels apparaîtront dans votre calendrier système avec des notifications.\n\n' +
      '📱 Permissions requises :\n• Accès au calendrier\n• Notifications',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Activer',
          onPress: () => {
            // In production, this would:
            // 1. Request calendar permissions (expo-calendar)
            // 2. Create calendar events for each reminder
            // 3. Setup notifications
            console.log('Calendar sync requested');
            Alert.alert(
              'Synchronisation activée',
              'Les rappels seront synchronisés avec votre calendrier système.\n\n' +
              '(Fonctionnalité de démonstration - nécessite expo-calendar en production)'
            );
          }
        }
      ]
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

        <Text style={styles.headerTitle}>Calendrier</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'month' ? 'week' : 'month')}
          >
            <Ionicons 
              name={viewMode === 'month' ? 'calendar' : 'list'} 
              size={22} 
              color={colors.navy} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add-circle" size={28} color={colors.teal} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month/Week Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            onPress={viewMode === 'month' ? previousMonth : previousWeek} 
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={28} color={colors.navy} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.monthTitle}>
              {viewMode === 'month' 
                ? `${monthNames[currentMonth]} ${currentYear}`
                : `Semaine du ${currentDate.getDate()} ${monthNames[currentMonth]}`
              }
            </Text>
            <Text style={styles.viewModeText}>
              {viewMode === 'month' ? 'Vue mensuelle' : 'Vue hebdomadaire'}
            </Text>
          </View>

          <TouchableOpacity 
            onPress={viewMode === 'month' ? nextMonth : nextWeek} 
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={28} color={colors.navy} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        {viewMode === 'month' ? (
          <View style={styles.calendarContainer}>
            {/* Day Names */}
            <View style={styles.dayNamesRow}>
              {dayNames.map((day, index) => (
                <View key={index} style={styles.dayNameCell}>
                  <Text style={styles.dayNameText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDates.map((dateInfo, index) => {
                const todayCheck = isToday(dateInfo);
                const selected = isSelected(dateInfo);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateCell,
                      !dateInfo.isCurrentMonth && styles.dateCellInactive,
                      todayCheck && styles.dateCellToday,
                      selected && styles.dateCellSelected,
                    ]}
                    onPress={() => setSelectedDate(dateInfo)}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        !dateInfo.isCurrentMonth && styles.dateTextInactive,
                        todayCheck && styles.dateTextToday,
                        selected && styles.dateTextSelected,
                      ]}
                    >
                      {dateInfo.date}
                    </Text>
                    {dateInfo.hasReminders && (
                      <View style={styles.reminderDot} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.weekContainer}>
            {getWeekDates().map((dateInfo, index) => {
              const todayCheck = isToday(dateInfo);
              const selected = isSelected(dateInfo);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.weekDayCard,
                    todayCheck && styles.weekDayCardToday,
                    selected && styles.weekDayCardSelected,
                  ]}
                  onPress={() => setSelectedDate(dateInfo)}
                >
                  <Text style={styles.weekDayName}>{dayNames[index]}</Text>
                  <Text style={[
                    styles.weekDayNumber,
                    todayCheck && styles.weekDayNumberToday,
                    selected && styles.weekDayNumberSelected,
                  ]}>
                    {dateInfo.date}
                  </Text>
                  {dateInfo.hasReminders && (
                    <View style={styles.weekReminderBadge}>
                      <Text style={styles.weekReminderCount}>{dateInfo.reminders.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Selected Date Details */}
        {selectedDate && selectedDate.reminders.length > 0 && (
          <View style={styles.selectedDateSection}>
            <Text style={styles.selectedDateTitle}>
              {selectedDate.date} {monthNames[selectedDate.month]} {selectedDate.year}
            </Text>

            <View style={styles.remindersListContainer}>
              {selectedDate.reminders.map((reminder) => {
                const icon = getReminderIcon(reminder.type);
                
                return (
                  <View key={reminder.id} style={styles.reminderItem}>
                    <View style={[styles.reminderIconContainer, { backgroundColor: icon.color + '20' }]}>
                      <Ionicons name={icon.name as any} size={24} color={icon.color} />
                    </View>
                    
                    <View style={styles.reminderContent}>
                      <Text style={styles.reminderTitle}>{reminder.title}</Text>
                      <View style={styles.reminderStatus}>
                        <Ionicons 
                          name={reminder.status === 'past' ? 'checkmark-circle' : 'time'} 
                          size={16} 
                          color={reminder.status === 'past' ? colors.gray : colors.teal} 
                        />
                        <Text style={styles.reminderStatusText}>
                          {reminder.status === 'past' ? 'Terminé' : 'À venir'}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.reminderBadge, { backgroundColor: icon.color }]}>
                      <Ionicons 
                        name={reminder.status === 'past' ? 'checkmark' : 'alarm'} 
                        size={16} 
                        color={colors.white} 
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {selectedDate && selectedDate.reminders.length === 0 && (
          <View style={styles.noRemindersContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.gray} />
            <Text style={styles.noRemindersText}>Aucun rappel pour cette date</Text>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Légende :</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.teal }]} />
              <Text style={styles.legendText}>Aujourd'hui</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Rappels</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingButton} onPress={handleSyncCalendar}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="sync" size={24} color={colors.teal} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Synchroniser avec le calendrier</Text>
              <Text style={styles.settingDescription}>
                Ajouter les rappels à votre calendrier système
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton} onPress={() => {
            Alert.alert(
              'Notifications',
              'Les notifications vous alerteront avant chaque rappel.\n\n' +
              '🔔 Vous recevrez une notification :\n• 1 jour avant\n• Le jour même',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Activer',
                  onPress: () => {
                    Alert.alert('Notifications activées', 'Vous recevrez des rappels pour vos événements.');
                  }
                }
              ]
            );
          }}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="notifications" size={24} color={colors.teal} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Activer les notifications</Text>
              <Text style={styles.settingDescription}>
                Recevoir des alertes pour les rappels
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un rappel</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color={colors.navy} />
              </TouchableOpacity>
            </View>

            {selectedDate && (
              <Text style={styles.modalDate}>
                {selectedDate.date} {monthNames[selectedDate.month]} {selectedDate.year}
              </Text>
            )}

            <View style={styles.modalForm}>
              <Text style={styles.inputLabel}>Titre du rappel</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Vaccin antirabique"
                placeholderTextColor={colors.gray}
                value={newReminderTitle}
                onChangeText={setNewReminderTitle}
              />

              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.typeButtons}>
                {(['vaccine', 'vermifuge', 'checkup', 'medication'] as const).map((type) => {
                  const icon = getReminderIcon(type);
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newReminderType === type && { backgroundColor: icon.color + '30', borderColor: icon.color }
                      ]}
                      onPress={() => setNewReminderType(type)}
                    >
                      <Ionicons name={icon.name as any} size={24} color={icon.color} />
                      <Text style={styles.typeButtonText}>
                        {type === 'vaccine' && 'Vaccin'}
                        {type === 'vermifuge' && 'Vermifuge'}
                        {type === 'checkup' && 'Contrôle'}
                        {type === 'medication' && 'Médicament'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddReminder}
              >
                <Text style={styles.saveButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRight: {
    width: 40,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  viewToggle: {
    padding: spacing.xs,
  },
  addButton: {
    padding: spacing.xs,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  monthTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  viewModeText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  calendarContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dayNameText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%', // 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
    position: 'relative',
  },
  dateCellInactive: {
    opacity: 0.3,
  },
  dateCellToday: {
    backgroundColor: colors.teal,
    borderRadius: borderRadius.md,
  },
  dateCellSelected: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.md,
  },
  dateText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.black,
  },
  dateTextInactive: {
    color: colors.gray,
  },
  dateTextToday: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  dateTextSelected: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  reminderDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.teal,
  },
  // Week View styles
  weekContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  weekDayCard: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    position: 'relative',
  },
  weekDayCardToday: {
    backgroundColor: colors.teal,
  },
  weekDayCardSelected: {
    backgroundColor: colors.navy,
  },
  weekDayName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  weekDayNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  weekDayNumberToday: {
    color: colors.white,
  },
  weekDayNumberSelected: {
    color: colors.white,
  },
  weekReminderBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.teal,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekReminderCount: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  selectedDateSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  selectedDateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  remindersListContainer: {
    gap: spacing.md,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  reminderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reminderStatusText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  reminderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRemindersContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  noRemindersText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.lg,
  },
  legendContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
  },
  legendTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  legendItems: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.teal,
  },
  legendText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
  },
  settingsContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: spacing.md,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
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
  bottomSpacer: {
    height: spacing.xxl,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  modalDate: {
    fontSize: typography.fontSize.md,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalForm: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.black,
    marginBottom: spacing.lg,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    flex: 1,
    minWidth: '45%',
  },
  typeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.lightBlue,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  saveButton: {
    backgroundColor: colors.teal,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

