import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import {
  getAssignmentRequestsByVetId,
  acceptAssignmentRequest,
  rejectAssignmentRequest,
  addNotification,
  PetAssignmentRequest,
} from '../../services/firestoreService';

interface VetAssignmentRequestsScreenProps {
  navigation: any;
}

export const VetAssignmentRequestsScreen: React.FC<VetAssignmentRequestsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PetAssignmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const loadRequests = async () => {
    if (!user?.id) return;
    
    try {
      console.log('📋 Chargement des demandes d\'assignation...');
      const allRequests = await getAssignmentRequestsByVetId(user.id);
      setRequests(allRequests);
      console.log('✅ Demandes chargées:', allRequests.length);
    } catch (error) {
      console.error('❌ Erreur chargement demandes:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [user?.id])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRequests();
  };

  const handleAccept = async (request: PetAssignmentRequest) => {
    try {
      setProcessingRequestId(request.id);
      console.log('✅ Acceptation de la demande:', request.id);

      await acceptAssignmentRequest(request.id);

      // Créer une notification pour le propriétaire
      await addNotification({
        userId: request.ownerId,
        type: 'pet_assignment_accepted',
        title: 'Demande acceptée ! 🎉',
        message: `Dr. ${request.vetName} a accepté de prendre ${request.petName} en charge. Vous pouvez maintenant prendre votre premier rendez-vous !`,
        read: false,
        data: {
          requestId: request.id,
          petId: request.petId,
          petName: request.petName,
          vetId: request.vetId,
          vetName: request.vetName,
        },
      });

      // Rafraîchir la liste
      await loadRequests();

      if (Platform.OS === 'web') {
        window.alert(`Vous avez accepté de prendre en charge ${request.petName}. Le propriétaire a été notifié.`);
      } else {
        Alert.alert(
          'Demande acceptée',
          `Vous avez accepté de prendre en charge ${request.petName}. Le propriétaire a été notifié.`
        );
      }
    } catch (error) {
      console.error('❌ Erreur acceptation demande:', error);
      if (Platform.OS === 'web') {
        window.alert('Impossible d\'accepter la demande. Veuillez réessayer.');
      } else {
        Alert.alert('Erreur', 'Impossible d\'accepter la demande. Veuillez réessayer.');
      }
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (request: PetAssignmentRequest) => {
    const confirmMessage = `Êtes-vous sûr de vouloir refuser ${request.petName} de ${request.ownerName} ?`;
    
    const confirmed = Platform.OS === 'web'
      ? window.confirm(confirmMessage)
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Confirmer le refus',
            confirmMessage,
            [
              { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Refuser', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmed) return;

    try {
      setProcessingRequestId(request.id);
      console.log('❌ Refus de la demande:', request.id);

      await rejectAssignmentRequest(request.id);

      // Créer une notification pour le propriétaire
      await addNotification({
        userId: request.ownerId,
        type: 'pet_assignment_rejected',
        title: 'Demande refusée',
        message: `Dr. ${request.vetName} ne peut pas prendre ${request.petName} en charge pour le moment. Vous pouvez contacter un autre vétérinaire.`,
        read: false,
        data: {
          requestId: request.id,
          petId: request.petId,
          petName: request.petName,
          vetId: request.vetId,
          vetName: request.vetName,
        },
      });

      // Rafraîchir la liste
      await loadRequests();

      if (Platform.OS === 'web') {
        window.alert('Demande refusée. Le propriétaire a été notifié.');
      } else {
        Alert.alert('Demande refusée', 'Le propriétaire a été notifié.');
      }
    } catch (error) {
      console.error('❌ Erreur refus demande:', error);
      if (Platform.OS === 'web') {
        window.alert('Impossible de refuser la demande. Veuillez réessayer.');
      } else {
        Alert.alert('Erreur', 'Impossible de refuser la demande. Veuillez réessayer.');
      }
    } finally {
      setProcessingRequestId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <View style={[styles.statusBadge, styles.statusPending]}>
            <Ionicons name="time-outline" size={14} color={colors.orange} />
            <Text style={[styles.statusText, { color: colors.orange }]}>En attente</Text>
          </View>
        );
      case 'accepted':
        return (
          <View style={[styles.statusBadge, styles.statusAccepted]}>
            <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
            <Text style={[styles.statusText, { color: '#4CAF50' }]}>Acceptée</Text>
          </View>
        );
      case 'rejected':
        return (
          <View style={[styles.statusBadge, styles.statusRejected]}>
            <Ionicons name="close-circle" size={14} color={colors.red} />
            <Text style={[styles.statusText, { color: colors.red }]}>Refusée</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demandes de prise en charge</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.teal} />
        }
      >
        {/* Demandes en attente */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color={colors.orange} />
              <Text style={styles.sectionTitle}>En attente ({pendingRequests.length})</Text>
            </View>

            {pendingRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  {request.petAvatar?.startsWith('http') ? (
                    <Image source={{ uri: request.petAvatar }} style={styles.petAvatar} />
                  ) : (
                    <View style={styles.petEmojiContainer}>
                      <Text style={styles.petEmoji}>{request.petAvatar || '🐾'}</Text>
                    </View>
                  )}
                  <View style={styles.requestInfo}>
                    <Text style={styles.petName}>{request.petName}</Text>
                    <Text style={styles.petDetails}>
                      {request.petType} • {request.petBreed}
                    </Text>
                    <Text style={styles.ownerName}>
                      <Ionicons name="person" size={12} color={colors.gray} /> {request.ownerName}
                    </Text>
                    <Text style={styles.requestDate}>
                      <Ionicons name="calendar-outline" size={12} color={colors.gray} /> {formatDate(request.createdAt)}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton, processingRequestId === request.id && styles.actionButtonDisabled]}
                    onPress={() => handleAccept(request)}
                    disabled={processingRequestId === request.id}
                  >
                    {processingRequestId === request.id ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                        <Text style={styles.actionButtonText}>Accepter</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton, processingRequestId === request.id && styles.actionButtonDisabled]}
                    onPress={() => handleReject(request)}
                    disabled={processingRequestId === request.id}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.red} />
                    <Text style={[styles.actionButtonText, { color: colors.red }]}>Refuser</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Demandes traitées */}
        {processedRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={colors.gray} />
              <Text style={styles.sectionTitle}>Historique ({processedRequests.length})</Text>
            </View>

            {processedRequests.map((request) => (
              <View key={request.id} style={[styles.requestCard, styles.processedCard]}>
                <View style={styles.requestHeader}>
                  {request.petAvatar?.startsWith('http') ? (
                    <Image source={{ uri: request.petAvatar }} style={styles.petAvatar} />
                  ) : (
                    <View style={styles.petEmojiContainer}>
                      <Text style={styles.petEmoji}>{request.petAvatar || '🐾'}</Text>
                    </View>
                  )}
                  <View style={styles.requestInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.petName}>{request.petName}</Text>
                      {getStatusBadge(request.status)}
                    </View>
                    <Text style={styles.petDetails}>
                      {request.petType} • {request.petBreed}
                    </Text>
                    <Text style={styles.ownerName}>
                      <Ionicons name="person" size={12} color={colors.gray} /> {request.ownerName}
                    </Text>
                    <Text style={styles.requestDate}>
                      <Ionicons name="calendar-outline" size={12} color={colors.gray} /> {formatDate(request.processedAt || request.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* État vide */}
        {requests.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>Aucune demande</Text>
            <Text style={styles.emptyText}>
              Les demandes de prise en charge apparaîtront ici
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  requestCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  processedCard: {
    opacity: 0.7,
  },
  requestHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  petAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  petEmojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petEmoji: {
    fontSize: 32,
  },
  requestInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  petName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  petDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  ownerName: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xxs,
  },
  requestDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.md,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusAccepted: {
    backgroundColor: '#E8F5E9',
  },
  statusRejected: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.red,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
  },
});


