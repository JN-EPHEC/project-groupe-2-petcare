import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getDocumentsByOwnerId } from '../../services/firestoreService';

interface DocumentsScreenProps {
  navigation: any;
}

export const DocumentsScreen: React.FC<DocumentsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentPet, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allDocuments, setAllDocuments] = useState<any[]>([]);

  useEffect(() => {
    const loadDocuments = async () => {
      if (user?.id) {
        try {
          const docs = await getDocumentsByOwnerId(user.id);
          setAllDocuments(docs);
        } catch (error) {
          console.error('Error loading documents:', error);
          setAllDocuments([]);
        }
      }
    };
    loadDocuments();
  }, [user?.id]);

  // Filter documents by search query
  const documents = searchQuery.trim()
    ? allDocuments.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.uploadDate.includes(searchQuery)
      )
    : allDocuments;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color={colors.navy} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.petInfo}>
          <View style={styles.petImagePlaceholder}>
            <Ionicons name="paw" size={35} color={colors.navy} />
          </View>
          <Text style={styles.petName}>{currentPet?.name || 'Pet'}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.black} />
            <Text style={styles.location}>{currentPet?.location || 'Location'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('health.documents.title')}</Text>
        </View>

        {/* Search Bar */}
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

        <View style={styles.documentsContainer}>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <TouchableOpacity key={doc.id} style={styles.documentItem}>
                <Ionicons name="document-text" size={40} color={colors.navy} />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  <Text style={styles.documentDate}>{t('health.documents.uploadedOn')} {doc.uploadDate}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyTitle}>
                {searchQuery.trim() ? 'Aucun document trouvé' : t('health.documents.noDocuments')}
              </Text>
              {searchQuery.trim() ? (
                <Text style={styles.emptyText}>
                  Essayez avec un autre nom de document
                </Text>
              ) : (
                <Text style={styles.emptyText}>
                  Cliquez sur le bouton + pour ajouter un document
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddDocument', { petId: currentPet?.id })}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  petInfo: {
    alignItems: 'center',
  },
  petImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  petName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  location: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
  },
  content: {
    backgroundColor: colors.lightBlue,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    minHeight: 400,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 45,
    marginBottom: spacing.lg,
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
  documentsContainer: {
    gap: spacing.lg,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  documentDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
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
  noDocumentsText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    marginTop: spacing.xl,
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
});

