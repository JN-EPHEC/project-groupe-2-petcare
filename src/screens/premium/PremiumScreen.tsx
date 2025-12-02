import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Button } from '../../components';

interface PremiumScreenProps {
  navigation: any;
}

export const PremiumScreen: React.FC<PremiumScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color={colors.navy} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{t('premium.title1')}</Text>
        <Text style={styles.title}>{t('premium.title2')}</Text>

        <Text style={styles.subtitle}>
          {t('premium.subtitle')}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>{t('premium.priceLabel')}</Text>
          <Text style={styles.price}>{t('premium.price')}</Text>
          <Text style={styles.priceNote}>{t('premium.priceNote')}</Text>
        </View>

        <View style={styles.featuresContainer}>
          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureTitle}>{t('premium.addAnimal')}</Text>
            <View style={styles.featureArrow}>
              <Ionicons name="chevron-forward" size={24} color={colors.teal} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <Text style={styles.featureTitle}>{t('premium.moreFeatures')}</Text>
            <View style={styles.featureArrow}>
              <Ionicons name="chevron-forward" size={24} color={colors.teal} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.bannerContainer}>
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>{t('premium.bannerTitle')}</Text>
              <Text style={styles.bannerSubtitle}>{t('premium.bannerSubtitle')}</Text>
              <Text style={styles.bannerText}>{t('premium.bannerText')}</Text>
              <Text style={styles.bannerDescription}>
                {t('premium.bannerDescription')}
              </Text>
            </View>
            <View style={styles.bannerImagePlaceholder}>
              <Text style={styles.bannerEmoji}>🐕🐱🐹</Text>
            </View>
          </View>
        </View>
      </View>
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
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  priceLabel: {
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  price: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
    marginTop: spacing.xs,
  },
  priceNote: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    fontStyle: 'italic',
  },
  featuresContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 70,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    flex: 1,
  },
  featureArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    marginTop: spacing.lg,
  },
  banner: {
    backgroundColor: '#FF9F4A',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 150,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  bannerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    fontStyle: 'italic',
  },
  bannerText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginTop: spacing.sm,
  },
  bannerDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    marginTop: spacing.xs,
  },
  bannerImagePlaceholder: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerEmoji: {
    fontSize: 50,
  },
});

