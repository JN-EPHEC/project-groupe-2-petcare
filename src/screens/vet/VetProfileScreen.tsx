import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from '../../components';

interface VetProfileScreenProps {
  navigation: any;
}

export const VetProfileScreen: React.FC<VetProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const vetInfo = {
    specialty: 'Vétérinaire généraliste',
    experience: '8 ans d\'expérience',
    clinic: 'Clinique Vétérinaire de Wavre',
    address: 'Rue de la Station 45, 1300 Wavre',
    phone: '+32 2 234 5678',
    email: user?.email || 'christine.hartono@petcare.be',
    consultationRate: '50€',
    emergencyAvailable: true,
    languages: ['Français', 'English', 'Nederlands'],
    services: [
      'Consultations générales',
      'Vaccinations',
      'Chirurgie',
      'Dentisterie',
      'Analyses laboratoire',
      'Urgences',
    ],
  };

  const handleLogout = () => {
    Alert.alert(
      t('common.logout'),
      t('common.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.navigate('Splash');
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>
        <View style={styles.topRightButtons}>
          <LanguageSwitcher />
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              Alert.alert('Paramètres', 'Modifier votre profil vétérinaire');
            }}
          >
            <Ionicons name="settings" size={30} color={colors.navy} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image 
          source={user?.avatarLocal || { uri: user?.avatarUrl }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Dr. {user?.firstName} {user?.lastName}</Text>
        <Text style={styles.specialty}>{vetInfo.specialty}</Text>
        <Text style={styles.experience}>{vetInfo.experience}</Text>

        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons key={star} name="star" size={20} color="#FFB347" />
          ))}
          <Text style={styles.ratingText}>4.8 (127 avis)</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>42</Text>
          <Text style={styles.statLabel}>Patients</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>320</Text>
          <Text style={styles.statLabel}>Consultations</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Années</Text>
        </View>
      </View>

      {/* Clinic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clinique</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="business" size={20} color={colors.teal} />
            <Text style={styles.infoText}>{vetInfo.clinic}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={colors.teal} />
            <Text style={styles.infoText}>{vetInfo.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={colors.teal} />
            <Text style={styles.infoText}>{vetInfo.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={colors.teal} />
            <Text style={styles.infoText}>{vetInfo.email}</Text>
          </View>
        </View>
      </View>

      {/* Tarifs & Disponibilité */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tarifs & Disponibilité</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color={colors.teal} />
            <Text style={styles.infoText}>Consultation: {vetInfo.consultationRate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={colors.teal} />
            <Text style={styles.infoText}>Lun-Ven: 9h-18h, Sam: 9h-12h</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons 
              name="alert-circle" 
              size={20} 
              color={vetInfo.emergencyAvailable ? '#4ECDC4' : colors.gray} 
            />
            <Text style={styles.infoText}>
              {vetInfo.emergencyAvailable ? 'Urgences disponibles 24/7' : 'Pas d\'urgences'}
            </Text>
          </View>
        </View>
      </View>

      {/* Langues */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Langues parlées</Text>
        <View style={styles.languagesContainer}>
          {vetInfo.languages.map((lang, index) => (
            <View key={index} style={styles.languageChip}>
              <Ionicons name="language" size={16} color={colors.teal} />
              <Text style={styles.languageText}>{lang}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services proposés</Text>
        <View style={styles.servicesContainer}>
          {vetInfo.services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('VetSchedule')}
        >
          <Ionicons name="calendar" size={24} color={colors.white} />
          <Text style={styles.actionButtonText}>Gérer mes disponibilités</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('VetPatients')}
        >
          <Ionicons name="list" size={24} color={colors.teal} />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Voir mes patients
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={24} color="#FF6B6B" />
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
            Se déconnecter
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
    borderWidth: 4,
    borderColor: colors.teal,
  },
  name: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  specialty: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
    marginBottom: spacing.xs,
  },
  experience: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginLeft: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.lightBlue,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray,
    opacity: 0.3,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoText: {
    fontSize: typography.fontSize.md,
    color: colors.black,
    flex: 1,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  languageText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  servicesContainer: {
    gap: spacing.sm,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  serviceText: {
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.lightBlue,
  },
  secondaryButtonText: {
    color: colors.teal,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B20',
  },
  logoutButtonText: {
    color: '#FF6B6B',
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

