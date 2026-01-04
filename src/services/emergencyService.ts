import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet } from './firestoreService';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  address: string;
  specialty?: string;
  distance?: number; // en km
  duration?: number; // en minutes
  isOpen?: boolean;
  openingHours?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
  lastUpdated?: string;
}

export interface EmergencyData {
  petId: string;
  petName: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  medicalConditions?: string[];
  currentMedications?: string[];
  allergies?: string[];
  lastVetVisit?: string;
  vaccinations?: any[];
}

const EMERGENCY_CONTACTS_KEY = '@emergency_contacts';
const LAST_LOCATION_KEY = '@last_location';

/**
 * Demande la permission de géolocalisation
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

/**
 * Obtient la position actuelle de l'utilisateur
 */
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      Alert.alert(
        'Permission refusée',
        'Veuillez autoriser l\'accès à votre position pour trouver les cliniques vétérinaires à proximité.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Paramètres', onPress: () => Linking.openSettings() },
        ]
      );
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Sauvegarder la dernière position pour utilisation hors ligne
    await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));

    return location;
  } catch (error) {
    console.error('Error getting current location:', error);
    
    // Essayer de récupérer la dernière position connue
    try {
      const lastLocation = await AsyncStorage.getItem(LAST_LOCATION_KEY);
      if (lastLocation) {
        return JSON.parse(lastLocation);
      }
    } catch (e) {
      console.error('Error getting last known location:', e);
    }
    
    return null;
  }
};

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
};

/**
 * Recherche des cliniques vétérinaires à proximité
 * Note: Pour une vraie implémentation, utilisez Google Places API ou une API similaire
 */
export const findNearbyVetClinics = async (
  userLocation: Location.LocationObject,
  radiusKm: number = 10
): Promise<EmergencyContact[]> => {
  try {
    // TODO: Intégrer avec Google Places API ou une autre API de recherche
    // Pour l'instant, on retourne des cliniques d'exemple
    
    // Récupérer les cliniques sauvegardées localement
    const savedContacts = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
    let contacts: EmergencyContact[] = savedContacts ? JSON.parse(savedContacts) : [];

    // Ajouter quelques cliniques d'exemple si la liste est vide
    if (contacts.length === 0) {
      contacts = getDefaultEmergencyContacts();
    }

    // Calculer les distances et filtrer par rayon
    const contactsWithDistance = contacts.map(contact => {
      if (contact.latitude && contact.longitude) {
        const distance = calculateDistance(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          contact.latitude,
          contact.longitude
        );
        return {
          ...contact,
          distance,
          duration: Math.round(distance * 3), // Estimation: 3 min par km
        };
      }
      return contact;
    });

    // Trier par distance
    const sortedContacts = contactsWithDistance
      .filter(c => !c.distance || c.distance <= radiusKm)
      .sort((a, b) => {
        // Prioriser les cliniques ouvertes
        if (a.isOpen && !b.isOpen) return -1;
        if (!a.isOpen && b.isOpen) return 1;
        // Puis par distance
        return (a.distance || 999) - (b.distance || 999);
      });

    return sortedContacts;
  } catch (error) {
    console.error('Error finding nearby vet clinics:', error);
    return getDefaultEmergencyContacts();
  }
};

/**
 * Contacts d'urgence par défaut (exemple)
 */
const getDefaultEmergencyContacts = (): EmergencyContact[] => {
  return [
    {
      id: '1',
      name: 'Clinique Vétérinaire Centrale',
      phone: '+33123456789',
      address: '123 Rue de la Santé, 75000 Paris',
      specialty: 'Urgences 24/7',
      isOpen: true,
      openingHours: '24h/24, 7j/7',
      rating: 4.8,
      latitude: 48.8566,
      longitude: 2.3522,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Centre Vétérinaire des Animaux',
      phone: '+33987654321',
      address: '456 Avenue des Soins, 75001 Paris',
      specialty: 'Chirurgie et Urgences',
      isOpen: true,
      openingHours: 'Lun-Ven: 8h-20h, Sam-Dim: 9h-18h',
      rating: 4.6,
      latitude: 48.8606,
      longitude: 2.3376,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Cabinet Vétérinaire du Parc',
      phone: '+33147258369',
      address: '789 Boulevard Vert, 75002 Paris',
      specialty: 'Médecine générale',
      isOpen: false,
      openingHours: 'Lun-Ven: 9h-19h',
      rating: 4.5,
      latitude: 48.8628,
      longitude: 2.3510,
      lastUpdated: new Date().toISOString(),
    },
  ];
};

/**
 * Sauvegarde les contacts d'urgence localement (hors ligne)
 */
export const saveEmergencyContacts = async (contacts: EmergencyContact[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(contacts));
  } catch (error) {
    console.error('Error saving emergency contacts:', error);
  }
};

/**
 * Récupère les contacts d'urgence sauvegardés (hors ligne)
 */
export const getEmergencyContacts = async (): Promise<EmergencyContact[]> => {
  try {
    const contacts = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
    return contacts ? JSON.parse(contacts) : getDefaultEmergencyContacts();
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    return getDefaultEmergencyContacts();
  }
};

/**
 * Appeler un contact d'urgence avec confirmation
 */
