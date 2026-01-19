import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  Linking,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { PetSelector } from '../../components';
import { getDocumentsByOwnerId, deleteDocument as deleteDocumentFromFirestore, type Document } from '../../services/firestoreService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DocumentsScreenProps {
  navigation: any;
}

export const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ navigation }) => {
  const { user, pets } = useAuth();
  const [selectedPetId, setSelectedPetId] = useState<string | 'all'>('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDocuments = async () => {
    if (user?.id) {
      try {
        console.log('📄 Chargement des documents...');
        const docs = await getDocumentsByOwnerId(user.id);
        console.log('✅ Documents chargés:', docs.length);
        setDocuments(docs);
      } catch (error) {
        console.error('❌ Erreur chargement documents:', error);
        setDocuments([]);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDocuments();
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getPetName = (petId: string): string => {
    const pet = pets.find((p) => p.id === petId);
    return pet?.name || 'Animal inconnu';
  };

  const getDocumentIcon = (type: string): any => {
    switch (type) {
      case 'vaccination':
        return 'medical';
      case 'medical':
        return 'heart';
      case 'analysis':
        return 'flask';
      case 'prescription':
        return 'document-text';
      case 'xray':
        return 'scan';
      case 'other':
      default:
        return 'document';
    }
  };

  const getDocumentColor = (type: string): string => {
    switch (type) {
      case 'vaccination':
        return '#4CAF50';
      case 'medical':
        return '#2196F3';
      case 'analysis':
        return '#9C27B0';
      case 'prescription':
        return '#FF9800';
      case 'xray':
        return '#F44336';
      case 'other':
      default:
        return colors.gray;
    }
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDoc(doc);
    setShowDetailsModal(true);
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      if (doc.fileUrl) {
        console.log('📥 Téléchargement du document:', doc.fileUrl);
        
        if (Platform.OS === 'web') {
          // Sur web, ouvrir dans un nouvel onglet
          window.open(doc.fileUrl, '_blank');
        } else {
          // Sur mobile, ouvrir avec le navigateur système
          await Linking.openURL(doc.fileUrl);
        }
      } else {
        if (Platform.OS === 'web') {
          window.alert('URL du document non disponible');
        } else {
          Alert.alert('Erreur', 'URL du document non disponible');
        }
      }
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      if (Platform.OS === 'web') {
        window.alert('Impossible de télécharger le document');
      } else {
        Alert.alert('Erreur', 'Impossible de télécharger le document');
      }
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer "${doc.title}" ?`;

    if (Platform.OS === 'web') {
      if (!window.confirm(confirmMessage)) {
        return;
      }
      await performDelete(doc);
    } else {
      Alert.alert(
        'Supprimer le document',
        confirmMessage,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => performDelete(doc),
          },
        ]
      );
    }
  };

  const performDelete = async (doc: Document) => {
    try {
      setIsDeleting(true);
      console.log('🗑️ Suppression du document:', doc.id);
      
      await deleteDocumentFromFirestore(doc.id);
      
      console.log('✅ Document supprimé avec succès');
      
      // Fermer le modal si ouvert
      if (showDetailsModal) {
        setShowDetailsModal(false);
        setSelectedDoc(null);
      }
      
      // Recharger la liste
      await loadDocuments();
      
      if (Platform.OS === 'web') {
        window.alert('Document supprimé avec succès');
      } else {
        Alert.alert('Succès', 'Document supprimé avec succès');
      }
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      if (Platform.OS === 'web') {
        window.alert('Erreur lors de la suppression');
      } else {
        Alert.alert('Erreur', 'Impossible de supprimer le document');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const renderDocumentCard = (doc: Document) => {
    const iconColor = getDocumentColor(doc.type || 'other');

  return (
      <TouchableOpacity 
        key={doc.id}
        style={styles.documentCard}
        onPress={() => handleViewDocument(doc)}
        activeOpacity={0.7}
      >
        <View style={[styles.documentIcon, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={getDocumentIcon(doc.type || 'other')} size={28} color={iconColor} />
        </View>
        
        <View style={styles.documentContent}>
          <Text style={styles.documentName} numberOfLines={2}>
            {doc.title || 'Document sans nom'}
          </Text>
          <Text style={styles.documentPet}>🐾 {getPetName(doc.petId)}</Text>
          <Text style={styles.documentDate}>📅 {formatDate(doc.uploadDate || doc.createdAt)}</Text>
        </View>

        <View style={styles.documentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDownloadDocument(doc);
            }}
          >
            <Ionicons name="download-outline" size={20} color={colors.teal} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteDocument(doc);
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('HomeTab', { screen: 'Home' })}>
            <Ionicons name="arrow-back" size={28} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Documents</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('HomeTab', { screen: 'Home' })}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Documents</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddDocument')}>
          <Ionicons name="add-circle-outline" size={28} color={colors.teal} />
        </TouchableOpacity>
          </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{documents.length}</Text>
          <Text style={styles.statLabel}>Documents</Text>
          </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{pets.length}</Text>
          <Text style={styles.statLabel}>Animaux</Text>
        </View>
      </View>

      {/* Pet Selector */}
      {pets && pets.length > 1 && (
        <PetSelector
          pets={pets}
          selectedPetId={selectedPetId}
          onSelectPet={setSelectedPetId}
          showAllOption={true}
        />
      )}

      {/* Documents List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {(() => {
          const filteredDocuments = selectedPetId === 'all'
            ? documents
            : documents.filter(doc => doc.petId === selectedPetId);
          
          return filteredDocuments.length > 0 ? (
            filteredDocuments.map(renderDocumentCard)
          ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={80} color={colors.lightGray} />
            <Text style={styles.emptyTitle}>Aucun document</Text>
            <Text style={styles.emptySubtitle}>
              {selectedPetId === 'all' 
                ? 'Ajoutez vos premiers documents médicaux'
                : 'Aucun document pour cet animal'}
            </Text>
          </View>
          );
        })()}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddDocument')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>

      {/* Document Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedDoc && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Détails du document</Text>
                  <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                    <Ionicons name="close" size={28} color={colors.navy} />
                  </TouchableOpacity>
        </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
                  {/* Document Preview */}
                  <View style={styles.previewContainer}>
                    {selectedDoc.fileType === 'image' ? (
                      <View style={styles.imagePreviewContainer}>
                        <Image
                          source={{ uri: selectedDoc.fileUrl }}
                          style={styles.previewImage}
                          resizeMode="contain"
                        />
                      </View>
                    ) : selectedDoc.fileType === 'pdf' ? (
                      <View style={styles.pdfPreviewContainer}>
                        <View style={styles.pdfIconWrapper}>
                          <Ionicons name="document-text" size={80} color={colors.teal} />
                          <Text style={styles.pdfPreviewText}>Document PDF</Text>
                          <Text style={styles.pdfFileName} numberOfLines={2}>
                            {selectedDoc.fileName || 'document.pdf'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.viewPdfButton}
                          onPress={() => {
                            if (Platform.OS === 'web') {
                              window.open(selectedDoc.fileUrl, '_blank');
                            } else {
                              Linking.openURL(selectedDoc.fileUrl);
                            }
                          }}
                        >
                          <Ionicons name="eye" size={20} color={colors.white} />
                          <Text style={styles.viewPdfButtonText}>Ouvrir le PDF</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={[styles.modalIconContainer, { backgroundColor: `${getDocumentColor(selectedDoc.type || 'other')}15` }]}>
                        <Ionicons
                          name={getDocumentIcon(selectedDoc.type || 'other')}
                          size={48}
                          color={getDocumentColor(selectedDoc.type || 'other')}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📄 Titre</Text>
                    <Text style={styles.detailValue}>{selectedDoc.title || 'Sans titre'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🐾 Animal</Text>
                    <Text style={styles.detailValue}>{getPetName(selectedDoc.petId)}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📅 Date d'upload</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedDoc.uploadDate || selectedDoc.createdAt)}
                    </Text>
        </View>

                  {selectedDoc.type && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>🏷️ Type</Text>
                      <Text style={styles.detailValue}>{selectedDoc.type}</Text>
                    </View>
                  )}

                  {selectedDoc.category && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>📂 Catégorie</Text>
                      <Text style={styles.detailValue}>{selectedDoc.category}</Text>
                    </View>
                  )}

                  {selectedDoc.notes && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>📝 Notes</Text>
                      <Text style={styles.detailValue}>{selectedDoc.notes}</Text>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.downloadButton]}
                    onPress={() => handleDownloadDocument(selectedDoc)}
                  >
                    <Ionicons name="download" size={20} color={colors.white} />
                    <Text style={styles.modalButtonText}>Télécharger</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={() => handleDeleteDocument(selectedDoc)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <>
                        <Ionicons name="trash" size={20} color={colors.white} />
                        <Text style={styles.modalButtonText}>Supprimer</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
              )}
            </View>
        </View>
      </Modal>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.white,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    fontWeight: typography.fontWeight.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 4,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: spacing.md,
  },
  documentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentContent: {
    flex: 1,
  },
  documentName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  documentPet: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: 2,
  },
  documentDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  documentActions: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  modalBody: {
    padding: spacing.xl,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  previewContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  imagePreviewContainer: {
    width: '100%',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
    maxHeight: 400,
  },
  previewImage: {
    width: '100%',
    height: 300,
  },
  pdfPreviewContainer: {
    width: '100%',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    minHeight: 200,
  },
  pdfIconWrapper: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pdfPreviewText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
  },
  pdfFileName: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  viewPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.teal,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  viewPdfButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: spacing.lg,
  },
  detailRow: {
    marginBottom: spacing.lg,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.xl,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  downloadButton: {
    backgroundColor: colors.teal,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  modalButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
