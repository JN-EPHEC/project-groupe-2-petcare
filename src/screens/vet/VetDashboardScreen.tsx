import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentsByVetId, getPatientsByVetId } from '../../services/firestoreService';
import { NotificationBell } from '../../components';

interface VetDashboardScreenProps {
  navigation: any;
}

export const VetDashboardScreen: React.FC<VetDashboardScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user || user.role !== 'vet') return;
    
    setIsLoading(true);
    try {
      const [appointmentsData, patientsData] = await Promise.all([
        getAppointmentsByVetId(user.id),
        getPatientsByVetId(user.id),
      ]);
      setAppointments(appointmentsData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading vet dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats from real data
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => 
    apt.date === today && (apt.status === 'confirmed' || apt.status === 'upcoming')
  );
  const pendingAppointments = appointments.filter(apt => 
    apt.status === 'pending'
  );
  const confirmedAppointments = appointments.filter(apt => 
    apt.status === 'confirmed'
  );
  
  const stats = {
    todayAppointments: todayAppointments.length,
    pendingAppointments: pendingAppointments.length,
    totalPatients: patients.length,
    consultationsThisWeek: appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return aptDate >= weekAgo && apt.status === 'completed';
    }).length,
  };

  const pendingRequests = pendingAppointments.slice(0, 3); // Show first 3

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4ECDC4';
      case 'pending':
        return '#FFB347';
      case 'completed':
        return '#95E1D3';
      case 'cancelled':
        return '#FF6B6B';
      default:
        return colors.gray;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()} Dr. {user?.lastName}</Text>
          <Text style={styles.subtitle}>Tableau de bord vétérinaire</Text>
        </View>
        <View style={styles.headerActions}>
          <NotificationBell 
            onPress={() => navigation.navigate('ScheduledNotifications')}
          />
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('VetProfile')}
          >
            {user?.avatarUrl ? (
              <Image 
                source={{ uri: user.avatarUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={28} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#4ECDC4' }]}>
          <Ionicons name="calendar-outline" size={28} color={colors.white} />
          <Text style={styles.statNumber}>{stats.todayAppointments}</Text>
          <Text style={styles.statLabel}>RDV aujourd'hui</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FFB347' }]}>
          <Ionicons name="time-outline" size={28} color={colors.white} />
          <Text style={styles.statNumber}>{stats.pendingAppointments}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#9B59B6' }]}>
          <Ionicons name="paw-outline" size={28} color={colors.white} />
          <Text style={styles.statNumber}>{stats.totalPatients}</Text>
          <Text style={styles.statLabel}>Patients</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#5eb3b3' }]}>
          <Ionicons name="clipboard-outline" size={28} color={colors.white} />
          <Text style={styles.statNumber}>{stats.consultationsThisWeek}</Text>
          <Text style={styles.statLabel}>Cette semaine</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('VetAppointments')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4ECDC420' }]}>
              <Ionicons name="calendar" size={32} color="#4ECDC4" />
            </View>
            <Text style={styles.actionText}>Mes RDV</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('VetPatients')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#9B59B620' }]}>
              <Ionicons name="list" size={32} color="#9B59B6" />
            </View>
            <Text style={styles.actionText}>Patients</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('VetSchedule')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FF6B6B20' }]}>
              <Ionicons name="time" size={32} color="#FF6B6B" />
            </View>
            <Text style={styles.actionText}>Horaires</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('VetProfile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#5eb3b320' }]}>
              <Ionicons name="person" size={32} color="#5eb3b3" />
            </View>
            <Text style={styles.actionText}>Profil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rendez-vous du jour</Text>
          <TouchableOpacity onPress={() => navigation.navigate('VetAppointments')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {todayAppointments.length > 0 ? (
          todayAppointments.map((appointment) => (
            <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentTime}>
                <Ionicons name="time" size={20} color={colors.teal} />
                <Text style={styles.timeText}>{appointment.time}</Text>
              </View>

              <View style={styles.appointmentInfo}>
                <Text style={styles.petName}>🐾 {appointment.petName}</Text>
                <Text style={styles.ownerName}>Propriétaire: {appointment.ownerName}</Text>
                <View style={styles.appointmentMeta}>
                  <View style={[styles.typeBadge, { backgroundColor: colors.lightBlue }]}>
                    <Text style={styles.typeBadgeText}>{appointment.type}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(appointment.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                      {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={24} color={colors.gray} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.gray} />
            <Text style={styles.emptyStateText}>Aucun rendez-vous aujourd'hui</Text>
          </View>
        )}
      </View>

      {/* Pending Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Demandes en attente</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingAppointments.length}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ManageAppointments')}>
              <Text style={styles.seeAllText}>Gérer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <TouchableOpacity 
              key={request.id} 
              style={styles.requestCard}
              onPress={() => navigation.navigate('ManageAppointments')}
            >
              <View style={styles.requestIcon}>
                <Ionicons name="alert-circle" size={28} color="#FFB347" />
              </View>

              <View style={styles.requestInfo}>
                <Text style={styles.petName}>🐾 {request.petName}</Text>
                <Text style={styles.ownerName}>{request.ownerName}</Text>
                {request.reason && (
                  <Text style={styles.reasonText} numberOfLines={1}>
                    {request.reason}
                  </Text>
                )}
                <Text style={styles.requestDate}>
                  Souhaité: {request.date} à {request.time}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={24} color={colors.gray} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.gray} />
            <Text style={styles.emptyStateText}>Aucune demande en attente</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  profileButton: {
    padding: spacing.xs,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.teal,
  },
  profilePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.teal,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statNumber: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  badge: {
    backgroundColor: colors.teal,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  appointmentTime: {
    alignItems: 'center',
    paddingRight: spacing.md,
    borderRightWidth: 2,
    borderRightColor: colors.teal,
  },
  timeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.xs,
  },
  appointmentInfo: {
    flex: 1,
  },
  petName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  ownerName: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  reasonText: {
    fontSize: typography.fontSize.xs,
    color: colors.navy,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  appointmentMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB347',
  },
  requestIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFB34720',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  preferredDate: {
    fontSize: typography.fontSize.xs,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    padding: spacing.xs,
  },
  rejectButton: {
    padding: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    fontStyle: 'italic',
  },
});

