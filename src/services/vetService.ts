import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { calculateDistance } from './emergencyService';

export interface VetProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  clinicName?: string;
  clinicAddress?: string;
  location: string;
  specialty?: string;
  specialties?: VetSpecialty[];
  description?: string;
  website?: string;
  openingHours?: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // Calculée dynamiquement
  rating?: number; // Note moyenne
  reviewCount?: number;
  isPremiumPartner?: boolean;
  isOpen24h?: boolean;
  createdAt: any;
}

export type VetSpecialty = 
  | 'general'
  | 'specialist'
  | 'emergency'
  | 'nac'
  | 'equine'
  | 'rural'
  | 'behavior'
  | 'imaging'
  | 'surgery';

export const VET_SPECIALTIES: { value: VetSpecialty; label: string; icon: string }[] = [
  { value: 'general', label: 'Généraliste', icon: '🏥' },
  { value: 'specialist', label: 'Spécialiste', icon: '👨‍⚕️' },
  { value: 'emergency', label: 'Urgences 24h/24', icon: '🚨' },
  { value: 'nac', label: 'NAC', icon: '🐹' },
  { value: 'equine', label: 'Équin', icon: '🐴' },
  { value: 'rural', label: 'Rural', icon: '🚜' },
  { value: 'behavior', label: 'Comportementaliste', icon: '🧠' },
  { value: 'imaging', label: 'Imagerie', icon: '📷' },
  { value: 'surgery', label: 'Chirurgie', icon: '🔪' },
];

export interface VetReview {
  id: string;
  vetId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  createdAt: any;
}

const FAVORITES_KEY = '@vet_favorites';

/**
 * Récupérer tous les vétérinaires avec calcul de distance
 */
export const getVetsWithDistance = async (
  userLocation?: Location.LocationObject,
  radius: number = 20 // km
): Promise<VetProfile[]> => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'vet'), where('approved', '==', true));
    const querySnapshot = await getDocs(q);
    
    const vets: VetProfile[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as VetProfile));

    // Calculer les distances si position disponible
    if (userLocation) {
      const vetsWithDistance = vets.map(vet => {
        if (vet.latitude && vet.longitude) {
          const distance = calculateDistance(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            vet.latitude,
            vet.longitude
          );
          return { ...vet, distance };
        }
        return vet;
      });

      // Filtrer par rayon et trier par distance
      return vetsWithDistance
        .filter(vet => !vet.distance || vet.distance <= radius)
        .sort((a, b) => {
          // Premium en premier
          if (a.isPremiumPartner && !b.isPremiumPartner) return -1;
          if (!a.isPremiumPartner && b.isPremiumPartner) return 1;
          // Puis par distance
          return (a.distance || 999) - (b.distance || 999);
        });
    }

    // Sans géolocalisation, trier par premium puis par rating
    return vets.sort((a, b) => {
      if (a.isPremiumPartner && !b.isPremiumPartner) return -1;
      if (!a.isPremiumPartner && b.isPremiumPartner) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  } catch (error) {
    console.error('Error getting vets:', error);
    return [];
  }
};

/**
 * Filtrer les vétérinaires par spécialité
 */
export const filterVetsBySpecialty = (vets: VetProfile[], specialty: VetSpecialty | 'all'): VetProfile[] => {
  if (specialty === 'all') return vets;
  return vets.filter(vet => vet.specialties?.includes(specialty));
};

/**
 * Rechercher des vétérinaires par nom
 */
export const searchVets = (vets: VetProfile[], keyword: string): VetProfile[] => {
  if (!keyword.trim()) return vets;
  
  const lowerKeyword = keyword.toLowerCase();
  return vets.filter(vet =>
    `${vet.firstName} ${vet.lastName}`.toLowerCase().includes(lowerKeyword) ||
    vet.clinicName?.toLowerCase().includes(lowerKeyword) ||
    vet.location?.toLowerCase().includes(lowerKeyword)
  );
};

/**
 * Trier les vétérinaires
 */
