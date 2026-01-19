import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getAllArticles, createArticle, updateArticle, deleteArticle } from '../../services/firestoreService';
import { BlogArticle } from '../../types/premium';

interface AdminBlogScreenProps {
  navigation: any;
}

export const AdminBlogScreen: React.FC<AdminBlogScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('health');
  const [species, setSpecies] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  
  const categories = [
    { id: 'emergency', label: 'Urgences' },
    { id: 'species', label: 'Espèces' },
    { id: 'nutrition', label: 'Alimentation' },
    { id: 'behavior', label: 'Comportement' },
    { id: 'health', label: 'Santé' },
  ];
  
  const speciesOptions = ['dog', 'cat', 'bird', 'reptile', 'other'];
  
  useEffect(() => {
    loadArticles();
  }, []);
  
  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const data = await getAllArticles();
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateNew = () => {
    setEditingArticle(null);
    setTitle('');
    setCategory('health');
    setSpecies([]);
    setExcerpt('');
    setContent('');
    setImageUrl('');
    setTags('');
    setStatus('draft');
    setShowModal(true);
  };
  
  const handleEdit = (article: BlogArticle) => {
    setEditingArticle(article);
    setTitle(article.title);
    setCategory(article.category);
    setSpecies(article.species);
    setExcerpt(article.excerpt);
    setContent(article.content);
    setImageUrl(article.imageUrl);
    setTags(article.tags.join(', '));
    setStatus(article.status);
    setShowModal(true);
  };
  
  const handleSave = async () => {
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const articleData = {
        title: title.trim(),
        category: category as any,
        species: species as any,
        excerpt: excerpt.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || 'https://via.placeholder.com/800x400',
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        authorId: user?.id || '',
        authorName: `${user?.firstName} ${user?.lastName}`,
        status,
        ...(status === 'published' && !editingArticle?.publishedAt ? { publishedAt: new Date().toISOString() } : {})
      };
      
      if (editingArticle) {
        await updateArticle(editingArticle.id, articleData);
      } else {
        await createArticle(articleData);
      }
      
      setShowModal(false);
      await loadArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'article');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = (article: BlogArticle) => {
    Alert.alert(
      'Supprimer l\'article',
      `Êtes-vous sûr de vouloir supprimer "${article.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteArticle(article.id);
              await loadArticles();
            } catch (error) {
              console.error('Error deleting article:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'article');
            }
          }
        }
      ]
    );
  };
  
  const toggleSpecies = (sp: string) => {
    setSpecies(prev => 
      prev.includes(sp) 
        ? prev.filter(s => s !== sp)
        : [...prev, sp]
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gestion du Blog</Text>
          <Text style={styles.headerSubtitle}>{articles.length} articles</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateNew}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : articles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.lightGray} />
            <Text style={styles.emptyText}>Aucun article</Text>
            <Text style={styles.emptySubtext}>Créez votre premier article</Text>
          </View>
        ) : (
          articles.map(article => (
            <View key={article.id} style={styles.articleCard}>
              <View style={styles.articleHeader}>
                <View style={styles.articleInfo}>
                  <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                  <Text style={styles.articleMeta}>
                    {article.category} • {article.viewCount || 0} vues
                  </Text>
                </View>
                
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: article.status === 'published' ? '#4CAF50' : '#FF9800' }
                ]}>
                  <Text style={styles.statusText}>
                    {article.status === 'published' ? 'Publié' : 'Brouillon'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.articleActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEdit(article)}
                >
                  <Ionicons name="create-outline" size={20} color={colors.teal} />
                  <Text style={styles.actionButtonText}>Éditer</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(article)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                  <Text style={[styles.actionButtonText, { color: colors.error }]}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      
      {/* Modal de création/édition */}
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => !isSaving && setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingArticle ? 'Éditer l\'article' : 'Nouvel article'}
            </Text>
            <TouchableOpacity 
              onPress={() => !isSaving && setShowModal(false)}
              disabled={isSaving}
            >
              <Ionicons name="close" size={28} color={colors.navy} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Titre de l'article"
              placeholderTextColor={colors.gray}
              editable={!isSaving}
            />
            
            <Text style={styles.label}>Catégorie *</Text>
            <View style={styles.categorySelector}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    category === cat.id && styles.categoryOptionSelected
                  ]}
                  onPress={() => setCategory(cat.id)}
                  disabled={isSaving}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    category === cat.id && styles.categoryOptionTextSelected
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Espèces concernées</Text>
            <View style={styles.speciesSelector}>
              {speciesOptions.map(sp => (
                <TouchableOpacity
                  key={sp}
                  style={[
                    styles.speciesChip,
                    species.includes(sp) && styles.speciesChipSelected
                  ]}
                  onPress={() => toggleSpecies(sp)}
                  disabled={isSaving}
                >
                  <Text style={[
                    styles.speciesChipText,
                    species.includes(sp) && styles.speciesChipTextSelected
                  ]}>
                    {sp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.label}>Résumé *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={excerpt}
              onChangeText={setExcerpt}
              placeholder="Court résumé de l'article"
              placeholderTextColor={colors.gray}
              multiline
              numberOfLines={3}
              editable={!isSaving}
            />
            
            <Text style={styles.label}>Contenu (Markdown) *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { height: 200 }]}
              value={content}
              onChangeText={setContent}
              placeholder="Contenu complet de l'article (supporte Markdown)"
              placeholderTextColor={colors.gray}
              multiline
              editable={!isSaving}
            />
            
            <Text style={styles.label}>URL de l'image</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={colors.gray}
              editable={!isSaving}
            />
            
            <Text style={styles.label}>Tags (séparés par des virgules)</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="santé, chien, alimentation"
              placeholderTextColor={colors.gray}
              editable={!isSaving}
            />
            
            <Text style={styles.label}>Statut</Text>
            <View style={styles.statusSelector}>
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  status === 'draft' && styles.statusOptionSelected
                ]}
                onPress={() => setStatus('draft')}
                disabled={isSaving}
              >
                <Text style={[
                  styles.statusOptionText,
                  status === 'draft' && styles.statusOptionTextSelected
                ]}>
                  Brouillon
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  status === 'published' && styles.statusOptionSelected
                ]}
                onPress={() => setStatus('published')}
                disabled={isSaving}
              >
                <Text style={[
                  styles.statusOptionText,
                  status === 'published' && styles.statusOptionTextSelected
                ]}>
                  Publié
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={24} color={colors.white} />
                  <Text style={styles.saveButtonText}>
                    {editingArticle ? 'Mettre à jour' : 'Créer l\'article'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    backgroundColor: colors.navy,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.lightBlue,
    marginTop: spacing.xs,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.md,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  articleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  articleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  articleTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  articleMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  articleActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightBlue,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  modalContent: {
    flex: 1,
    padding: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: '#F8FAFB',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#F8FAFB',
    borderWidth: 2,
    borderColor: colors.lightGray,
  },
  categoryOptionSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  categoryOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  categoryOptionTextSelected: {
    color: colors.white,
  },
  speciesSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  speciesChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: '#F8FAFB',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  speciesChipSelected: {
    backgroundColor: colors.lightBlue,
    borderColor: colors.teal,
  },
  speciesChipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.gray,
  },
  speciesChipTextSelected: {
    color: colors.teal,
  },
  statusSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#F8FAFB',
    borderWidth: 2,
    borderColor: colors.lightGray,
    alignItems: 'center',
  },
  statusOptionSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  statusOptionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  statusOptionTextSelected: {
    color: colors.white,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});







