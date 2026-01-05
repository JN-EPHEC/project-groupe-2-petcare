import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Image, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { PremiumBadge } from '../../components';
import { getAllVets } from '../../services/firestoreService';
import * as Location from 'expo-location';

interface EmergencyScreenProps {
  navigation: any;
  route?: any;
}

interface VetWithDistance extends any {
  calculatedDistance?: number;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const isEmergencyMode = route?.params?.isEmergencyMode ?? false; // Par défaut : mode recherche normale
  const [searchQuery, setSearchQuery] = useState('');
  const [allVets, setAllVets] = useState<VetWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [noEmergencyVetsAvailable, setNoEmergencyVetsAvailable] = useState(false);
  
  // Recharger les vétérinaires quand l'écran gagne le focus
  useFocusEffect(
    useCallback(() => {
      console.log('📍 EmergencyScreen - Mode:', isEmergencyMode ? 'URGENCE 🚨' : 'RECHERCHE NORMALE 🔍');
      loadVetsWithLocation();
    }, [isEmergencyMode])
  );
  
  // Fonction pour calculer la distance entre deux coordonnées (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  // Fonction pour géocoder une adresse (simulé pour l'instant)
  const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    // Coordonnées approximatives de quelques villes belges pour la démo
    const belgianCities: { [key: string]: { latitude: number; longitude: number } } = {
      'bruxelles': { latitude: 50.8503, longitude: 4.3517 },
      'brussels': { latitude: 50.8503, longitude: 4.3517 },
      'anvers': { latitude: 51.2194, longitude: 4.4025 },
      'antwerp': { latitude: 51.2194, longitude: 4.4025 },
      'gand': { latitude: 51.0543, longitude: 3.7174 },
      'ghent': { latitude: 51.0543, longitude: 3.7174 },
      'charleroi': { latitude: 50.4108, longitude: 4.4446 },
      'liège': { latitude: 50.6326, longitude: 5.5797 },
      'bruges': { latitude: 51.2093, longitude: 3.2247 },
      'namur': { latitude: 50.4674, longitude: 4.8720 },
      'leuven': { latitude: 50.8798, longitude: 4.7005 },
      'mons': { latitude: 50.4542, longitude: 3.9565 },
      'wavre': { latitude: 50.7167, longitude: 4.6167 },
      'ottignies': { latitude: 50.6667, longitude: 4.5667 },
      'bierges': { latitude: 50.7111, longitude: 4.5978 },
      'limal': { latitude: 50.6897, longitude: 4.5722 },
    };
    
