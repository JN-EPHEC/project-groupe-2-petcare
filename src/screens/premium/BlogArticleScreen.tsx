import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { getArticleById, incrementArticleViews, getArticlesByCategory } from '../../services/firestoreService';
import { BlogArticle } from '../../types/premium';

interface BlogArticleScreenProps {
  navigation: any;
  route: any;
}

export const BlogArticleScreen: React.FC<BlogArticleScreenProps> = ({ navigation, route }) => {
  const { articleId } = route.params;
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadArticle();
  }, [articleId]);
  
  const loadArticle = async () => {
    try {
      setIsLoading(true);
      const data = await getArticleById(articleId);
      setArticle(data);
      
      // Incrémenter le compteur de vues
      await incrementArticleViews(articleId);
      
      // Charger les articles similaires
      if (data.category) {
        const related = await getArticlesByCategory(data.category);
        setRelatedArticles(related.filter(a => a.id !== articleId).slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShare = async () => {
    if (!article) return;
    
    try {
      await Share.share({
        message: `${article.title}\n\n${article.excerpt}\n\nLire l'article complet sur PetCare+`,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Chargement de l'article...</Text>
      </View>
    );
  }
  
  if (!article) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Article introuvable</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        {article.imageUrl ? (
          <Image source={{ uri: article.imageUrl }} style={styles.headerImage} />
        ) : (
          <View style={[styles.headerImagePlaceholder, { backgroundColor: categoryColors[article.category] }]}>
            <Ionicons name="image-outline" size={80} color={colors.white} />
          </View>
        )}
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButtonFloat}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        {/* Share Button */}
        <TouchableOpacity 
          style={styles.shareButtonFloat}
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={24} color={colors.white} />
        </TouchableOpacity>
        
        {/* Content */}
        <View style={styles.content}>
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColors[article.category] }]}>
            <Text style={styles.categoryBadgeText}>{categoryLabels[article.category]}</Text>
          </View>
          
          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>
          
          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={16} color={colors.gray} />
              <Text style={styles.metaText}>{article.authorName}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.gray} />
              <Text style={styles.metaText}>
                {new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={16} color={colors.gray} />
              <Text style={styles.metaText}>{article.viewCount || 0} vues</Text>
            </View>
          </View>
          
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {article.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Article Content */}
          <View style={styles.articleContent}>
            <Markdown style={markdownStyles}>
              {article.content}
            </Markdown>
          </View>
          
          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Articles similaires</Text>
              {relatedArticles.map(related => (
                <TouchableOpacity
                  key={related.id}
                  style={styles.relatedCard}
                  onPress={() => {
                    navigation.push('BlogArticle', { articleId: related.id });
                  }}
                >
                  <View style={styles.relatedContent}>
                    <Text style={styles.relatedCardTitle} numberOfLines={2}>
                      {related.title}
                    </Text>
                    <Text style={styles.relatedCardExcerpt} numberOfLines={2}>
                      {related.excerpt}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={colors.gray} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const markdownStyles = {
  body: {
    fontSize: typography.fontSize.md,
    lineHeight: 24,
    color: colors.navy,
  },
  heading1: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  heading2: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heading3: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  paragraph: {
    marginBottom: spacing.md,
    lineHeight: 24,
  },
  strong: {
    fontWeight: typography.fontWeight.bold,
  },
  em: {
    fontStyle: 'italic',
  },
  bullet_list: {
    marginBottom: spacing.md,
  },
  ordered_list: {
    marginBottom: spacing.md,
  },
  list_item: {
    marginBottom: spacing.xs,
  },
  code_inline: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    fontFamily: 'monospace',
  },
  blockquote: {
    backgroundColor: '#F8FAFB',
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  headerImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  headerImagePlaceholder: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonFloat: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonFloat: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.xl,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.lg,
    lineHeight: 36,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.lightBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
  },
  articleContent: {
    marginBottom: spacing.xl,
  },
  relatedSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  relatedTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.lg,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  relatedContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  relatedCardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  relatedCardExcerpt: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    lineHeight: 18,
  },
  backButton: {
    backgroundColor: colors.teal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});




