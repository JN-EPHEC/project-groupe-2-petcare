import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Image, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { demoAuth } from '../../services/demoAuth';

interface EmergencyScreenProps {
  navigation: any;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const allVets = demoAuth.getAllVets();
  
  // Filter vets by search query
  const vets = searchQuery.trim()
    ? allVets.filter(vet => 
        vet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vet.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vet.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allVets;

  const handleCall = (phone: string) => {
    Alert.alert(
      t('emergency.callTitle'),
      t('emergency.callMessage', { phone }),
      [
        { text: t('emergency.cancel'), style: 'cancel' },
        { 
          text: t('emergency.call'), 
          onPress: () => {
            Linking.openURL(`tel:${phone}`).catch(() => {
              Alert.alert(t('emergency.errorTitle'), t('emergency.errorMessage'));
            });
          }
        },
      ]
    );
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
        <Text style={styles.title}>{t('emergency.title')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Map')}>
          <Text style={styles.seeAllText}>{t('emergency.seeAll')}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.vetsContainer}>
        {vets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>Aucun vétérinaire trouvé</Text>
            <Text style={styles.emptyText}>
              Essayez de rechercher avec un autre nom, spécialité ou lieu
            </Text>
          </View>
        ) : (
          vets.map((vet) => (
            <View key={vet.id} style={styles.vetCard}>
            <Image 
              source={vet.avatarLocal ? vet.avatarLocal : { uri: vet.avatarUrl }}
              style={styles.vetImage}
            />
            
            <View style={styles.vetInfo}>
              <Text style={styles.vetName}>{vet.name}</Text>
              <Text style={styles.vetSpecialty}>{vet.specialty}</Text>
              
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color={colors.black} />
                <Text style={styles.locationText}>{vet.location}</Text>
                <MaterialIcons name="straighten" size={16} color={colors.black} style={styles.distanceIcon} />
                <Text style={styles.distanceText}>{vet.distance}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.callButton}
              onPress={() => handleCall(vet.phone)}
            >
              <Ionicons name="call" size={26} color={colors.white} />
            </TouchableOpacity>
          </View>
          ))
        )}
      </View>

      <TouchableOpacity 
        style={styles.mapContainer}
        onPress={() => navigation.navigate('Map')}
        activeOpacity={0.9}
      >
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={60} color={colors.navy} />
          <Text style={styles.mapText}>{t('emergency.seeAll')}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.navy} />
        </View>
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  seeAllText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 45,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.black,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    textAlign: 'center',
  },
  vetsContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  vetCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  vetImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  vetInfo: {
    flex: 1,
  },
  vetName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.black,
  },
  vetSpecialty: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  locationText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
  },
  distanceIcon: {
    marginLeft: spacing.sm,
  },
  distanceText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
  },
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    margin: spacing.xl,
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mapText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
});