export const sortVets = (vets: VetProfile[], sortBy: 'distance' | 'rating'): VetProfile[] => {
  return [...vets].sort((a, b) => {
    if (sortBy === 'distance') {
      return (a.distance || 999) - (b.distance || 999);
    } else {
      return (b.rating || 0) - (a.rating || 0);
    }
  });
};

/**
 * Ajouter un vétérinaire aux favoris
 */
export const addVetToFavorites = async (vetId: string, userId: string): Promise<void> => {
  try {
    const favorites = await getFavoriteVets(userId);
    if (!favorites.includes(vetId)) {
      favorites.push(vetId);
      await AsyncStorage.setItem(`${FAVORITES_KEY}_${userId}`, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding vet to favorites:', error);
  }
};

/**
 * Retirer un vétérinaire des favoris
 */
export const removeVetFromFavorites = async (vetId: string, userId: string): Promise<void> => {
  try {
    const favorites = await getFavoriteVets(userId);
    const filtered = favorites.filter(id => id !== vetId);
    await AsyncStorage.setItem(`${FAVORITES_KEY}_${userId}`, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing vet from favorites:', error);
  }
};

/**
 * Récupérer les vétérinaires favoris
 */
export const getFavoriteVets = async (userId: string): Promise<string[]> => {
  try {
    const favorites = await AsyncStorage.getItem(`${FAVORITES_KEY}_${userId}`);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorite vets:', error);
    return [];
  }
};

/**
 * Vérifier si un vétérinaire est en favoris
 */
export const isVetFavorite = async (vetId: string, userId: string): Promise<boolean> => {
  const favorites = await getFavoriteVets(userId);
  return favorites.includes(vetId);
};

/**
 * Ajouter un avis sur un vétérinaire
 */
export const addVetReview = async (review: Omit<VetReview, 'id' | 'createdAt'>): Promise<void> => {
  try {
    await addDoc(collection(db, 'vet_reviews'), {
      ...review,
      createdAt: Timestamp.now(),
    });

    // Recalculer la note moyenne
    await updateVetRating(review.vetId);
  } catch (error) {
    console.error('Error adding vet review:', error);
    throw new Error('Impossible d\'ajouter l\'avis');
  }
};

/**
 * Récupérer les avis d'un vétérinaire
 */
export const getVetReviews = async (vetId: string): Promise<VetReview[]> => {
  try {
    const q = query(collection(db, 'vet_reviews'), where('vetId', '==', vetId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as VetReview)).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error getting vet reviews:', error);
    return [];
  }
};

/**
 * Mettre à jour la note moyenne d'un vétérinaire
 */
const updateVetRating = async (vetId: string): Promise<void> => {
  try {
    const reviews = await getVetReviews(vetId);
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;
      
      const vetRef = doc(db, 'users', vetId);
      await updateDoc(vetRef, {
        rating: avgRating,
        reviewCount: reviews.length,
      });
    }
  } catch (error) {
    console.error('Error updating vet rating:', error);
  }
};

/**
 * Signaler une erreur dans une fiche vétérinaire
 */
export const reportVetError = async (
  vetId: string,
  userId: string,
  errorType: 'address' | 'phone' | 'hours' | 'other',
  description: string
): Promise<void> => {
  try {
    await addDoc(collection(db, 'vet_error_reports'), {
      vetId,
      userId,
      errorType,
      description,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error reporting vet error:', error);
    throw new Error('Impossible de signaler l\'erreur');
  }
};

/**
 * Obtenir le label d'une spécialité
 */
export const getSpecialtyLabel = (specialty: VetSpecialty): string => {
  const spec = VET_SPECIALTIES.find(s => s.value === specialty);
  return spec ? spec.label : specialty;
};

/**
 * Obtenir l'icône d'une spécialité
 */
export const getSpecialtyIcon = (specialty: VetSpecialty): string => {
  const spec = VET_SPECIALTIES.find(s => s.value === specialty);
  return spec ? spec.icon : '🏥';
};