export const callEmergencyContact = (contact: EmergencyContact): void => {
  Alert.alert(
    '🚨 Appel d\'urgence',
    `Voulez-vous appeler ${contact.name} ?\n\n📞 ${contact.phone}\n📍 ${contact.address}`,
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Appeler',
        onPress: () => {
          Linking.openURL(`tel:${contact.phone}`).catch(() => {
            Alert.alert('Erreur', 'Impossible de passer l\'appel');
          });
        },
        style: 'default',
      },
    ]
  );
};

/**
 * Ouvre l'itinéraire vers la clinique dans l'app de navigation
 */
export const openDirections = (contact: EmergencyContact): void => {
  const scheme = Platform.select({
    ios: 'maps:',
    android: 'geo:',
    default: 'https://www.google.com/maps',
  });

  let url = '';

  if (contact.latitude && contact.longitude) {
    if (Platform.OS === 'ios') {
      url = `${scheme}?daddr=${contact.latitude},${contact.longitude}&dirflg=d`;
    } else if (Platform.OS === 'android') {
      url = `${scheme}${contact.latitude},${contact.longitude}?q=${contact.latitude},${contact.longitude}(${encodeURIComponent(contact.name)})`;
    } else {
      // Web
      url = `https://www.google.com/maps/dir/?api=1&destination=${contact.latitude},${contact.longitude}`;
    }
  } else {
    // Fallback: utiliser l'adresse
    const address = encodeURIComponent(contact.address);
    if (Platform.OS === 'ios') {
      url = `${scheme}?daddr=${address}&dirflg=d`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    }
  }

  Linking.openURL(url).catch(() => {
    Alert.alert('Erreur', 'Impossible d\'ouvrir l\'itinéraire');
  });
};

/**
 * Prépare les données médicales d'un animal pour l'urgence
 */
export const prepareEmergencyData = (pet: Pet): EmergencyData => {
  return {
    petId: pet.id,
    petName: pet.name,
    species: pet.type,
    breed: pet.breed || 'Non précisé',
    age: pet.age || 0,
    weight: pet.weight || 0,
    medicalConditions: [],
    currentMedications: [],
    allergies: [],
    lastVetVisit: undefined,
    vaccinations: [],
  };
};

/**
 * Partage les données médicales via SMS ou email
 */
export const shareEmergencyData = async (
  emergencyData: EmergencyData,
  contact: EmergencyContact,
  method: 'sms' | 'email' = 'sms'
): Promise<void> => {
  const message = `
🚨 URGENCE VÉTÉRINAIRE 🚨

Animal: ${emergencyData.petName}
Espèce: ${emergencyData.species}
Race: ${emergencyData.breed}
Âge: ${emergencyData.age} an(s)
Poids: ${emergencyData.weight} kg

${emergencyData.medicalConditions && emergencyData.medicalConditions.length > 0 ? `
Conditions médicales:
${emergencyData.medicalConditions.map(c => `- ${c}`).join('\n')}
` : ''}

${emergencyData.currentMedications && emergencyData.currentMedications.length > 0 ? `
Médicaments actuels:
${emergencyData.currentMedications.map(m => `- ${m}`).join('\n')}
` : ''}

${emergencyData.allergies && emergencyData.allergies.length > 0 ? `
Allergies:
${emergencyData.allergies.map(a => `- ${a}`).join('\n')}
` : ''}

Envoyé depuis PetCare+ 🐾
  `.trim();

  try {
    if (method === 'sms') {
      const smsUrl = Platform.OS === 'ios'
        ? `sms:${contact.phone}&body=${encodeURIComponent(message)}`
        : `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      
      await Linking.openURL(smsUrl);
    } else {
      const emailUrl = `mailto:?subject=${encodeURIComponent('Urgence vétérinaire - ' + emergencyData.petName)}&body=${encodeURIComponent(message)}`;
      await Linking.openURL(emailUrl);
    }
  } catch (error) {
    console.error('Error sharing emergency data:', error);
    Alert.alert('Erreur', 'Impossible de partager les données');
  }
};

/**
 * Partage la position actuelle avec le contact
 */
export const shareLocation = async (contact: EmergencyContact): Promise<void> => {
  Alert.alert(
    '📍 Partager ma position',
    `Voulez-vous partager votre position actuelle avec ${contact.name} ?`,
    [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, partager',
        onPress: async () => {
          const location = await getCurrentLocation();
          if (location) {
            const { latitude, longitude } = location.coords;
            const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const message = `Ma position actuelle: ${locationUrl}`;
            
            const smsUrl = Platform.OS === 'ios'
              ? `sms:${contact.phone}&body=${encodeURIComponent(message)}`
              : `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
            
            await Linking.openURL(smsUrl).catch(() => {
              Alert.alert('Erreur', 'Impossible de partager la position');
            });
          } else {
            Alert.alert('Erreur', 'Impossible d\'obtenir votre position');
          }
        },
      },
    ]
  );
};

/**
 * Signale une erreur dans les coordonnées d'une clinique
 */
export const reportClinicError = async (
  clinicId: string,
  errorType: 'phone' | 'address' | 'hours' | 'other',
  description: string
): Promise<void> => {
  try {
    // TODO: Envoyer le signalement au backend
    console.log('Clinic error reported:', { clinicId, errorType, description });
    
    Alert.alert(
      'Merci !',
      'Votre signalement a été enregistré. Nous mettrons à jour les informations dans les plus brefs délais.'
    );
  } catch (error) {
    console.error('Error reporting clinic error:', error);
    Alert.alert('Erreur', 'Impossible d\'envoyer le signalement');
  }
};



