import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { LanguageSwitcher } from '../../components';
import { useAuth } from '../../context/AuthContext';

interface OwnerProfileScreenProps {
  navigation: any;
}

export const OwnerProfileScreen: React.FC<OwnerProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

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
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="settings" size={30} color={colors.navy} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={18} color={colors.black} />
          <Text style={styles.location}>{user?.location || 'BELGIQUE'}</Text>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('UserProfileDetail')}
        >
          <Text style={styles.cardTitle}>{t('profile.myProfile')}</Text>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={30} color={colors.teal} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('PetProfile')}
        >
          <Text style={styles.cardTitle}>{t('profile.myAnimal')}</Text>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={30} color={colors.teal} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('AddPet')}
        >
          <Text style={styles.cardTitle}>{t('profile.addAnimal')}</Text>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={30} color={colors.teal} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('Premium')}
        >
          <Text style={styles.cardTitle}>{t('profile.premium')}</Text>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={30} color={colors.teal} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.cardTitle}>{t('profile.notificationsTitle')}</Text>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={30} color={colors.teal} />
          </View>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  location: {
    fontSize: typography.fontSize.md,
    color: colors.black,
  },
  cardsContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 100,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    flex: 1,
  },
  arrow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
