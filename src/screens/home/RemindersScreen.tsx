import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getRemindersByOwnerId } from '../../services/firestoreService';

interface RemindersScreenProps {
  navigation: any;
}

interface ReminderWithMonth {
  month: string;
  year: string;
  reminders: any[];
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentPet, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter reminders by search query
  const reminders = searchQuery.trim()
    ? allReminders.filter(reminder => 
        reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.date.includes(searchQuery)
      )
    : allReminders;

  const pastReminders = reminders.filter(r => r.status === 'past');
  const upcomingReminders = reminders.filter(r => r.status === 'upcoming');

  // Fonction pour obtenir l'icône selon le type
  const getReminderIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('vaccin') || lowerTitle.includes('vaccine')) {
      return { name: 'needle', library: 'MaterialCommunityIcons', color: '#4ECDC4' };
    }
    if (lowerTitle.includes('vermifuge') || lowerTitle.includes('deworming')) {
      return { name: 'medical-bag', library: 'Ionicons', color: '#FF6B6B' };
    }
    return { name: 'notifications', library: 'Ionicons', color: colors.teal };
  };

  // Grouper les rappels par mois
  const groupByMonth = (remindersList: any[], year: string) => {
    const months = [
      { key: '06', name: 'Juin' },
      { key: '07', name: 'Juillet' },
      { key: '08', name: 'Août' },
    ];

    return months.map(month => ({
      month: month.name,
      year: year,
      reminders: remindersList.filter(r => r.date.includes(`-${month.key}-`))
    }));
  };

  const pastByMonth = groupByMonth(pastReminders, '2025');
  const upcomingByMonth = groupByMonth(upcomingReminders, '2026');

  const renderReminderCard = (reminder: any, isPast: boolean) => {
    const icon = getReminderIcon(reminder.title);
    
    return (
      <View key={reminder.id} style={[styles.reminderCard, isPast && styles.pastCard]}>
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
          {icon.library === 'MaterialCommunityIcons' ? (
            <MaterialCommunityIcons name={icon.name as any} size={24} color={icon.color} />
          ) : (
            <Ionicons name={icon.name as any} size={24} color={icon.color} />
          )}
        </View>
        
        <View style={styles.reminderContent}>
          <Text style={styles.reminderTitle}>{reminder.title}</Text>
          <View style={styles.reminderDateRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.gray} />
            <Text style={styles.reminderDate}>{reminder.date}</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, isPast ? styles.pastBadge : styles.upcomingBadge]}>
          <Text style={styles.statusText}>
            {isPast ? '✓' : '!'}
          </Text>
        </View>
      </View>
    );
  };

  const renderMonthSection = (monthData: ReminderWithMonth, isPast: boolean) => {
    const hasReminders = monthData.reminders.length > 0;
    
    return (
      <View key={`${monthData.month}-${monthData.year}`} style={styles.monthSection}>
        <View style={styles.monthHeader}>
          <View style={styles.monthDot} />
          <View>
            <Text style={styles.monthTitle}>{monthData.month} {monthData.year}</Text>
            <Text style={styles.monthSubtitle}>
              {hasReminders 
                ? `${monthData.reminders.length} ${monthData.reminders.length === 1 ? 'rappel' : 'rappels'}`
                : t('home.reminders.noEvents')
              }
            </Text>
          </View>
        </View>

        {hasReminders && (
          <View style={styles.remindersContainer}>
            {monthData.reminders.map(reminder => renderReminderCard(reminder, isPast))}
          </View>
        )}

        {!hasReminders && (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={32} color={colors.gray} />
            <Text style={styles.emptyText}>{t('home.reminders.noEvents')}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('home.reminders.title')}</Text>

        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Ionicons name="calendar" size={24} color={colors.navy} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Section À venir */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: '#4ECDC4' }]} />
            <Text style={styles.sectionTitle}>{t('home.reminders.upcoming')}</Text>
          </View>
          
          <View style={styles.timeline}>
            {upcomingByMonth.map(monthData => renderMonthSection(monthData, false))}
          </View>
        </View>

        {/* Section Passé */}
        <View style={[styles.section, styles.pastSection]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: colors.gray }]} />
            <Text style={styles.sectionTitle}>{t('home.reminders.past')}</Text>
          </View>
          
          <View style={styles.timeline}>
            {pastByMonth.map(monthData => renderMonthSection(monthData, true))}
          </View>
        </View>

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
  headerRight: {
    width: 40,
  },
  calendarButton: {
    padding: spacing.xs,
    width: 40,
    alignItems: 'flex-end',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 45,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.black,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  pastSection: {
    marginTop: spacing.xl,
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  timeline: {
    paddingLeft: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.lightBlue,
  },
  monthSection: {
    marginBottom: spacing.xl,
    paddingLeft: spacing.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
    marginLeft: -spacing.lg - spacing.md - 6,
  },
  monthDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.teal,
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  monthTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  monthSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: 2,
  },
  remindersContainer: {
    gap: spacing.md,
  },
  reminderCard: {
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
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
  },
  pastCard: {
    opacity: 0.7,
    borderLeftColor: colors.gray,
  },
  iconContainer: {
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
  reminderDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reminderDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingBadge: {
    backgroundColor: '#4ECDC4',
  },
  pastBadge: {
    backgroundColor: colors.gray,
  },
  statusText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  emptyCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
