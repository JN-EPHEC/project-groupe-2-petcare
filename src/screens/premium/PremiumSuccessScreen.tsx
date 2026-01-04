import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumSuccessScreenProps {
  navigation: any;
}

export const PremiumSuccessScreen: React.FC<PremiumSuccessScreenProps> = ({ navigation }) => {
  const premiumFeatures = [
    {
      icon: 'fitness',
      title: 'Suivi Bien-être Complet',
      description: 'Tableau de bord avancé avec graphiques détaillés pour suivre la santé de vos animaux',
      color: '#4CAF50',
    },
    {
      icon: 'book',
      title: 'Blog Exclusif',
      description: 'Accès à des articles d\'experts vétérinaires et conseils personnalisés',
      color: '#2196F3',
    },
    {
      icon: 'share-social',
      title: 'Partage Sécurisé',
      description: 'Partagez les informations médicales de vos animaux avec vos vétérinaires en toute sécurité',
      color: '#9C27B0',
    },
    {
      icon: 'cloud-upload',
      title: 'Stockage Illimité',
      description: 'Tous vos documents vétérinaires, ordonnances et résultats d\'analyses en un seul endroit',
      color: '#FF9800',
    },
    {
      icon: 'notifications',
      title: 'Rappels Intelligents',
      description: 'Notifications personnalisées pour les vaccins, médicaments et rendez-vous',
      color: '#F44336',
    },
    {
      icon: 'headset',
      title: 'Support Prioritaire',
      description: 'Assistance dédiée 7j/7 pour toutes vos questions',
      color: '#00BCD4',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Success Header with Animation */}
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successHeader}
        >
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={100} color={colors.white} />
          </View>
          <Text style={styles.successTitle}>Félicitations ! 🎉</Text>
          <Text style={styles.successSubtitle}>
            Vous êtes maintenant membre Premium de PetCare+
          </Text>
          <View style={styles.premiumBadgeContainer}>
            <Ionicons name="star" size={24} color={colors.white} />
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            <Ionicons name="star" size={24} color={colors.white} />
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Vos avantages Premium</Text>
          <Text style={styles.sectionSubtitle}>
            Découvrez toutes les fonctionnalités exclusives désormais disponibles
          </Text>

          <View style={styles.featuresContainer}>
            {premiumFeatures.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIconContainer, { backgroundColor: feature.color }]}>
                  <Ionicons name={feature.icon as any} size={32} color={colors.white} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            ))}
          </View>
        </View>

        {/* Quick Start Guide */}
        <View style={styles.quickStartSection}>
          <Text style={styles.quickStartTitle}>Commencez maintenant !</Text>
          
          <TouchableOpacity
            style={styles.quickStartCard}
            onPress={() => {
              navigation.replace('MainTabs');
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.quickStartIcon, { backgroundColor: colors.teal }]}>
              <Ionicons name="paw" size={28} color={colors.white} />
            </View>
            <View style={styles.quickStartContent}>
              <Text style={styles.quickStartCardTitle}>Gérer mes animaux</Text>
              <Text style={styles.quickStartCardDesc}>Accédez au suivi complet de vos compagnons</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickStartCard}
            onPress={() => {
              // Note: Ces écrans sont dans HomeStack, on va vers MainTabs pour y accéder ensuite
              navigation.replace('MainTabs');
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.quickStartIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="fitness" size={28} color={colors.white} />
            </View>
            <View style={styles.quickStartContent}>
              <Text style={styles.quickStartCardTitle}>Suivi Bien-être</Text>
              <Text style={styles.quickStartCardDesc}>Nouveau ! Tableau de bord avancé</Text>
            </View>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NOUVEAU</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickStartCard}
            onPress={() => {
              // Note: Ces écrans sont dans HomeStack, on va vers MainTabs pour y accéder ensuite
              navigation.replace('MainTabs');
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.quickStartIcon, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="book" size={28} color={colors.white} />
            </View>
            <View style={styles.quickStartContent}>
              <Text style={styles.quickStartCardTitle}>Blog Exclusif</Text>
              <Text style={styles.quickStartCardDesc}>Conseils d'experts vétérinaires</Text>
            </View>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NOUVEAU</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Thank You Section */}
        <View style={styles.thankYouSection}>
          <Text style={styles.thankYouText}>
            Merci de votre confiance ! 🙏
          </Text>
          <Text style={styles.thankYouSubtext}>
            Notre équipe est ravie de vous accompagner dans le suivi de la santé de vos animaux.
          </Text>
        </View>

        {/* Bottom Action Button */}
        <View style={styles.bottomButtonContainer}>
          <Button
            title="Retour à l'accueil"
            onPress={() => {
              // Naviguer vers MainTabs puis HomeTab
              navigation.replace('MainTabs');
            }}
            variant="primary"
            style={styles.bottomButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  successHeader: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? spacing.xxl * 2 : spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  successIconContainer: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
    opacity: 0.95,
  },
  premiumBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  premiumBadgeText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    letterSpacing: 2,
  },
  featuresSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginBottom: spacing.xl,
  },
  featuresContainer: {
    gap: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    lineHeight: 18,
  },
  quickStartSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  quickStartTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.lg,
  },
  quickStartCard: {
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
  quickStartIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  quickStartContent: {
    flex: 1,
  },
  quickStartCardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  quickStartCardDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  newBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  newBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    letterSpacing: 1,
  },
  thankYouSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  thankYouText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  thankYouSubtext: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomButtonContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  bottomButton: {
    marginBottom: 0,
  },
});

