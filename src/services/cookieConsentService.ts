import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
}

export interface ConsentData {
  preferences: CookiePreferences;
  timestamp: number;
  version: string; // Version de la politique de cookies
  userAgent?: string;
}

const STORAGE_KEY = '@petcare_cookie_consent';
const CURRENT_VERSION = '1.0';

/**
 * Vérifie si l'utilisateur a déjà donné son consentement
 */
export const hasGivenConsent = async (): Promise<boolean> => {
  try {
    const consent = await AsyncStorage.getItem(STORAGE_KEY);
    return consent !== null;
  } catch (error) {
    console.error('Error checking consent:', error);
    return false;
  }
};

/**
 * Sauvegarde les préférences de cookies localement (AsyncStorage)
 */
export const saveConsentLocally = async (preferences: CookiePreferences): Promise<void> => {
  try {
    const consentData: ConsentData = {
      preferences,
      timestamp: Date.now(),
      version: CURRENT_VERSION,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));
    console.log('✅ Consentement sauvegardé localement');
  } catch (error) {
    console.error('❌ Error saving consent locally:', error);
    throw error;
  }
};

/**
 * Sauvegarde les préférences de cookies dans Firestore (si utilisateur connecté)
 */
export const saveConsentToFirestore = async (
  userId: string,
  preferences: CookiePreferences
): Promise<void> => {
  try {
    const consentData: ConsentData = {
      preferences,
      timestamp: Date.now(),
      version: CURRENT_VERSION,
    };
    
    await setDoc(
      doc(db, 'users', userId),
      {
        cookieConsent: consentData,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    
    console.log('✅ Consentement sauvegardé dans Firestore');
  } catch (error) {
    console.error('❌ Error saving consent to Firestore:', error);
    // Ne pas throw pour ne pas bloquer l'utilisateur si Firestore échoue
  }
};

/**
 * Sauvegarde les préférences (local + Firestore si connecté)
 */
export const saveConsent = async (
  preferences: CookiePreferences,
  userId?: string
): Promise<void> => {
  // Sauvegarder localement (toujours)
  await saveConsentLocally(preferences);
  
  // Sauvegarder dans Firestore (si connecté)
  if (userId) {
    await saveConsentToFirestore(userId, preferences);
  }
};

/**
 * Récupère les préférences de cookies locales
 */
export const getLocalConsent = async (): Promise<ConsentData | null> => {
  try {
    const consent = await AsyncStorage.getItem(STORAGE_KEY);
    if (!consent) return null;
    return JSON.parse(consent);
  } catch (error) {
    console.error('Error getting local consent:', error);
    return null;
  }
};

/**
 * Récupère les préférences de cookies depuis Firestore
 */
export const getFirestoreConsent = async (userId: string): Promise<ConsentData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    return userData.cookieConsent || null;
  } catch (error) {
    console.error('Error getting Firestore consent:', error);
    return null;
  }
};

/**
 * Récupère les préférences (priorité à Firestore si connecté, sinon local)
 */
export const getConsent = async (userId?: string): Promise<ConsentData | null> => {
  if (userId) {
    const firestoreConsent = await getFirestoreConsent(userId);
    if (firestoreConsent) return firestoreConsent;
  }
  
  return await getLocalConsent();
};

/**
 * Vérifie si le consentement doit être redemandé (changement de version)
 */
export const shouldRequestConsentAgain = async (userId?: string): Promise<boolean> => {
  const consent = await getConsent(userId);
  
  if (!consent) return true;
  
  // Vérifier si la version a changé
  if (consent.version !== CURRENT_VERSION) return true;
  
  // Optionnel : redemander après X jours (par exemple 365 jours)
  const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
  const isExpired = Date.now() - consent.timestamp > oneYearInMs;
  
  return isExpired;
};

/**
 * Efface le consentement (pour forcer une nouvelle demande)
 */
export const clearConsent = async (userId?: string): Promise<void> => {
  try {
    // Effacer localement
    await AsyncStorage.removeItem(STORAGE_KEY);
    
    // Effacer dans Firestore
    if (userId) {
      await setDoc(
        doc(db, 'users', userId),
        {
          cookieConsent: null,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
    
    console.log('✅ Consentement effacé');
  } catch (error) {
    console.error('❌ Error clearing consent:', error);
  }
};

/**
 * Vérifie si un type de cookie spécifique est autorisé
 */
export const isCookieTypeAllowed = async (
  type: keyof CookiePreferences,
  userId?: string
): Promise<boolean> => {
  const consent = await getConsent(userId);
  
  if (!consent) {
    // Si pas de consentement, seuls les essentiels sont autorisés
    return type === 'essential';
  }
  
  return consent.preferences[type] === true;
};

/**
 * Hook helper pour vérifier les permissions de manière réactive
 */
export const getCookiePreferences = async (userId?: string): Promise<CookiePreferences> => {
  const consent = await getConsent(userId);
  
  if (!consent) {
    // Préférences par défaut (seulement essentiels)
    return {
      essential: true,
      analytics: false,
      personalization: false,
      marketing: false,
    };
  }
  
  return consent.preferences;
};



