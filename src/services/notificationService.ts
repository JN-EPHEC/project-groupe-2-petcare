import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Types de notifications
export type NotificationType = 
  | 'reminder' // Rappels
  | 'appointment' // Rendez-vous
  | 'vaccination' // Vaccins
  | 'health' // Santé
  | 'general'; // Général

// Préférences de notifications
export interface NotificationPreferences {
  enabled: boolean; // Notifications activées globalement
  reminders: boolean; // Rappels
  appointments: boolean; // Rendez-vous
  vaccinations: boolean; // Vaccins
  health: boolean; // Santé
  marketing: boolean; // Marketing/promotions
  sound: boolean; // Son
  vibration: boolean; // Vibration
  badge: boolean; // Badge
  lockScreen: boolean; // Afficher sur écran verrouillé (avec données masquées si false)
}

// Préférences par défaut
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  reminders: true,
  appointments: true,
  vaccinations: true,
  health: true,
  marketing: false,
  sound: true,
  vibration: true,
  badge: true,
  lockScreen: false, // Par défaut, masquer les données sensibles
};

const STORAGE_KEY = '@notification_preferences';
const CONSENT_KEY = '@notification_consent_shown';
const TOKEN_KEY = '@push_token';

// Demander les permissions de notifications
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('⚠️ Les notifications ne fonctionnent que sur un appareil physique');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Permission de notifications refusée');
      return false;
    }

    console.log('✅ Permission de notifications accordée');
    return true;
  } catch (error) {
    console.error('Erreur demande permissions notifications:', error);
    return false;
  }
};

// Obtenir le token de push notification
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('⚠️ Push notifications sur appareil physique uniquement');
    return null;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // À remplacer par votre project ID Expo
    });

    const token = tokenData.data;
    console.log('📱 Push token:', token);

    // Sauvegarder le token localement
    await AsyncStorage.setItem(TOKEN_KEY, token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (error) {
    console.error('Erreur enregistrement push notifications:', error);
    return null;
  }
};

// Sauvegarder le token dans Firestore
export const savePushTokenToFirestore = async (userId: string, token: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      pushToken: token,
      pushTokenUpdatedAt: new Date().toISOString(),
    });
    console.log('✅ Push token sauvegardé dans Firestore');
  } catch (error) {
    console.error('Erreur sauvegarde push token:', error);
  }
};

// Sauvegarder les préférences de notifications
export const saveNotificationPreferences = async (
  preferences: NotificationPreferences,
  userId?: string
): Promise<void> => {
  try {
    // Sauvegarder localement
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    console.log('✅ Préférences notifications sauvegardées localement');

    // Sauvegarder dans Firestore si userId fourni
    if (userId) {
      await updateDoc(doc(db, 'users', userId), {
        notificationPreferences: preferences,
        notificationPreferencesUpdatedAt: new Date().toISOString(),
      });
      console.log('✅ Préférences notifications sauvegardées dans Firestore');
    }
  } catch (error) {
    console.error('Erreur sauvegarde préférences notifications:', error);
    throw error;
  }
};

// Récupérer les préférences de notifications
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Erreur récupération préférences notifications:', error);
    return DEFAULT_PREFERENCES;
  }
};

// Réinitialiser les préférences de notifications
export const resetNotificationPreferences = async (userId?: string): Promise<void> => {
  try {
    await saveNotificationPreferences(DEFAULT_PREFERENCES, userId);
    console.log('✅ Préférences notifications réinitialisées');
  } catch (error) {
    console.error('Erreur réinitialisation préférences:', error);
    throw error;
  }
};

// Vérifier si le consentement a été demandé
export const hasShownConsentModal = async (): Promise<boolean> => {
  try {
    const shown = await AsyncStorage.getItem(CONSENT_KEY);
    return shown === 'true';
  } catch (error) {
    console.error('Erreur vérification consentement:', error);
    return false;
  }
};

// Marquer le consentement comme affiché
export const markConsentAsShown = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(CONSENT_KEY, 'true');
  } catch (error) {
    console.error('Erreur marquage consentement:', error);
  }
};

// Planifier une notification locale
export const scheduleNotification = async (
  title: string,
  body: string,
  data: any = {},
  triggerDate: Date,
  type: NotificationType = 'general'
): Promise<string | null> => {
  try {
    const preferences = await getNotificationPreferences();

    // Vérifier si les notifications sont activées
    if (!preferences.enabled) {
      console.log('⚠️ Notifications désactivées par l\'utilisateur');
      return null;
    }

    // Vérifier si le type de notification est activé
    const typeKey = type === 'reminder' ? 'reminders' :
                    type === 'appointment' ? 'appointments' :
                    type === 'vaccination' ? 'vaccinations' :
                    type === 'health' ? 'health' : null;

    if (typeKey && !preferences[typeKey as keyof NotificationPreferences]) {
      console.log(`⚠️ Notifications ${type} désactivées`);
      return null;
    }

    // Masquer les données sensibles si lockScreen est false
    const notificationContent: Notifications.NotificationContentInput = {
      title: preferences.lockScreen ? title : 'PetCare+',
      body: preferences.lockScreen ? body : 'Vous avez une nouvelle notification',
      data: { ...data, type },
      sound: preferences.sound,
      badge: preferences.badge ? 1 : undefined,
    };

    if (Platform.OS === 'android') {
      notificationContent.vibrate = preferences.vibration ? [0, 250, 250, 250] : [];
    }

    const trigger = triggerDate.getTime() > Date.now()
      ? { date: triggerDate }
      : null;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger,
    });

    console.log('✅ Notification planifiée:', identifier);
    return identifier;
  } catch (error) {
    console.error('Erreur planification notification:', error);
    return null;
  }
};

