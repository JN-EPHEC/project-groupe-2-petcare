import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { getPendingVets, getVets, approveVet, rejectVet } from '../../services/firestoreService';

interface AdminVetsScreenProps {
  navigation: any;
}

export const AdminVetsScreen: React.FC<AdminVetsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingVets, setPendingVets] = useState<any[]>([]);
  const [approvedVets, setApprovedVets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVets = useCallback(async () => {
    try {
      setIsLoading(true);
      const [pending, approved] = await Promise.all([
        getPendingVets(),
        getVets(),
      ]);
      setPendingVets(pending);
      setApprovedVets(approved);
    } catch (error) {
      console.error('Error loading vets:', error);
      Alert.alert('Erreur', 'Impossible de charger les vétérinaires');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVets();
  }, [loadVets]);

  useFocusEffect(
    useCallback(() => {
      loadVets();
    }, [loadVets])
  );

  // Mock data (backup)
  const mockVetsData = {
    pending: [
      {
        id: '1',
        name: 'Dr. Jean Laurent',
        email: 'jean.laurent@vet.be',
        phone: '+32 2 345 6789',
        specialty: 'Chirurgien vétérinaire',
        experience: '8 ans',
        clinic: 'Clinique Vétérinaire du Centre',
        location: 'Bruxelles',
        license: 'BE-VET-2016-1234',
        submitDate: '25 Mars 2024',
        documents: ['Diplôme', 'Licence', 'Assurance'],
        avatarUrl: 'https://ui-avatars.com/api/?name=Jean+Laurent&background=9B59B6&color=fff',
      },
      {
        id: '2',
        name: 'Dr. Marie Dupont',
        email: 'marie.dupont@vetcare.be',
        phone: '+32 2 456 7890',
        specialty: 'Médecine générale',
        experience: '5 ans',
        clinic: 'VetCare Plus',
        location: 'Liège',
        license: 'BE-VET-2019-5678',
        submitDate: '28 Mars 2024',
        documents: ['Diplôme', 'Licence'],
        avatarUrl: 'https://ui-avatars.com/api/?name=Marie+Dupont&background=9B59B6&color=fff',
      },
    ],
    approved: [
      {
        id: '3',
        name: 'Dr. Sophie Martin',
        email: 'vet@petcare.com',
        phone: '+32 2 123 4567',
        specialty: 'Dentiste vétérinaire',
        experience: '10 ans',
        clinic: 'Clinique Dentaire Animale',
        location: 'Bruxelles',
        license: 'BE-VET-2014-9012',
        approveDate: '15 Fév 2024',
        patients: 42,
        rating: 4.8,
        avatarUrl: 'https://ui-avatars.com/api/?name=Sophie+Martin&background=9B59B6&color=fff',
      },
    ],
    rejected: [
      {
        id: '4',
        name: 'Dr. Pierre Moreau',
        email: 'pierre.moreau@mail.com',
        phone: '+32 2 567 8901',
        specialty: 'Médecine générale',
        experience: '3 ans',
        clinic: 'Cabinet Vétérinaire',
        location: 'Namur',
        license: 'BE-VET-2021-3456',
        rejectDate: '20 Mars 2024',
        rejectReason: 'Documents incomplets',
        avatarUrl: 'https://ui-avatars.com/api/?name=Pierre+Moreau&background=9B59B6&color=fff',
      },
    ],
  };

  // Utiliser les vraies données ou mock en backup
  const currentVetsData = activeTab === 'pending' 
    ? (pendingVets.length > 0 ? pendingVets : mockVetsData.pending)
    : (approvedVets.length > 0 ? approvedVets : mockVetsData.approved);

  const filteredVets = currentVetsData.filter(vet => {
    const vetName = vet.name || `${vet.firstName} ${vet.lastName}`;
    const vetSpecialty = vet.specialty || '';
    const vetEmail = vet.email || '';
    
    return vetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           vetEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
           vetSpecialty.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleApprove = async (vet: any) => {
    const vetName = vet.name || `${vet.firstName} ${vet.lastName}`;
    Alert.alert(
      'Approuver le vétérinaire',
      `Voulez-vous approuver la demande de ${vetName} ?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Approuver',
          onPress: async () => {
            try {
              await approveVet(vet.id);
              Alert.alert('Succès', `${vetName} a été approuvé avec succès !`);
              await loadVets(); // Recharger la liste
            } catch (error) {
              console.error('Error approving vet:', error);
              Alert.alert('Erreur', 'Impossible d\'approuver ce vétérinaire');
            }
          }
        }
      ]
    );
  };

  const handleReject = (vet: any) => {
    const vetName = vet.name || `${vet.firstName} ${vet.lastName}`;
    Alert.prompt(
      'Rejeter le vétérinaire',
      `Raison du rejet pour ${vetName} :`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: async (reason) => {
            try {
              await rejectVet(vet.id, reason);
              Alert.alert('Rejeté', `${vetName} a été rejeté.`);
              await loadVets(); // Recharger la liste
            } catch (error) {
              console.error('Error rejecting vet:', error);
              Alert.alert('Erreur', 'Impossible de rejeter ce vétérinaire');
            }
          }
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const handleViewDocuments = (vet: any) => {
    Alert.alert(
      'Documents soumis',
      `Documents de ${vet.name}:\n\n${vet.documents?.join('\n') || 'Aucun document'}`,
      [{ text: 'OK' }]
    );
  };

  const renderPendingVetCard = (vet: any) => {
    return (
      <View key={vet.id} style={styles.vetCard}>
        <View style={styles.vetCardHeader}>
          <Image source={{ uri: vet.avatarUrl }} style={styles.vetAvatar} />
          <View style={styles.vetHeaderInfo}>
            <Text style={styles.vetName}>{vet.name}</Text>
            <View style={styles.specialtyBadge}>
              <MaterialCommunityIcons name="stethoscope" size={14} color={colors.white} />
              <Text style={styles.specialtyText}>{vet.specialty}</Text>
            </View>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>En attente</Text>
          </View>
        </View>

        <View style={styles.vetDetails}>
          <View style={styles.vetDetailRow}>
            <Ionicons name="mail" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>{vet.email}</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <Ionicons name="call" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>{vet.phone}</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <Ionicons name="business" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>{vet.clinic}</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <Ionicons name="location" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>{vet.location}</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <MaterialCommunityIcons name="certificate" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>{vet.license}</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <Ionicons name="briefcase" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>{vet.experience} d'expérience</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <Ionicons name="calendar" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>Soumis le {vet.submitDate}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.documentsButton}
          onPress={() => handleViewDocuments(vet)}
        >
          <Ionicons name="document-text" size={18} color={colors.teal} />
          <Text style={styles.documentsButtonText}>
            Voir les documents ({vet.documents?.length || 0})
          </Text>
        </TouchableOpacity>

        <View style={styles.vetActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(vet)}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Approuver</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(vet)}
          >
            <Ionicons name="close-circle" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Rejeter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderApprovedVetCard = (vet: any) => {
    return (
      <View key={vet.id} style={styles.vetCard}>
        <View style={styles.vetCardHeader}>
          <Image source={{ uri: vet.avatarUrl }} style={styles.vetAvatar} />
          <View style={styles.vetHeaderInfo}>
            <Text style={styles.vetName}>{vet.name}</Text>
            <View style={[styles.specialtyBadge, { backgroundColor: colors.green }]}>
              <Ionicons name="checkmark-circle" size={14} color={colors.white} />
              <Text style={styles.specialtyText}>Approuvé</Text>
            </View>
          </View>
          {vet.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{vet.rating}</Text>
            </View>
          )}
        </View>

        <View style={styles.vetDetails}>
          <View style={styles.vetDetailRow}>
            <MaterialCommunityIcons name="stethoscope" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>{vet.specialty}</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <Ionicons name="location" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>{vet.clinic} - {vet.location}</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <Ionicons name="people" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>{vet.patients} patients actifs</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <Ionicons name="calendar" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>Approuvé le {vet.approveDate}</Text>
          </View>
        </View>

        <View style={styles.vetActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.teal }]}
            onPress={() => Alert.alert('Info', `Voir le profil de ${vet.name}`)}
          >
            <Ionicons name="person" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Voir profil</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
            onPress={() => Alert.alert('Suspendre', `Suspendre ${vet.name} ?`)}
          >
            <Ionicons name="pause-circle" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Suspendre</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRejectedVetCard = (vet: any) => {
    return (
      <View key={vet.id} style={styles.vetCard}>
        <View style={styles.vetCardHeader}>
          <Image source={{ uri: vet.avatarUrl }} style={styles.vetAvatar} />
          <View style={styles.vetHeaderInfo}>
            <Text style={styles.vetName}>{vet.name}</Text>
            <View style={[styles.specialtyBadge, { backgroundColor: '#FF6B6B' }]}>
              <Ionicons name="close-circle" size={14} color={colors.white} />
              <Text style={styles.specialtyText}>Rejeté</Text>
            </View>
          </View>
        </View>

        <View style={styles.vetDetails}>
          <View style={styles.vetDetailRow}>
            <MaterialCommunityIcons name="stethoscope" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>{vet.specialty}</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <Ionicons name="location" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>{vet.clinic} - {vet.location}</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <Ionicons name="calendar" size={16} color={colors.gray} />
            <Text style={styles.vetDetailText}>Rejeté le {vet.rejectDate}</Text>
          </View>
          <View style={styles.vetDetailRow}>
            <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
            <Text style={[styles.vetDetailText, { color: '#FF6B6B' }]}>
              Raison: {vet.rejectReason}
            </Text>
          </View>
        </View>

        <View style={styles.vetActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(vet)}
          >
            <Ionicons name="refresh-circle" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Réexaminer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.gray }]}
            onPress={() => Alert.alert('Supprimer', `Supprimer définitivement ${vet.name} ?`)}
          >
            <Ionicons name="trash" size={20} color={colors.white} />
            <Text style={styles.actionButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Chargement des vétérinaires...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Gestion des vétérinaires</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search')}
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
            <Ionicons name="close-circle" size={20} color={colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            En attente ({pendingVets.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
          onPress={() => setActiveTab('approved')}
        >
          <Text style={[styles.tabText, activeTab === 'approved' && styles.activeTabText]}>
            Approuvés ({approvedVets.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {filteredVets.length > 0 ? (
          filteredVets.map(vet => {
            if (activeTab === 'pending') return renderPendingVetCard(vet);
            return renderApprovedVetCard(vet);
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="stethoscope" size={80} color={colors.gray} />
            <Text style={styles.emptyStateText}>
              {searchQuery.length > 0 ? t('common.noResults') : 'Aucun vétérinaire'}
            </Text>
          </View>
        )}
      </View>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  clearSearchButton: {
    marginLeft: spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.teal,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontWeight: typography.fontWeight.semiBold,
  },
  activeTabText: {
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  vetCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  vetCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  vetAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.md,
  },
  vetHeaderInfo: {
    flex: 1,
  },
  vetName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9B59B6',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  specialtyText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pendingBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  vetDetails: {
    marginBottom: spacing.md,
  },
  vetDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  vetDetailText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginLeft: spacing.sm,
    flex: 1,
  },
  documentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  documentsButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.teal,
    fontWeight: typography.fontWeight.semiBold,
  },
  vetActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  approveButton: {
    backgroundColor: colors.green,
  },
  rejectButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  emptyStateText: {
    fontSize: typography.fontSize.lg,
    color: colors.gray,
    marginTop: spacing.md,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.md,
  },
});

