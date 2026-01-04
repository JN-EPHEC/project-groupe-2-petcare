import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { 
  getAllUsers, 
  updateUserRole,
  promoteToAdmin,
  approveVet,
  rejectVet,
  suspendUser,
  activateUser,
  getUserById,
  updateUserProfile,
  softDeleteUser
} from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

interface AdminUsersScreenProps {
  navigation: any;
}

export const AdminUsersScreen: React.FC<AdminUsersScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'owner', 'vet', 'admin'
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalContent, setActionModalContent] = useState({
    title: '',
    message: '',
    action: null as any,
  });
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
  });

  // Charger les utilisateurs depuis Firestore
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Rafraîchir quand on revient sur l'écran
  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  // Mock data (backup si Firestore est vide)
  const mockUsers = [
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

  // Utiliser les données réelles ou mock
  const displayUsers = allUsers.length > 0 ? allUsers : mockUsers;

  const filteredUsers = displayUsers.filter(user => {
    const userName = user.name || `${user.firstName} ${user.lastName}`;
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || user.role === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getCategoryCount = (type: string) => {
    if (type === 'all') return displayUsers.length;
    return displayUsers.filter(user => user.role === type).length;
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

  const handleShowDetails = async (user: any) => {
    console.log('🔵 handleShowDetails appelée pour:', user.email);
    try {
      const userDetails = await getUserById(user.id);
      setSelectedUser(userDetails);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading user details:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'utilisateur');
    }
  };

  const handleEditUser = (user: any) => {
    console.log('✏️ handleEditUser appelée pour:', user.email);
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      location: user.location || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    
    const userName = selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`;
    
    try {
      console.log('⏳ Sauvegarde en cours...');
      await updateUserProfile(selectedUser.id, editForm);
      
      setShowEditModal(false);
      
      Alert.alert(
        '🎉 SUCCÈS !',
        `✅ Profil de ${userName} mis à jour\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nMODIFICATIONS ENREGISTRÉES:\n\n✓ Prénom: ${editForm.firstName}\n✓ Nom: ${editForm.lastName}\n✓ Téléphone: ${editForm.phone}\n✓ Localisation: ${editForm.location}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nLes changements sont effectifs immédiatement !`
      );
      
      console.log('🔄 Rechargement de la liste...');
      await loadUsers();
      console.log('✅ Liste mise à jour !');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert(
        '❌ ERREUR',
        `Impossible de mettre à jour le profil\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nERREUR: ${error.message}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVeuillez réessayer ou vérifier vos informations.`
      );
    }
  };

  const handleResetPassword = (user: any) => {
    console.log('🔐 handleResetPassword appelée pour:', user.email);
    const userName = user.name || `${user.firstName} ${user.lastName}`;
    
    setActionModalContent({
      title: '🔐 Réinitialiser le mot de passe',
      message: `UTILISATEUR: ${userName}\nEMAIL: ${user.email}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📋 ÉTAPES À SUIVRE:\n\n1️⃣ Ouvrez votre terminal\n\n2️⃣ Copiez et exécutez cette commande:\n\nnode scripts/resetUserPassword.js ${user.email} nouveauMdp123\n\n3️⃣ Le mot de passe doit contenir au moins 6 caractères\n\n4️⃣ Informez l'utilisateur de son nouveau mot de passe\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✅ Cette action change le mot de passe dans Firebase Authentication`,
      action: null,
    });
    setShowActionModal(true);
  };

  const handleUserAction = async (user: any, action: 'suspend' | 'activate' | 'delete' | 'approve' | 'promote_admin' | 'demote') => {
    console.log('🎯 handleUserAction appelée - Action:', action, 'User:', user.email);
    
    // Empêcher l'admin de se modifier lui-même
    if (user.id === currentUser?.id && (action === 'delete' || action === 'suspend' || action === 'demote')) {
      Alert.alert('Action impossible', 'Vous ne pouvez pas modifier votre propre compte admin');
      return;
    }

    const userName = user.name || `${user.firstName} ${user.lastName}`;

    // Actions qui fonctionnent directement (via Firestore)
    if (['delete', 'suspend', 'activate', 'promote_admin', 'approve'].includes(action)) {
      let title = '';
      let message = '';
      let confirmText = '';
      
      switch (action) {
        case 'delete':
          title = '🗑️ SUPPRIMER UTILISATEUR';
          message = `UTILISATEUR: ${userName}\nEMAIL: ${user.email}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚠️ Cette action va:\n\n• Marquer l'utilisateur comme supprimé\n• Désactiver son accès à l'app\n• Le cacher de la liste\n\n⚠️ Note: Le compte Firebase Auth restera (mais inutilisable)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVoulez-vous continuer ?`;
          confirmText = 'Oui, supprimer';
          break;
        case 'suspend':
          title = '⏸️ SUSPENDRE COMPTE';
          message = `UTILISATEUR: ${userName}\nEMAIL: ${user.email}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚠️ Cette action va:\n\n• Désactiver l'accès à l'app\n• Empêcher la connexion\n• Marquer comme suspendu\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVoulez-vous continuer ?`;
          confirmText = 'Oui, suspendre';
          break;
        case 'activate':
          title = '▶️ ACTIVER COMPTE';
          message = `UTILISATEUR: ${userName}\nEMAIL: ${user.email}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✅ Cette action va:\n\n• Réactiver l'accès à l'app\n• Permettre la connexion\n• Marquer comme actif\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVoulez-vous continuer ?`;
          confirmText = 'Oui, activer';
          break;
        case 'promote_admin':
          title = '👑 PROMOUVOIR EN ADMIN';
          message = `UTILISATEUR: ${userName}\nEMAIL: ${user.email}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚠️ Cette action va:\n\n• Donner les privilèges admin\n• Accès au dashboard admin\n• Accès à la gestion des utilisateurs\n\n⚠️ Note: Pour des droits complets (Cloud Functions), utilisez:\nnode scripts/promoteToAdmin.js ${user.email}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVoulez-vous continuer ?`;
          confirmText = 'Oui, promouvoir';
          break;
        case 'approve':
          title = '✅ APPROUVER VÉTÉRINAIRE';
          message = `UTILISATEUR: ${userName}\nEMAIL: ${user.email}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✅ Cette action va:\n\n• Approuver la demande de vétérinaire\n• Donner accès à l'espace vétérinaire\n• Activer le compte vétérinaire\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVoulez-vous continuer ?`;
          confirmText = 'Oui, approuver';
          break;
      }

      setActionModalContent({
        title,
        message,
        action: async () => {
          try {
            console.log('⏳ Traitement en cours...');
            
            switch (action) {
              case 'delete':
                await softDeleteUser(user.id);
                Alert.alert(
                  '🎉 SUCCÈS !',
                  `✅ ${userName} a été supprimé\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ Statut: Supprimé\n✓ Accès: Désactivé\n✓ Liste: Caché\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nL'utilisateur ne peut plus se connecter !`
                );
                break;
              case 'suspend':
                await suspendUser(user.id);
                Alert.alert(
                  '🎉 SUCCÈS !',
                  `✅ ${userName} a été suspendu\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ Statut: Suspendu\n✓ Accès: Bloqué\n✓ Connexion: Impossible\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nL'utilisateur ne peut plus se connecter !`
                );
                break;
              case 'activate':
                await activateUser(user.id);
                Alert.alert(
                  '🎉 SUCCÈS !',
                  `✅ ${userName} a été activé\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ Statut: Actif\n✓ Accès: Autorisé\n✓ Connexion: Possible\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nL'utilisateur peut maintenant se connecter !`
                );
                break;
              case 'promote_admin':
                await promoteToAdmin(user.id);
                Alert.alert(
                  '🎉 SUCCÈS !',
                  `✅ ${userName} est maintenant admin\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ Rôle: Administrateur\n✓ Accès: Dashboard admin\n✓ Permissions: Gestion complète\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nL'utilisateur a maintenant les droits admin !`
                );
                break;
              case 'approve':
                await approveVet(user.id);
                Alert.alert(
                  '🎉 SUCCÈS !',
                  `✅ ${userName} a été approuvé(e)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ Statut: Approuvé\n✓ Accès: Espace vétérinaire activé\n✓ Base de données: Mise à jour\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nLe vétérinaire peut maintenant se connecter !`
                );
                break;
            }
            
            await loadUsers();
            setShowActionModal(false);
          } catch (error) {
            console.error('Error performing action:', error);
            Alert.alert(
              '❌ ERREUR',
              `Impossible d'effectuer cette action\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nERREUR: ${error.message}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVeuillez réessayer.`
            );
          }
        },
      });
      setShowActionModal(true);
      return;
    }

    // Actions possibles sans Admin SDK
    let title = '';
    let message = '';
    let description = '';

    switch (action) {
      case 'approve':
        title = '✅ APPROUVER VÉTÉRINAIRE';
        description = 'Cette action va:\n• Approuver la demande de vétérinaire\n• Donner accès à l\'espace vétérinaire\n• Mettre à jour le statut dans Firebase';
        message = `${description}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nUTILISATEUR: ${userName}\nEMAIL: ${user.email}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVoulez-vous continuer ?`;
        break;
      case 'demote':
        title = '⬇️ RÉTROGRADER ADMIN';
        description = 'Cette action va:\n• Retirer les privilèges admin\n• Changer le rôle en "Propriétaire"\n• Limiter l\'accès aux fonctions admin';
        message = `${description}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nUTILISATEUR: ${userName}\nEMAIL: ${user.email}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVoulez-vous continuer ?`;
        break;
    }

    Alert.alert(
      title,
      message,
      [
        { 
          text: '❌ Annuler', 
          style: 'cancel',
          onPress: () => console.log('Action annulée')
        },
        { 
          text: '✅ Confirmer', 
          style: 'default',
          onPress: async () => {
            // Afficher un loader
            console.log('⏳ Traitement en cours...');
            
            try {
              switch (action) {
                case 'approve':
                  await approveVet(user.id);
                  Alert.alert(
                    '🎉 SUCCÈS !',
                    `✅ ${userName} a été approuvé(e)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ Statut: Approuvé\n✓ Accès: Espace vétérinaire activé\n✓ Base de données: Mise à jour\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nLe vétérinaire peut maintenant se connecter !`
                  );
                  break;
                case 'demote':
                  await updateUserRole(user.id, 'owner');
                  Alert.alert(
                    '🎉 SUCCÈS !',
                    `✅ ${userName} n'est plus administrateur\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ Nouveau rôle: Propriétaire\n✓ Privilèges admin: Retirés\n✓ Base de données: Mise à jour\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nL'utilisateur a maintenant un accès standard.`
                  );
                  break;
              }
              // Recharger les utilisateurs
              console.log('🔄 Rechargement de la liste...');
              await loadUsers();
              console.log('✅ Liste mise à jour !');
            } catch (error) {
              console.error('Error performing action:', error);
              Alert.alert(
                '❌ ERREUR',
                `Impossible d'effectuer cette action\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nERREUR: ${error.message}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVeuillez réessayer ou contacter le support technique.`
              );
            }
          }
        }
      ]
    );
  };

  const renderUserCard = (user: any) => {
    const userName = user.name || `${user.firstName} ${user.lastName}`;
    const isCurrentUser = user.id === currentUser?.id;
    
    return (
      <View key={user.id} style={styles.userCard}>
        <Image 
          source={{ uri: user.avatarUrl }}
          style={styles.userAvatar}
        />
        
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{userName}{isCurrentUser && ' (Vous)'}</Text>
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
            {/* Boutons principaux : Détails, Modifier, Réinitialiser mot de passe */}
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.teal }]}
              onPress={() => handleShowDetails(user)}
            >
              <Ionicons name="information-circle" size={18} color={colors.white} />
              <Text style={styles.actionButtonText}>Détails</Text>
            </TouchableOpacity>
            
            {!isCurrentUser && (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                  onPress={() => handleEditUser(user)}
                >
                  <Ionicons name="create" size={18} color={colors.white} />
                  <Text style={styles.actionButtonText}>Modifier</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                  onPress={() => handleResetPassword(user)}
                >
                  <Ionicons name="key" size={18} color={colors.white} />
                  <Text style={styles.actionButtonText}>Mot de passe</Text>
                </TouchableOpacity>
              </>
            )}
            
            {/* Note: Plus besoin d'approuver les vétérinaires manuellement, 
                ils reçoivent un email de vérification automatique comme les propriétaires */}
            
            {/* Promouvoir en admin */}
            {user.role !== 'admin' && !isCurrentUser && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                onPress={() => handleUserAction(user, 'promote_admin')}
              >
                <Ionicons name="shield-checkmark" size={18} color={colors.white} />
                <Text style={styles.actionButtonText}>Promouvoir Admin</Text>
              </TouchableOpacity>
            )}
            
            {/* Rétrograder admin */}
            {user.role === 'admin' && !isCurrentUser && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#9B59B6' }]}
                onPress={() => handleUserAction(user, 'demote')}
              >
                <Ionicons name="remove-circle" size={18} color={colors.white} />
                <Text style={styles.actionButtonText}>Rétrograder</Text>
              </TouchableOpacity>
            )}
            
            {/* Suspendre/Activer */}
            {user.status === 'active' && !isCurrentUser && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#607D8B' }]}
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
            
            {/* Supprimer */}
            {!isCurrentUser && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
                onPress={() => handleUserAction(user, 'delete')}
              >
                <Ionicons name="trash" size={18} color={colors.white} />
                <Text style={styles.actionButtonText}>Supprimer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
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
        <Text style={styles.title}>Gestion des utilisateurs</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadUsers}
        >
          <Ionicons name="refresh" size={24} color={colors.teal} />
        </TouchableOpacity>
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
          { key: 'owner', label: 'Propriétaires' },
          { key: 'vet', label: 'Vétérinaires' },
          { key: 'admin', label: 'Admins' },
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

      {/* Modal de détails */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📋 Détails de l'utilisateur</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Ionicons name="close" size={28} color={colors.navy} />
              </TouchableOpacity>
            </View>
            
            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>👤 Nom complet</Text>
                  <Text style={styles.detailValue}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>📧 Email</Text>
                  <Text style={styles.detailValue}>{selectedUser.email}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>📱 Téléphone</Text>
                  <Text style={styles.detailValue}>{selectedUser.phone || 'Non renseigné'}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>📍 Localisation</Text>
                  <Text style={styles.detailValue}>{selectedUser.location || 'Non renseigné'}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>🔰 Rôle</Text>
                  <Text style={styles.detailValue}>{getRoleLabel(selectedUser.role)}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>⚡ Statut</Text>
                  <Text style={styles.detailValue}>{getStatusLabel(selectedUser.status)}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>🆔 ID</Text>
                  <Text style={[styles.detailValue, { fontSize: 12 }]}>{selectedUser.id}</Text>
                </View>
                
                {selectedUser.role === 'vet' && (
                  <>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>🏥 Spécialité</Text>
                      <Text style={styles.detailValue}>{selectedUser.specialty || 'Non renseigné'}</Text>
                    </View>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>🏢 Clinique</Text>
                      <Text style={styles.detailValue}>{selectedUser.clinicName || 'Non renseigné'}</Text>
                    </View>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>✅ Approuvé</Text>
                      <Text style={styles.detailValue}>{selectedUser.approved ? 'Oui' : 'Non'}</Text>
                    </View>
                  </>
                )}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal d'édition */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Modifier l'utilisateur</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={28} color={colors.navy} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.firstName}
                  onChangeText={(text) => setEditForm({...editForm, firstName: text})}
                  placeholder="Prénom"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.lastName}
                  onChangeText={(text) => setEditForm({...editForm, lastName: text})}
                  placeholder="Nom"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Téléphone</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                  placeholder="+32 ..."
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Localisation</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({...editForm, location: text})}
                  placeholder="Ville, Pays"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalSaveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal d'action (confirmation) */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{actionModalContent.title}</Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <Ionicons name="close" size={28} color={colors.navy} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.actionMessageText}>{actionModalContent.message}</Text>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowActionModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>❌ Annuler</Text>
              </TouchableOpacity>
              
              {actionModalContent.action && (
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalSaveButton]}
                  onPress={actionModalContent.action}
                >
                  <Text style={styles.modalSaveButtonText}>✅ Confirmer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
  refreshButton: {
    padding: spacing.xs,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxHeight: '80%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  modalBody: {
    padding: spacing.lg,
    maxHeight: 400,
  },
  detailSection: {
    marginBottom: spacing.lg,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
    fontWeight: typography.fontWeight.medium,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  modalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.lightGray,
  },
  modalCancelButtonText: {
    color: colors.gray,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  modalSaveButton: {
    backgroundColor: colors.teal,
  },
  modalSaveButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  modalCloseButton: {
    backgroundColor: colors.teal,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  actionMessageText: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
});