// Envoyer une notification immédiate
export const sendImmediateNotification = async (
  title: string,
  body: string,
  data: any = {},
  type: NotificationType = 'general'
): Promise<string | null> => {
  try {
    const preferences = await getNotificationPreferences();

    if (!preferences.enabled) {
      console.log('⚠️ Notifications désactivées');
      return null;
    }

    const notificationContent: Notifications.NotificationContentInput = {
      title: preferences.lockScreen ? title : 'PetCare+',
      body: preferences.lockScreen ? body : 'Vous avez une nouvelle notification',
      data: { ...data, type },
      sound: preferences.sound,
      badge: preferences.badge ? 1 : undefined,
    };

    const identifier = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null, // Immédiate
    });

    console.log('✅ Notification immédiate envoyée:', identifier);
    return identifier;
  } catch (error) {
    console.error('Erreur envoi notification:', error);
    return null;
  }
};

// Annuler une notification planifiée
export const cancelNotification = async (identifier: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log('✅ Notification annulée:', identifier);
  } catch (error) {
    console.error('Erreur annulation notification:', error);
  }
};

// Annuler toutes les notifications planifiées
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Toutes les notifications annulées');
  } catch (error) {
    console.error('Erreur annulation notifications:', error);
  }
};

// Obtenir toutes les notifications planifiées
export const getAllScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Erreur récupération notifications planifiées:', error);
    return [];
  }
};

// Effacer le badge
export const clearBadge = async (): Promise<void> => {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Erreur effacement badge:', error);
  }
};

// Planifier une notification de rappel
export const scheduleReminderNotification = async (
  petName: string,
  reminderTitle: string,
  reminderDate: Date,
  reminderId: string
): Promise<string | null> => {
  return scheduleNotification(
    `Rappel pour ${petName}`,
    reminderTitle,
    { reminderId, petName },
    reminderDate,
    'reminder'
  );
};

// Planifier une notification de rendez-vous
export const scheduleAppointmentNotification = async (
  petName: string,
  vetName: string,
  appointmentDate: Date,
  appointmentId: string
): Promise<string | null> => {
  // Notification 24h avant
  const oneDayBefore = new Date(appointmentDate);
  oneDayBefore.setHours(appointmentDate.getHours() - 24);

  return scheduleNotification(
    `Rendez-vous demain`,
    `${petName} a un rendez-vous avec ${vetName}`,
    { appointmentId, petName, vetName },
    oneDayBefore,
    'appointment'
  );
};

// Planifier une notification de vaccination
export const scheduleVaccinationNotification = async (
  petName: string,
  vaccineName: string,
  dueDate: Date,
  vaccinationId: string
): Promise<string | null> => {
  // Notification 1 semaine avant
  const oneWeekBefore = new Date(dueDate);
  oneWeekBefore.setDate(dueDate.getDate() - 7);

  return scheduleNotification(
    `Vaccination à prévoir`,
    `${petName} doit recevoir le vaccin ${vaccineName} bientôt`,
    { vaccinationId, petName, vaccineName },
    oneWeekBefore,
    'vaccination'
  );
};

// Envoyer une notification immédiate pour une nouvelle demande de RDV
export const sendNewAppointmentRequestNotification = async (
  vetId: string,
  petName: string,
  ownerName: string,
  requestedDate: string,
  requestedTime: string,
  appointmentId: string
): Promise<string | null> => {
  try {
    console.log('🔔 sendNewAppointmentRequestNotification:', { vetId, petName, ownerName, requestedDate, requestedTime });
    
    // Notification immédiate (maintenant + 1 seconde pour éviter les problèmes)
    const now = new Date();
    now.setSeconds(now.getSeconds() + 1);
    
    return scheduleNotification(
      `Nouvelle demande de rendez-vous`,
      `${ownerName} souhaite un RDV pour ${petName} le ${requestedDate} à ${requestedTime}`,
      { 
        appointmentId, 
        petName, 
        ownerName, 
        requestedDate, 
        requestedTime,
        type: 'new_appointment_request',
        targetUserId: vetId
      },
      now,
      'appointment'
    );
  } catch (error) {
    console.error('❌ Erreur envoi notification nouvelle demande:', error);
    return null;
  }
};

