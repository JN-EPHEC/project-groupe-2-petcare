import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface AdminUsersScreenProps {
  navigation: any;
}

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'owners', 'vets', 'admins'

  // Mock data
  const allUsers = [
    { 
      id: '1', 
      name: 'Charles DuBois', 
      email: 'admin@petcare.com', 
      role: 'admin', 
      status: 'active',
      joinDate: '15 Jan 2024',
      pets: 1,
      avatarUrl: 'https://ui-avatars.com/api/?name=Charles+DuBois&background=0D4C92&color=fff',
    },
    { 
      id: '2', 
      name: 'Dr. Sophie Martin', 
      email: 'vet@petcare.com', 
      role: 'vet', 
      status: 'active',
      joinDate: '20 Feb 2024',
      patients: 42,
      specialty: 'Dentiste vétérinaire',
      avatarUrl: 'https://ui-avatars.com/api/?name=Sophie+Martin&background=9B59B6&color=fff',
    },
    { 
      id: '3', 
      name: 'Marie Dubois', 
      email: 'marie.dubois@mail.com', 
      role: 'owner', 
      status: 'active',
      joinDate: '10 Mar 2024',
      pets: 2,
      avatarUrl: 'https://ui-avatars.com/api/?name=Marie+Dubois&background=4ECDC4&color=fff',
    },
    { 
      id: '4', 
      name: 'Dr. Jean Laurent', 
      email: 'jean.laurent@vet.be', 
      role: 'vet', 
      status: 'pending',
      joinDate: '25 Mar 2024',
      patients: 0,
      specialty: 'Chirurgien',
      avatarUrl: 'https://ui-avatars.com/api/?name=Jean+Laurent&background=9B59B6&color=fff',
    },
    { 
      id: '5', 
      name: 'Lucas Bernard', 
      email: 'lucas.b@gmail.com', 
      role: 'owner', 
      status: 'active',
      joinDate: '01 Apr 2024',
      pets: 1,
      avatarUrl: 'https://ui-avatars.com/api/?name=Lucas+Bernard&background=4ECDC4&color=fff',
    },
    { 
      id: '6', 
      name: 'Emma Petit', 
      email: 'emma.petit@mail.com', 
      role: 'owner', 
      status: 'suspended',
      joinDate: '12 Apr 2024',
      pets: 3,
      avatarUrl: 'https://ui-avatars.com/api/?name=Emma+Petit&background=4ECDC4&color=fff',
    },
  ];

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || user.role === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryCount = (type: string) => {
    if (type === 'all') return allUsers.length;
    return allUsers.filter(user => user.role === type).length;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return colors.navy;
      case 'vet': return '#9B59B6';
      case 'owner': return colors.teal;
      default: return colors.gray;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return colors.green;
      case 'pending': return '#FF9800';
      case 'suspended': return '#FF6B6B';
      default: return colors.gray;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'vet': return 'Vétérinaire';
      case 'owner': return 'Propriétaire';
      default: return role;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const handleUserAction = (user: any, action: 'suspend' | 'activate' | 'delete' | 'approve') => {
    let title = '';
    let message = '';

    switch (action) {
      case 'suspend':
        title = 'Suspendre utilisateur';
        message = `Voulez-vous suspendre ${user.name} ?`;
        break;
      case 'activate':
        title = 'Activer utilisateur';
        message = `Voulez-vous activer ${user.name} ?`;
        break;
      case 'delete':
        title = 'Supprimer utilisateur';
        message = `Êtes-vous sûr de vouloir supprimer ${user.name} ? Cette action est irréversible.`;
        break;
      case 'approve':
        title = 'Approuver vétérinaire';
        message = `Voulez-vous approuver la demande de ${user.name} ?`;
        break;
    }

    Alert.alert(
      title,
      message,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          style: action === 'delete' ? 'destructive' : 'default',
          onPress: () => Alert.alert('Succès', `Action "${action}" effectuée pour ${user.name}`)
        }
      ]
    );
  };

  const renderUserCard = (user: any) => {
    return (
      <View key={user.id} style={styles.userCard}>
        <Image 
          source={{ uri: user.avatarUrl }}
          style={styles.userAvatar}
        />
        
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.badgesContainer}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) }]}>
                <Text style={styles.roleBadgeText}>{getRoleLabel(user.role)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor(user.status) }]}>
                <Text style={styles.statusBadgeText}>{getStatusLabel(user.status)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.userDetails}>
            <View style={styles.userDetailRow}>
              <Ionicons name="mail" size={14} color={colors.gray} />
              <Text style={styles.userDetailText}>{user.email}</Text>
            </View>
            <View style={styles.userDetailRow}>
              <Ionicons name="calendar" size={14} color={colors.gray} />
              <Text style={styles.userDetailText}>Inscrit le {user.joinDate}</Text>
            </View>
            {user.role === 'owner' && (
              <View style={styles.userDetailRow}>
                <Ionicons name="paw" size={14} color={colors.gray} />
                <Text style={styles.userDetailText}>{user.pets} animal{user.pets > 1 ? 'ux' : ''}</Text>
              </View>
            )}
            {user.role === 'vet' && (
              <>
                <View style={styles.userDetailRow}>
                  <MaterialCommunityIcons name="medical-bag" size={14} color={colors.gray} />
                  <Text style={styles.userDetailText}>{user.specialty}</Text>
                </View>
                <View style={styles.userDetailRow}>
                  <Ionicons name="people" size={14} color={colors.gray} />
                  <Text style={styles.userDetailText}>{user.patients} patients</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.userActions}>
            {user.status === 'pending' && user.role === 'vet' && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.green }]}
                onPress={() => handleUserAction(user, 'approve')}
              >
                <Ionicons name="checkmark" size={18} color={colors.white} />
                <Text style={styles.actionButtonText}>Approuver</Text>
              </TouchableOpacity>
            )}
            {user.status === 'active' && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                onPress={() => handleUserAction(user, 'suspend')}
              >
                <Ionicons name="pause" size={18} color={colors.white} />
                <Text style={styles.actionButtonText}>Suspendre</Text>
              </TouchableOpacity>
            )}
            {user.status === 'suspended' && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.green }]}
                onPress={() => handleUserAction(user, 'activate')}
              >
                <Ionicons name="play" size={18} color={colors.white} />
                <Text style={styles.actionButtonText}>Activer</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
              onPress={() => handleUserAction(user, 'delete')}
            >
              <Ionicons name="trash" size={18} color={colors.white} />
              <Text style={styles.actionButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Gestion des utilisateurs</Text>
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'owners', label: 'Propriétaires' },
          { key: 'vets', label: 'Vétérinaires' },
          { key: 'admins', label: 'Admins' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterChip, activeFilter === filter.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[styles.filterChipText, activeFilter === filter.key && styles.filterChipTextActive]}>
              {filter.label} ({getCategoryCount(filter.key)})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map(renderUserCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={80} color={colors.gray} />
            <Text style={styles.emptyStateText}>{t('common.noResults')}</Text>
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
  filterContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  filterChip: {
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.teal,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontWeight: typography.fontWeight.semiBold,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  userCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    flex: 1,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  roleBadge: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  statusBadge: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  userDetails: {
    marginBottom: spacing.md,
  },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userDetailText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginLeft: spacing.sm,
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
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
});

