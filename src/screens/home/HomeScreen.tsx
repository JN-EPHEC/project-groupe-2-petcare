import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.morningGreeting');
    if (hour < 18) return t('home.afternoonGreeting');
    return t('home.eveningGreeting');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('home.greeting')} {user?.firstName || 'John'}</Text>
        <Text style={styles.subGreeting}>{getGreeting()}</Text>
        <View style={styles.pawIcon}>
          <Ionicons name="paw" size={50} color={colors.teal} />
        </View>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Text style={styles.cardTitle}>{t('home.calendarCard')}</Text>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={30} color={colors.teal} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('Reminders')}
        >
          <Text style={styles.cardTitle}>{t('home.remindersCard')}</Text>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={30} color={colors.teal} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.getParent()?.navigate('ProfileTab', { screen: 'HealthRecord' })}
        >
          <Text style={styles.cardTitle}>{t('home.medicalHistoryCard')}</Text>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={30} color={colors.teal} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.navigate('OfflineMode')}
        >
          <Text style={styles.cardTitle}>{t('home.offlineModeCard')}</Text>
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={30} color={colors.teal} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => navigation.getParent()?.navigate('SearchTab', { screen: 'Emergency' })}
        >
          <Text style={styles.cardTitle}>{t('home.emergencyCard')}</Text>
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    position: 'relative',
  },
  greeting: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  subGreeting: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  pawIcon: {
    position: 'absolute',
    right: spacing.xl,
    top: spacing.xxl,
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
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
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
