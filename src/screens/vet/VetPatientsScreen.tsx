import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getPetsByVetId, Pet, getUserById, getAppointmentsByVetId, Appointment } from '../../services/firestoreService';

interface VetPatientsScreenProps {
  navigation: any;
}

interface PatientWithOwner extends Pet {
  ownerName?: string;
  ownerPhone?: string;
  upcomingAppointments?: Appointment[];
}

export const VetPatientsScreen: React.FC<VetPatientsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecies, setFilterSpecies] = useState<'all' | 'cat' | 'dog' | 'other'>('all');
  const [patients, setPatients] = useState<PatientWithOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [user?.id]);

  const loadPatients = async () => {
    if (!user?.id) {
      console.log('❌ No user ID found');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`🔍 Loading patients for vet: ${user.id}`);
      
      // Récupérer tous les animaux du vétérinaire
      const pets = await getPetsByVetId(user.id);
      console.log(`📦 Found ${pets.length} pets for this vet`);
      
      // Récupérer tous les rendez-vous du vétérinaire
      const allAppointments = await getAppointmentsByVetId(user.id);
      console.log(`📅 Found ${allAppointments.length} appointments for this vet`);
      
      // Filtrer les rendez-vous à venir (status 'upcoming' ou 'pending')
      const upcomingAppointments = allAppointments.filter(apt => 
        (apt.status === 'upcoming' || apt.status === 'pending') &&
        new Date(apt.date) >= new Date()
      );
      console.log(`📅 ${upcomingAppointments.length} upcoming appointments`);
      
      // Enrichir avec les infos du propriétaire et les rendez-vous
      const petsWithOwners = await Promise.all(
        pets.map(async (pet) => {
          try {
            const owner = await getUserById(pet.ownerId);
            console.log(`👤 Loaded owner for pet ${pet.name}: ${owner?.firstName} ${owner?.lastName}`);
            
            // Filtrer les rendez-vous de cet animal
            const petAppointments = upcomingAppointments
              .filter(apt => apt.petId === pet.id)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            console.log(`📅 ${pet.name} has ${petAppointments.length} upcoming appointments`);
            
            return {
              ...pet,
              ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Propriétaire inconnu',
              ownerPhone: owner?.phone || '',
              upcomingAppointments: petAppointments,
            };
          } catch (error) {
            console.error(`❌ Error loading owner for pet ${pet.name}:`, error);
            return {
              ...pet,
              ownerName: 'Propriétaire inconnu',
              ownerPhone: '',
              upcomingAppointments: [],
            };
          }
        })
      );
      
      console.log(`✅ Loaded ${petsWithOwners.length} patients with owner info and appointments`);
      setPatients(petsWithOwners);
    } catch (error) {
      console.error('❌ Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Utiliser uniquement les vrais patients
  const filteredPatients = patients
    .filter(patient => 
      filterSpecies === 'all' || 
      patient.type === filterSpecies || 
      (patient as any).species === filterSpecies
    )
    .filter(patient =>
      searchQuery.trim() === '' ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.ownerName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Chargement des patients...</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#4ECDC4';
      case 'followup':
        return '#FFB347';
      case 'treatment':
        return '#FF6B6B';
      default:
        return colors.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'En bonne santé';
      case 'followup':
        return 'Suivi requis';
      case 'treatment':
        return 'En traitement';
      default:
        return 'Inconnu';
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

        <Text style={styles.headerTitle}>Mes Patients</Text>

        <View style={styles.headerRight}>
          <Text style={styles.countBadge}>{filteredPatients.length}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un patient ou propriétaire..."
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

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filterSpecies === 'all' && styles.filterChipActive]}
          onPress={() => setFilterSpecies('all')}
        >
          <Text style={[styles.filterText, filterSpecies === 'all' && styles.filterTextActive]}>
            Tous ({patients.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterSpecies === 'cat' && styles.filterChipActive]}
          onPress={() => setFilterSpecies('cat')}
        >
          <Text style={[styles.filterText, filterSpecies === 'cat' && styles.filterTextActive]}>
            🐱 Chats ({patients.filter(p => p.type === 'cat' || (p as any).species === 'cat').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterSpecies === 'dog' && styles.filterChipActive]}
          onPress={() => setFilterSpecies('dog')}
        >
          <Text style={[styles.filterText, filterSpecies === 'dog' && styles.filterTextActive]}>
            🐕 Chiens ({patients.filter(p => p.type === 'dog' || (p as any).species === 'dog').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Patients List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <TouchableOpacity key={patient.id} style={styles.patientCard}>
              <View style={styles.patientAvatar}>
                <Text style={styles.avatarEmoji}>{patient.emoji || patient.imageEmoji || '🐾'}</Text>
              </View>

              <View style={styles.patientInfo}>
                <View style={styles.patientHeader}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  {(patient as any).status && (
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor((patient as any).status) + '20' }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor((patient as any).status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor((patient as any).status) }]}>
                        {getStatusText((patient as any).status)}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.breedText}>{patient.breed} • {patient.age} ans • {patient.weight}kg</Text>

                <View style={styles.ownerInfo}>
                  <Ionicons name="person" size={14} color={colors.gray} />
                  <Text style={styles.ownerText}>{patient.ownerName || 'Propriétaire inconnu'}</Text>
                  {patient.ownerPhone && (
                    <>
                      <Ionicons name="call" size={14} color={colors.gray} style={{ marginLeft: spacing.sm }} />
                      <Text style={styles.ownerText}>{patient.ownerPhone}</Text>
                    </>
                  )}
                </View>

                {patient.upcomingAppointments && patient.upcomingAppointments.length > 0 && (
                  <View style={styles.visitsInfo}>
                    {patient.upcomingAppointments.slice(0, 2).map((apt, index) => (
                      <View key={apt.id || index} style={styles.visitItem}>
                        <Ionicons 
                          name={apt.status === 'pending' ? "time" : "calendar"} 
                          size={14} 
                          color={apt.status === 'pending' ? colors.orange : colors.teal} 
                        />
                        <Text style={styles.visitText}>
                          {apt.status === 'pending' ? 'RDV demandé' : 'RDV confirmé'}: {new Date(apt.date).toLocaleDateString('fr-FR')} à {apt.time}
                        </Text>
                      </View>
                    ))}
                    {patient.upcomingAppointments.length > 2 && (
                      <Text style={[styles.visitText, { fontStyle: 'italic', marginLeft: spacing.lg }]}>
                        +{patient.upcomingAppointments.length - 2} autre(s) RDV
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.actionsRow}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('VetPatientDetail', { 
                      patient: patient,
                      patientId: patient.id,
                      patientName: patient.name 
                    })}
                  >
                    <Ionicons name="clipboard" size={18} color={colors.teal} />
                    <Text style={styles.actionText}>Dossier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, !patient.ownerPhone && styles.actionButtonDisabled]}
                    disabled={!patient.ownerPhone}
                  >
                    <Ionicons name="call" size={18} color={patient.ownerPhone ? colors.teal : colors.gray} />
                    <Text style={[styles.actionText, !patient.ownerPhone && styles.actionTextDisabled]}>Appeler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('ManageAppointments', {
                      initialFilter: patient.id
                    })}
                  >
                    <Ionicons name="calendar" size={18} color={colors.teal} />
                    <Text style={styles.actionText}>
                      RDV{patient.upcomingAppointments && patient.upcomingAppointments.length > 0 ? ` (${patient.upcomingAppointments.length})` : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="paw-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>Aucun patient</Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim() 
                ? 'Aucun résultat pour cette recherche' 
                : 'Les propriétaires qui ajoutent un animal et vous sélectionnent comme vétérinaire apparaîtront ici.'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: spacing.md,
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
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  countBadge: {
    backgroundColor: colors.teal,
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.lightBlue,
  },
  filterChipActive: {
    backgroundColor: colors.teal,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  filterTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: spacing.md,
  },
  patientAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  patientInfo: {
    flex: 1,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  patientName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
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
  breedText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  ownerText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  visitsInfo: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  visitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  visitText: {
    fontSize: typography.fontSize.xs,
    color: colors.black,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  actionTextDisabled: {
    color: colors.gray,
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

