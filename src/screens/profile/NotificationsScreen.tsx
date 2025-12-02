import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface NotificationsScreenProps {
  navigation: any;
}

interface Notification {
  id: string;
  title: string;
  type: 'rappel' | 'vaccin' | 'biberon' | 'nourriture';
  message: string;
  date?: string;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentPet } = useAuth();

  const notifications: Notification[] = [
    {
      id: '1',
      title: t('profile.notifications.reminder'),
      type: 'rappel',
      message: t('profile.notifications.vermifugeReminder'),
      date: '',
    },
    {
      id: '2',
      title: t('profile.notifications.vaccines'),
      type: 'vaccin',
      message: t('profile.notifications.vaccineReminder'),
      date: '',
    },
    {
      id: '3',
      title: t('profile.notifications.bottle'),
      type: 'biberon',
      message: t('profile.notifications.bottleReminder'),
      date: '',
    },
    {
      id: '4',
      title: t('profile.notifications.food'),
      type: 'nourriture',
      message: t('profile.notifications.foodReminder'),
      date: '',
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rappel':
        return '#FF6B6B';
      case 'vaccin':
        return '#4ECDC4';
      case 'biberon':
        return '#FFE66D';
      case 'nourriture':
        return '#95E1D3';
      default:
        return colors.lightBlue;
    }
  };

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
          <Text style={styles.petName}>{currentPet?.name || 'kitty'}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.black} />
            <Text style={styles.location}>{currentPet?.location || 'wavre'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.notificationsContainer}>
        {notifications.map((notification) => (
          <View 
            key={notification.id} 
            style={[
              styles.notificationCard,
              { backgroundColor: getTypeColor(notification.type) }
            ]}
          >
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationMessage}>{notification.message}</Text>
            <TouchableOpacity style={styles.okButton}>
              <Text style={styles.okButtonText}>{t('profile.notifications.okButton')}</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  notificationsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  notificationCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minHeight: 120,
  },
  notificationTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  notificationMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
    lineHeight: 20,
  },
  okButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    alignSelf: 'center',
    minWidth: 80,
  },
  okButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
  },
});

