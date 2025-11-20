import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface VetAppointmentsScreenProps {
  navigation: any;
}

export const VetAppointmentsScreen: React.FC<VetAppointmentsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const allAppointments = [
    {
      id: '1',
      date: '2025-11-21',
      time: '09:00',
      petName: 'Kitty',
      petType: 'Chat',
      ownerName: 'John Doe',
      ownerPhone: '+32 49 90 89 808',
      type: 'Consultation',
      status: 'upcoming',
      notes: 'Contrôle de routine',
    },
    {
      id: '2',
      date: '2025-11-21',
      time: '10:30',
      petName: 'Max',
      petType: 'Chien',
      ownerName: 'Charles DuBois',
      ownerPhone: '+32 2 123 4567',
      type: 'Vaccination',
      status: 'upcoming',
      notes: 'Vaccin antirabique',
    },
    {
      id: '3',
      date: '2025-11-21',
      time: '14:00',
      petName: 'Luna',
      petType: 'Chat',
      ownerName: 'Marie Martin',
      ownerPhone: '+32 2 345 6789',
      type: 'Contrôle',
      status: 'upcoming',
      notes: 'Suivi post-opératoire',
    },
    {
      id: '4',
      date: '2025-11-20',
      time: '11:00',
      petName: 'Rocky',
      petType: 'Chien',
      ownerName: 'Sophie Laurent',
      ownerPhone: '+32 2 456 7890',
      type: 'Urgence',
      status: 'past',
      notes: 'Blessure à la patte',
    },
    {
      id: '5',
      date: '2025-11-19',
      time: '15:30',
      petName: 'Bella',
      petType: 'Chat',
      ownerName: 'Thomas Bernard',
      ownerPhone: '+32 2 567 8901',
      type: 'Consultation',
      status: 'cancelled',
      notes: 'Annulé par le propriétaire',
    },
  ];

  const filteredAppointments = allAppointments
    .filter(apt => apt.status === selectedTab)
    .filter(apt => 
      searchQuery.trim() === '' ||
      apt.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Consultation':
        return '#4ECDC4';
      case 'Vaccination':
        return '#9B59B6';
      case 'Contrôle':
        return '#5eb3b3';
      case 'Urgence':
        return '#FF6B6B';
      default:
        return colors.teal;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Consultation':
        return 'clipboard';
      case 'Vaccination':
        return 'medical';
      case 'Contrôle':
        return 'checkmark-circle';
      case 'Urgence':
        return 'alert-circle';
      default:
        return 'calendar';
    }
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

        <Text style={styles.headerTitle}>Rendez-vous</Text>

        <View style={styles.headerRight} />
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]}
          onPress={() => setSelectedTab('upcoming')}
        >
          <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>
            À venir ({allAppointments.filter(a => a.status === 'upcoming').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'past' && styles.tabActive]}
          onPress={() => setSelectedTab('past')}
        >
          <Text style={[styles.tabText, selectedTab === 'past' && styles.tabTextActive]}>
            Passés ({allAppointments.filter(a => a.status === 'past').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'cancelled' && styles.tabActive]}
          onPress={() => setSelectedTab('cancelled')}
        >
          <Text style={[styles.tabText, selectedTab === 'cancelled' && styles.tabTextActive]}>
            Annulés ({allAppointments.filter(a => a.status === 'cancelled').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
              <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(appointment.type) }]} />
              
              <View style={styles.appointmentContent}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time" size={18} color={colors.teal} />
                    <Text style={styles.timeText}>{appointment.time}</Text>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(appointment.type) + '20' }]}>
                    <Ionicons name={getTypeIcon(appointment.type) as any} size={16} color={getTypeColor(appointment.type)} />
                    <Text style={[styles.typeBadgeText, { color: getTypeColor(appointment.type) }]}>
                      {appointment.type}
                    </Text>
                  </View>
                </View>

                <View style={styles.patientInfo}>
                  <Text style={styles.petName}>🐾 {appointment.petName}</Text>
                  <Text style={styles.petType}>{appointment.petType}</Text>
                </View>

                <View style={styles.ownerInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person" size={16} color={colors.gray} />
                    <Text style={styles.ownerName}>{appointment.ownerName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call" size={16} color={colors.gray} />
                    <Text style={styles.ownerPhone}>{appointment.ownerPhone}</Text>
                  </View>
                </View>

                {appointment.notes && (
                  <View style={styles.notesContainer}>
                    <Ionicons name="document-text" size={16} color={colors.gray} />
                    <Text style={styles.notesText}>{appointment.notes}</Text>
                  </View>
                )}

                {selectedTab === 'upcoming' && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="call" size={20} color={colors.teal} />
                      <Text style={styles.actionButtonText}>Appeler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.completeButton]}>
                      <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                      <Text style={styles.actionButtonText}>Terminer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>Aucun rendez-vous</Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? 'Aucun résultat pour cette recherche' : `Aucun rendez-vous ${selectedTab === 'upcoming' ? 'à venir' : selectedTab === 'past' ? 'passé' : 'annulé'}`}
            </Text>
          </View>
        )}

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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.teal,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  tabTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  typeIndicator: {
    width: 6,
  },
  appointmentContent: {
    flex: 1,
    padding: spacing.md,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  petName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  petType: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
  },
  ownerInfo: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ownerName: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
  },
  ownerPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  notesText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.black,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
  },
  completeButton: {
    backgroundColor: '#4ECDC420',
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

