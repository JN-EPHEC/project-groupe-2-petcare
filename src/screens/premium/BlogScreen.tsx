import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { PremiumGate } from '../../components';
import { getPublishedArticles, getArticlesByCategory, searchArticles } from '../../services/firestoreService';
import { BlogArticle } from '../../types/premium';

interface BlogScreenProps {
  navigation: any;
}

export const BlogScreen: React.FC<BlogScreenProps> = ({ navigation }) => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = [
    { id: 'emergency', label: 'Urgences', icon: 'medical', color: '#F44336' },
    { id: 'species', label: 'Espèces', icon: 'paw', color: '#E91E63' },
    { id: 'nutrition', label: 'Alimentation', icon: 'restaurant', color: '#FF9800' },
    { id: 'behavior', label: 'Comportement', icon: 'happy', color: '#4CAF50' },
    { id: 'health', label: 'Santé', icon: 'fitness', color: '#2196F3' },
  ];
  
  useEffect(() => {
    loadArticles();
  }, []);
  
  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, selectedCategory]);
  
  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const data = await getPublishedArticles();
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterArticles = () => {
    let filtered = [...articles];
    
    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredArticles(filtered);
  };
  
  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };
  
  return (
    <PremiumGate featureName="Le blog éducatif" navigation={navigation}>
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
            <Text style={styles.headerTitle}>Blog Éducatif</Text>
            <Text style={styles.headerSubtitle}>Conseils d'experts pour vos animaux</Text>
          </View>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un article..."
              placeholderTextColor={colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.gray} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && { 
                    backgroundColor: category.color,
                    borderColor: category.color 
                  }
                ]}
                onPress={() => handleCategoryPress(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={18} 
                  color={selectedCategory === category.id ? colors.white : category.color} 
                />
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && { color: colors.white }
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Articles List */}
          <View style={styles.articlesContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.teal} />
                <Text style={styles.loadingText}>Chargement des articles...</Text>
              </View>
            ) : filteredArticles.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color={colors.lightGray} />
                <Text style={styles.emptyText}>Aucun article trouvé</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || selectedCategory 
                    ? 'Essayez de modifier vos filtres' 
                    : 'Les articles seront bientôt disponibles'}
                </Text>
              </View>
            ) : (
              filteredArticles.map(article => (
                <ArticleCard 
                  key={article.id}
                  article={article}
                  onPress={() => navigation.navigate('BlogArticle', { articleId: article.id })}
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </PremiumGate>
  );
};

const ArticleCard: React.FC<{ article: BlogArticle; onPress: () => void }> = ({ article, onPress }) => {
  const categoryColors: Record<string, string> = {
    emergency: '#F44336',
    species: '#E91E63',
    nutrition: '#FF9800',
    behavior: '#4CAF50',
    health: '#2196F3',
  };
  
  const categoryLabels: Record<string, string> = {
    emergency: 'Urgences',
    species: 'Espèces',
    nutrition: 'Alimentation',
    behavior: 'Comportement',
    health: 'Santé',
  };
  
  return (
    <TouchableOpacity style={styles.articleCard} onPress={onPress} activeOpacity={0.7}>
      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
      ) : (
        <View style={[styles.articleImagePlaceholder, { backgroundColor: categoryColors[article.category] }]}>
          <Ionicons name="image-outline" size={40} color={colors.white} />
        </View>
      )}
      
      <View style={styles.articleContent}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColors[article.category] }]}>
          <Text style={styles.categoryBadgeText}>{categoryLabels[article.category]}</Text>
        </View>
        
        <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.articleExcerpt} numberOfLines={3}>{article.excerpt}</Text>
        
        <View style={styles.articleFooter}>
          <View style={styles.articleMeta}>
            <Ionicons name="person-outline" size={14} color={colors.gray} />
            <Text style={styles.articleAuthor}>{article.authorName}</Text>
          </View>
          
          <View style={styles.articleMeta}>
            <Ionicons name="eye-outline" size={14} color={colors.gray} />
            <Text style={styles.articleViews}>{article.viewCount || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.lightBlue,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  articlesContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
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
    textAlign: 'center',
  },
  articleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  articleImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  articleImagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleContent: {
    padding: spacing.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  articleTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  articleExcerpt: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  articleAuthor: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  articleViews: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
});





