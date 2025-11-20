import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface UserProfileDetailScreenProps {
  navigation: any;
}

export const UserProfileDetailScreen: React.FC<UserProfileDetailScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, currentPet } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color={colors.navy} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="settings" size={30} color={colors.navy} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageContainer}>
        {user?.avatarLocal ? (
          <Image 
            source={user.avatarLocal}
            style={styles.profileImage}
          />
        ) : user?.avatarUrl ? (
          <Image 
            source={{ uri: user.avatarUrl }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="person" size={100} color={colors.gray} />
          </View>
        )}
      </View>

      <View style={styles.contentCard}>
        <View style={styles.userInfoHeader}>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName?.toUpperCase()}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={colors.black} />
            <Text style={styles.location}>{user?.location || 'wavre'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>{t('profile.profile')}</Text>

        <Text style={styles.bio}>
          {t('profile.userProfile.bio', { petName: currentPet?.name || 'kitty' })}
        </Text>

        <View style={styles.petSection}>
          <View style={styles.petImageContainer}>
            <View style={styles.petImagePlaceholder}>
              <Ionicons name="paw" size={50} color={colors.navy} />
            </View>
          </View>
          <Text style={styles.petName}>{currentPet?.name || 'kitty'}</Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactLabel}>{t('profile.emailLabel')}</Text>
          <View style={styles.contactField}>
            <Text style={styles.contactText}>{user?.email || '*Charlesdubois@hotmail.com'}</Text>
          </View>

          <Text style={styles.contactLabel}>{t('profile.phoneLabel')}</Text>
          <View style={styles.contactField}>
            <Text style={styles.contactText}>{user?.phone || '*+32 49 90 89 808'}</Text>
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
  header: {
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
  settingsButton: {
    padding: spacing.sm,
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  profileImagePlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  contentCard: {
    backgroundColor: colors.lightBlue,
    margin: spacing.lg,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    padding: spacing.xl,
    minHeight: 600,
  },
  userInfoHeader: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  userName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  divider: {
    height: 2,
    backgroundColor: colors.white,
    marginVertical: spacing.lg,
    width: '30%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.black,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  petSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  petImageContainer: {
    marginRight: spacing.lg,
  },
  petImagePlaceholder: {
    width: 120,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  contactSection: {
    gap: spacing.md,
  },
  contactLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  contactField: {
    backgroundColor: colors.navy,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  contactText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
  },
});

