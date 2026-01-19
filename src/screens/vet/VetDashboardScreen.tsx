import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentsByVetId, getPetsByVetId, getPendingAssignmentRequestsByVetId } from '../../services/firestoreService';
import { NotificationBell } from '../../components';

interface VetDashboardScreenProps {
  navigation: any;
}

export const VetDashboardScreen: React.FC<VetDashboardScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  // Recharger les données quand l'écran est focus
  useFocusEffect(
    React.useCallback(() => {
      if (user?.role === 'vet') {
        loadData();
      }
    }, [user])
  );

  const loadData = async () => {
    if (!user || user.role !== 'vet') return;
    
    setIsLoading(true);
    try {
      console.log('🏥 [VetDashboard] Chargement des données pour le vétérinaire:', user.id);
      
      const [appointmentsData, patientsData, assignmentRequests] = await Promise.all([
        getAppointmentsByVetId(user.id),
        getPetsByVetId(user.id),
        getPendingAssignmentRequestsByVetId(user.id),
      ]);
      
      console.log('📅 [VetDashboard] Rendez-vous chargés:', appointmentsData.length);
      console.log('🐾 [VetDashboard] Patients chargés:', patientsData.length);
      console.log('📝 [VetDashboard] Demandes d\'assignation en attente:', assignmentRequests.length);
      
      setAppointments(appointmentsData);
      setPendingRequests(assignmentRequests.length);
      setPatients(patientsData);
    } catch (error) {
      console.error('❌ [VetDashboard] Erreur chargement données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats from real data
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0]; // Format: "2026-01-17"
  
  // Fonction pour vérifier si une date est aujourd'hui
  const isToday = (dateString: string) => {
    if (!dateString) return false;
    // Normaliser la date pour comparaison
    const aptDateString = dateString.split('T')[0];
    return aptDateString === todayDateString;
  };
  
  // Fonction pour obtenir le lundi de cette semaine (début de semaine)
  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Si dimanche, recule de 6 jours
    return new Date(d.setDate(diff));
  };
  
  // Fonction pour obtenir le dimanche de cette semaine (fin de semaine)
  const getSunday = (date: Date) => {
    const monday = getMonday(date);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // Lundi + 6 jours = Dimanche
    return sunday;
  };
  
  // Dates de la semaine en cours
  const weekStart = getMonday(today);
  const weekEnd = getSunday(today);
  const weekStartString = weekStart.toISOString().split('T')[0];
  const weekEndString = weekEnd.toISOString().split('T')[0];
  
  // Fonction pour vérifier si une date est dans la semaine en cours
  const isThisWeek = (dateString: string) => {
    if (!dateString) return false;
    const aptDateString = dateString.split('T')[0];
    return aptDateString >= weekStartString && aptDateString <= weekEndString;
  };
  
  // Rendez-vous du jour (tous statuts sauf cancelled et rejected)
  const todayAppointments = appointments.filter(apt => {
    const isTodayDate = isToday(apt.date);
    const isValidStatus = apt.status !== 'cancelled' && apt.status !== 'rejected';
    return isTodayDate && isValidStatus;
  });
  
  // Rendez-vous de la semaine en cours (lundi au dimanche, tous statuts sauf cancelled et rejected)
  const thisWeekAppointments = appointments.filter(apt => {
    const isWeekDate = isThisWeek(apt.date);
    const isValidStatus = apt.status !== 'cancelled' && apt.status !== 'rejected';
    return isWeekDate && isValidStatus;
  });
  
  console.log('📊 [VetDashboard] Stats:');
  console.log('  - Rendez-vous aujourd\'hui:', todayAppointments.length, '/', appointments.filter(apt => isToday(apt.date)).length, 'total pour aujourd\'hui');
  console.log('  - Détail:', todayAppointments.map(apt => `${apt.time} - ${apt.petName} (${apt.status})`));
  console.log('  - Semaine en cours: du', weekStartString, 'au', weekEndString);
  console.log('  - Rendez-vous cette semaine:', thisWeekAppointments.length, '/', appointments.filter(apt => isThisWeek(apt.date)).length, 'total pour cette semaine');
  
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
    consultationsThisWeek: thisWeekAppointments.length,
  };

  const pendingAppointmentsToShow = pendingAppointments.slice(0, 3); // Show first 3

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
            iconColor={colors.teal}
            backgroundColor={colors.lightBlue}
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
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: '#4ECDC4' }]}
          onPress={() => navigation.navigate('VetAppointments')}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={28} color={colors.white} />
          <Text style={styles.statNumber}>{stats.todayAppointments}</Text>
          <Text style={styles.statLabel}>RDV aujourd'hui</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: '#FFB347' }]}
          onPress={() => navigation.navigate('ManageAppointments')}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={28} color={colors.white} />
          <Text style={styles.statNumber}>{stats.pendingAppointments}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: '#9B59B6' }]}
          onPress={() => navigation.navigate('VetPatients')}
          activeOpacity={0.8}
        >
          <Ionicons name="paw-outline" size={28} color={colors.white} />
          <Text style={styles.statNumber}>{stats.totalPatients}</Text>
          <Text style={styles.statLabel}>Patients</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: '#5eb3b3' }]}
          onPress={() => navigation.navigate('VetAppointments')}
          activeOpacity={0.8}
        >
          <Ionicons name="clipboard-outline" size={28} color={colors.white} />
          <Text style={styles.statNumber}>{stats.consultationsThisWeek}</Text>
          <Text style={styles.statLabel}>Cette semaine</Text>
        </TouchableOpacity>
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
            onPress={() => navigation.navigate('VetAssignmentRequests')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFA50020' }]}>
              <Ionicons name="heart-circle" size={32} color="#FFA500" />
              {pendingRequests > 0 && (
                <View style={styles.requestBadge}>
                  <Text style={styles.requestBadgeText}>{pendingRequests}</Text>
                </View>
              )}
            </View>
            <Text style={styles.actionText}>Demandes</Text>
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

        {pendingAppointmentsToShow.length > 0 ? (
          pendingAppointmentsToShow.map((request) => (
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
    position: 'relative',
  },
  requestBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.red,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: colors.white,
  },
  requestBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
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

