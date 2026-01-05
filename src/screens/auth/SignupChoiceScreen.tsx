import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface SignupChoiceScreenProps {
  navigation: any;
}

export const SignupChoiceScreen: React.FC<SignupChoiceScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color={colors.navy} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Choisissez le type de compte qui vous correspond
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Carte Propriétaire */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => navigation.navigate('Signup')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#E0F2F1' }]}>
                <Ionicons name="paw" size={48} color={colors.teal} />
              </View>
            </View>
            
            <Text style={styles.cardTitle}>Propriétaire d'animal</Text>
            <Text style={styles.cardDescription}>
              Parfait si vous souhaitez gérer la santé de vos animaux de compagnie
            </Text>

            <View style={styles.featuresSection}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.teal} />
                <Text style={styles.featureText}>Suivi santé complet</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.teal} />
                <Text style={styles.featureText}>Carnets de vaccination</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.teal} />
                <Text style={styles.featureText}>Rappels automatiques</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.teal} />
                <Text style={styles.featureText}>Connexion avec vétérinaire</Text>
              </View>
            </View>

            <View style={styles.cardButton}>
              <Text style={styles.cardButtonText}>Choisir</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </View>
          </TouchableOpacity>

          {/* Carte Vétérinaire */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => navigation.navigate('VetSignup')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="medical" size={48} color={colors.navy} />
              </View>
            </View>
            
            <Text style={styles.cardTitle}>Vétérinaire</Text>
            <Text style={styles.cardDescription}>
              Idéal pour gérer vos patients et dossiers médicaux en ligne
            </Text>

            <View style={styles.featuresSection}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.navy} />
                <Text style={styles.featureText}>Gestion des patients</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.navy} />
                <Text style={styles.featureText}>Dossiers médicaux</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.navy} />
                <Text style={styles.featureText}>Rendez-vous en ligne</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.navy} />
                <Text style={styles.featureText}>Suivi personnalisé</Text>
              </View>
            </View>

            <View style={[styles.cardButton, { backgroundColor: colors.navy }]}>
              <Text style={styles.cardButtonText}>Choisir</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.loginSection}>
          <Text style={styles.loginText}>Vous avez déjà un compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.white,
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardsContainer: {
    gap: spacing.lg,
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.lightGray,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  featuresSection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    color: colors.navy,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  cardButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
    gap: spacing.xs,
  },
  loginText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  loginLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
});




