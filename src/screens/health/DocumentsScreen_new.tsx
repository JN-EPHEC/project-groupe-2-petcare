import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import {
  getDocumentsByOwnerId,
  deleteDocument,
  filterDocumentsByCategory,
  searchDocuments,
  DOCUMENT_CATEGORIES,
  Document,
  DocumentCategory,
  getCategoryIcon,
  getCategoryLabel,
  formatFileSize,
} from '../../services/documentService';

interface DocumentsScreenProps {
  navigation: any;
  route: any;
}

export const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ navigation, route }) => {
  const { user, pets } = useAuth();
  const preselectedPetId = route.params?.petId;

  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const docs = await getDocumentsByOwnerId(user.id);
      
      // Filtrer par pet si préselectionné
      const filtered = preselectedPetId
        ? docs.filter(d => d.petId === preselectedPetId)
        : docs;
      
      setAllDocuments(filtered);
      setFilteredDocuments(filtered);
    } catch (error) {
      console.error('Error loading documents:', error);
      setAllDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, preselectedPetId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [loadDocuments])
  );

  useEffect(() => {
    let filtered = filterDocumentsByCategory(allDocuments, selectedCategory);
    filtered = searchDocuments(filtered, searchQuery);
    setFilteredDocuments(filtered);
  }, [allDocuments, selectedCategory, searchQuery]);

  const handleDeleteDocument = (doc: Document) => {
    Alert.alert(
      'Supprimer le document',
      `Êtes-vous sûr de vouloir supprimer "${doc.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(doc);
              Alert.alert('Succès', 'Document supprimé');
              loadDocuments();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le document');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Chargement des documents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddDocument', { petId: preselectedPetId })}>
          <Ionicons name="add-circle" size={28} color={colors.teal} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.gray}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowCategoryFilter(!showCategoryFilter)}
        >
          <Ionicons name="filter" size={20} color={colors.navy} />
          <Text style={styles.filterButtonText}>
            {selectedCategory === 'all' ? 'Toutes les catégories' : getCategoryLabel(selectedCategory)}
          </Text>
          <Ionicons name={showCategoryFilter ? 'chevron-up' : 'chevron-down'} size={20} color={colors.navy} />
        </TouchableOpacity>

        {showCategoryFilter && (
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.filterOption, selectedCategory === 'all' && styles.filterOptionActive]}
              onPress={() => {
                setSelectedCategory('all');
                setShowCategoryFilter(false);
              }}
            >
              <Text style={styles.filterOptionText}>📁 Toutes les catégories</Text>
              {selectedCategory === 'all' && <Ionicons name="checkmark" size={20} color={colors.teal} />}
            </TouchableOpacity>

            {DOCUMENT_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.filterOption, selectedCategory === cat.value && styles.filterOptionActive]}
                onPress={() => {
                  setSelectedCategory(cat.value);
                  setShowCategoryFilter(false);
                }}
              >
                <Text style={styles.filterOptionText}>{cat.label}</Text>
                {selectedCategory === cat.value && <Ionicons name="checkmark" size={20} color={colors.teal} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Document List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Aucun résultat' : 'Aucun document'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Essayez une autre recherche'
                : 'Commencez par ajouter votre premier document'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddDocument', { petId: preselectedPetId })}
              >
                <Ionicons name="add-circle" size={24} color={colors.white} />
                <Text style={styles.addButtonText}>Ajouter un document</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredDocuments.map(doc => {
            const pet = pets.find(p => p.id === doc.petId);
            return (
              <TouchableOpacity
                key={doc.id}
                style={styles.documentCard}
                onPress={() => navigation.navigate('DocumentViewer', { documentId: doc.id })}
                activeOpacity={0.7}
              >
                {/* Icon */}
                <View style={[styles.documentIcon, { backgroundColor: getIconColor(doc.category) }]}>
                  <Text style={styles.documentIconText}>{getCategoryIcon(doc.category)}</Text>
                </View>

                {/* Info */}
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle} numberOfLines={1}>
                    {doc.title}
                  </Text>
                  <View style={styles.documentMeta}>
                    <Text style={styles.documentPet}>
                      {pet?.emoji} {doc.petName}
                    </Text>
                    <Text style={styles.documentDate}>
                      {new Date(doc.date).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <Text style={styles.documentCategory}>
                    {getCategoryLabel(doc.category, doc.customCategory)}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.documentActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('AddDocument', { documentId: doc.id, edit: true });
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.navy} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.red} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {filteredDocuments.length > 0 && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('AddDocument', { petId: preselectedPetId })}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const getIconColor = (category: DocumentCategory): string => {
  const colors_map: Record<DocumentCategory, string> = {
    vaccination: '#4CAF50',
    surgery: '#F44336',
    analysis: '#2196F3',
    insurance: '#FF9800',
    invoice: '#9C27B0',
    prescription: '#00BCD4',
    xray: '#607D8B',
    other: '#757575',
  };
  return colors_map[category] || '#757575';
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
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 45,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  filterContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  filterButtonText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
  },
  filterOptions: {
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: 'hidden',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  filterOptionActive: {
    backgroundColor: colors.lightBlue,
  },
  filterOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  documentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  documentIconText: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  documentPet: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  documentDate: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  documentCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  documentActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});