    const normalizedAddress = address.toLowerCase();
    for (const [city, coords] of Object.entries(belgianCities)) {
      if (normalizedAddress.includes(city)) {
        return coords;
      }
    }
    return null;
  };
  
  const loadVetsWithLocation = async () => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🏥 Chargement des vétérinaires...');
      console.log(`📍 MODE: ${isEmergencyMode ? '🚨 URGENCE' : '🔍 RECHERCHE NORMALE'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      setIsLoading(true);
      setIsSearching(true);
      
      // Charger les vétérinaires
      console.log('🔄 Appel de getAllVets()...');
      const vetsData = await getAllVets();
      console.log('📊 Vétérinaires chargés:', vetsData.length);
      console.log('📊 Vétérinaires data:', JSON.stringify(vetsData, null, 2));
      
      if (vetsData.length === 0) {
        console.error('❌❌❌ AUCUN vétérinaire retourné par getAllVets() ❌❌❌');
        console.error('Vérifiez que :');
        console.error('1. Des vétérinaires existent dans Firestore (collection users)');
        console.error('2. Ils ont un champ role = "vet"');
        console.error('3. Ils ont un champ approved = true (ou pas de champ approved)');
        setIsLoading(false);
        setIsSearching(false);
        setAllVets([]); // Important : mettre un tableau vide
        return;
      }
      
      // Simuler une recherche intelligente
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Essayer d'obtenir la localisation de l'utilisateur
      let userCoords: { latitude: number; longitude: number } | null = null;
      try {
        if (Platform.OS !== 'web') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            userCoords = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            };
            setUserLocation(userCoords);
            console.log('📍 Position utilisateur:', userCoords);
          }
        }
      } catch (error) {
        console.log('⚠️ Impossible d\'obtenir la localisation:', error);
      }
      
      // Calculer les distances si on a la position
      const vetsWithDistance: VetWithDistance[] = await Promise.all(
        vetsData.map(async (vet) => {
          let calculatedDistance: number | undefined = undefined;
          
          if (userCoords && vet.location) {
            const vetCoords = await geocodeAddress(vet.location);
            if (vetCoords) {
              calculatedDistance = calculateDistance(
                userCoords.latitude,
                userCoords.longitude,
                vetCoords.latitude,
                vetCoords.longitude
              );
            }
          }
          
          return {
            ...vet,
            calculatedDistance
          };
        })
      );
      
      // Trier intelligemment selon le mode :
      const sorted = vetsWithDistance.sort((a, b) => {
        // EN MODE URGENCE : Priorité aux vétérinaires de garde
        if (isEmergencyMode) {
          if (a.emergencyAvailable && !b.emergencyAvailable) return -1;
          if (!a.emergencyAvailable && b.emergencyAvailable) return 1;
        }
        
        // EN MODE NORMAL ou après tri de garde : trier par distance
        if (a.calculatedDistance !== undefined && b.calculatedDistance !== undefined) {
          return a.calculatedDistance - b.calculatedDistance;
        }
        if (a.calculatedDistance !== undefined) return -1;
        if (b.calculatedDistance !== undefined) return 1;
        
        // Si pas de distance, trier par premium
        if (a.isPremiumPartner && !b.isPremiumPartner) return -1;
        if (!a.isPremiumPartner && b.isPremiumPartner) return 1;
        
        // Enfin par rating
        return (b.rating || 0) - (a.rating || 0);
      });
      
      // EN MODE URGENCE : Compter les vétérinaires de garde et gérer le fallback
      let finalVets = sorted;
      if (isEmergencyMode) {
        const onDutyVets = sorted.filter(v => v.emergencyAvailable);
        console.log('🚨 MODE URGENCE - Vétérinaires de garde:', onDutyVets.length);
        console.log('📊 Vétérinaires triés total:', sorted.length);
        
        // Si aucun vétérinaire de garde, afficher tous les vétérinaires de manière aléatoire
        if (onDutyVets.length === 0) {
          console.log('⚠️ Aucun vétérinaire de garde trouvé - affichage aléatoire de tous les vétérinaires');
          console.log('📋 Nombre de vétérinaires à afficher:', sorted.length);
          setNoEmergencyVetsAvailable(true);
          
          // Mélanger aléatoirement tous les vétérinaires
          const shuffled = [...sorted].sort(() => Math.random() - 0.5);
          console.log('🔀 Vétérinaires mélangés:', shuffled.length);
          
          // Marquer tous les vétérinaires comme "disponibles en urgence" pour l'affichage
          finalVets = shuffled.map(vet => ({
            ...vet,
            emergencyAvailable: true // Force l'affichage comme "disponible"
          }));
          console.log('✅ Vétérinaires forcés comme disponibles:', finalVets.length);
        } else {
          console.log('✅ Vétérinaires de garde trouvés - affichage normal');
          setNoEmergencyVetsAvailable(false);
        }
      } else {
        // EN MODE RECHERCHE NORMALE : affichage standard, pas de badge de garde
        console.log('🔍 MODE RECHERCHE NORMALE - affichage de tous les vétérinaires');
        setNoEmergencyVetsAvailable(false);
      }
      
      setAllVets(finalVets);
      console.log('✅ setAllVets appelé avec', finalVets.length, 'vétérinaires');
      console.log('📋 Final vets:', finalVets);
      
    } catch (error) {
      console.error('❌ Error loading vets:', error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };
  
  // Filter vets by search query
  const vets = searchQuery.trim()
    ? allVets.filter(vet => 
        (vet.firstName + ' ' + vet.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vet.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vet.location || '').toLowerCase().includes(searchQuery.toLowerCase())
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
        <Text style={styles.title}>
          {isEmergencyMode ? t('emergency.title') : 'Rechercher un vétérinaire'}
        </Text>
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

      {/* Loading de recherche intelligente */}
      {isSearching && (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color={colors.teal} />
          <Text style={styles.searchingTitle}>
            {isEmergencyMode ? '🚨 Recherche d\'urgence...' : '🔍 Recherche en cours...'}
          </Text>
          <Text style={styles.searchingText}>
            {isEmergencyMode 
              ? 'Recherche des vétérinaires de garde à proximité' 
              : 'Recherche des vétérinaires disponibles'}
          </Text>
        </View>
      )}

      {/* Compteur de vétérinaires de garde (MODE URGENCE UNIQUEMENT) */}
      {!isLoading && !isSearching && isEmergencyMode && (
        <View style={[styles.onDutyBanner, noEmergencyVetsAvailable && styles.fallbackBanner]}>
          <Ionicons name="medical" size={20} color={noEmergencyVetsAvailable ? '#FF9800' : colors.red} />
          <Text style={styles.onDutyText}>
            {noEmergencyVetsAvailable 
              ? `${allVets.length} vétérinaire(s) disponible(s) pour urgence`
              : `${allVets.filter(v => v.emergencyAvailable).length} vétérinaire(s) de garde disponible(s)`
            }
          </Text>
        </View>
      )}

      <View style={styles.vetsContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.teal} />
            <Text style={styles.loadingText}>Chargement des vétérinaires...</Text>
          </View>
        ) : allVets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.red} />
            <Text style={styles.emptyTitle}>Aucun vétérinaire disponible</Text>
            <Text style={styles.emptyText}>
              Aucun vétérinaire n'est enregistré dans notre base de données pour le moment.
            </Text>
          </View>
        ) : vets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={colors.gray} />
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptyText}>
              Essayez de rechercher avec un autre nom, spécialité ou lieu
            </Text>
          </View>
        ) : (
          vets.map((vet) => (
            <TouchableOpacity 
              key={vet.id} 
              style={[
                styles.vetCard,
                isEmergencyMode && vet.emergencyAvailable && styles.vetCardOnDuty
              ]}
              onPress={() => navigation.navigate('VetDetails', { vet })}
              activeOpacity={0.7}
            >
              {vet.avatarUrl ? (
                <Image 
                  source={{ uri: vet.avatarUrl }}
                  style={styles.vetImage}
                />
              ) : (
                <View style={[styles.vetImage, styles.vetImagePlaceholder]}>
                  <Ionicons name="person" size={32} color={colors.white} />
                </View>
              )}
              
              <View style={styles.vetInfo}>
                <View style={styles.vetNameRow}>
                  <Text style={styles.vetName}>
                    {vet.firstName} {vet.lastName}
                  </Text>
                  {vet.isPremiumPartner && (
                    <PremiumBadge size="small" showText={false} />
                  )}
                  {isEmergencyMode && vet.emergencyAvailable && (
                    <View style={styles.onDutyBadge}>
                      <Ionicons name="medical" size={12} color={colors.white} />
                      <Text style={styles.onDutyBadgeText}>DE GARDE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.vetSpecialty}>{vet.specialty || 'Vétérinaire'}</Text>
                
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={16} color={colors.black} />
                  <Text style={styles.locationText}>{vet.location}</Text>
                  {vet.calculatedDistance !== undefined ? (
                    <>
                      <MaterialIcons name="straighten" size={16} color={colors.teal} style={styles.distanceIcon} />
                      <Text style={[styles.distanceText, styles.distanceCalculated]}>
                        {vet.calculatedDistance.toFixed(1)} km
                      </Text>
                    </>
                  ) : vet.distance ? (
                    <>
                      <MaterialIcons name="straighten" size={16} color={colors.black} style={styles.distanceIcon} />
                      <Text style={styles.distanceText}>{vet.distance}</Text>
                    </>
                  ) : null}
                </View>
              </View>

              <View style={styles.vetActions}>
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    styles.appointmentButton
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('RequestAppointment', { vetId: vet.id });
                  }}
                >
                  <Ionicons name="calendar" size={22} color={colors.white} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    styles.callButton,
                    isEmergencyMode && vet.emergencyAvailable && styles.callButtonOnDuty
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleCall(vet.phone);
                  }}
                >
                  <Ionicons name="call" size={22} color={colors.white} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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
  vetImagePlaceholder: {
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vetInfo: {
    flex: 1,
  },
  vetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.md,
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
  vetActions: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  actionButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentButton: {
    backgroundColor: colors.teal,
  },
  callButton: {
    backgroundColor: colors.navy,
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
  searchingContainer: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  searchingTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginTop: spacing.md,
  },
  searchingText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  onDutyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  fallbackBanner: {
    backgroundColor: '#FFF3E0', // Orange clair
  },
  onDutyText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.red,
  },
  vetCardOnDuty: {
    borderWidth: 2,
    borderColor: colors.red,
    backgroundColor: '#FFF5F5',
  },
  onDutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.red,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  onDutyBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  callButtonOnDuty: {
    backgroundColor: colors.red,
  },
  distanceCalculated: {
    color: colors.teal,
    fontWeight: typography.fontWeight.bold,
  },
});

