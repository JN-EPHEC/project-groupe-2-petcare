import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc,
  query, 
  where, 
  orderBy,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { WellnessEntry, WellnessAlert } from '../types/premium';

// ==================== WELLNESS ENTRIES ====================

export const addWellnessEntry = async (entry: Omit<WellnessEntry, 'id'>): Promise<string> => {
  try {
    const wellnessRef = collection(db, 'wellnessTracking');
    const docRef = await addDoc(wellnessRef, {
      ...entry,
      createdAt: new Date().toISOString()
    });
    
    console.log('Wellness entry added:', docRef.id);
    
    // Vérifier si des alertes doivent être déclenchées
    await checkForAlerts(entry.petId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding wellness entry:', error);
    throw error;
  }
};

export const getWellnessData = async (
  petId: string, 
  type: string, 
  period?: string
): Promise<WellnessEntry[]> => {
  try {
    const wellnessRef = collection(db, 'wellnessTracking');
    let q = query(
      wellnessRef,
      where('petId', '==', petId),
      where('type', '==', type),
      orderBy('date', 'desc')
    );
    
    // Filtrer par période si spécifié
    if (period) {
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '1m':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = new Date(0); // Tout
      }
      
      q = query(
        wellnessRef,
        where('petId', '==', petId),
        where('type', '==', type),
        where('date', '>=', startDate.toISOString()),
        orderBy('date', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WellnessEntry));
  } catch (error) {
    console.error('Error getting wellness data:', error);
    throw error;
  }
};

export const getAllWellnessData = async (petId: string): Promise<WellnessEntry[]> => {
  try {
    const wellnessRef = collection(db, 'wellnessTracking');
    const q = query(
      wellnessRef,
      where('petId', '==', petId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WellnessEntry));
  } catch (error) {
    console.error('Error getting all wellness data:', error);
    throw error;
  }
};

// ==================== WELLNESS ALERTS ====================

export const checkForAlerts = async (petId: string): Promise<WellnessAlert[]> => {
  try {
    const alerts: WellnessAlert[] = [];
    
    // Vérifier le poids
    const weightAlerts = await checkWeightAlerts(petId);
    alerts.push(...weightAlerts);
    
    // Vérifier l'activité
    const activityAlerts = await checkActivityAlerts(petId);
    alerts.push(...activityAlerts);
    
    // Vérifier l'alimentation
    const foodAlerts = await checkFoodAlerts(petId);
    alerts.push(...foodAlerts);
    
    // Sauvegarder les nouvelles alertes
    for (const alert of alerts) {
      await createAlert(alert);
    }
    
    return alerts;
  } catch (error) {
    console.error('Error checking for alerts:', error);
    return [];
  }
};

const checkWeightAlerts = async (petId: string): Promise<Omit<WellnessAlert, 'id'>[]> => {
  try {
    const alerts: Omit<WellnessAlert, 'id'>[] = [];
    
    // Récupérer les 2 dernières entrées de poids
    const wellnessRef = collection(db, 'wellnessTracking');
    const q = query(
      wellnessRef,
      where('petId', '==', petId),
      where('type', '==', 'weight'),
      orderBy('date', 'desc'),
      firestoreLimit(2)
    );
    
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => doc.data() as WellnessEntry);
    
    if (entries.length >= 2) {
      const latest = entries[0];
      const previous = entries[1];
      
      const percentChange = ((latest.value - previous.value) / previous.value) * 100;
      
      // Alerte si variation > 10%
      if (Math.abs(percentChange) > 10) {
        const type = percentChange > 0 ? 'weight_gain' : 'weight_loss';
        const severity: 'info' | 'warning' | 'critical' = 
          Math.abs(percentChange) > 20 ? 'critical' : 
          Math.abs(percentChange) > 15 ? 'warning' : 'info';
        
        alerts.push({
          petId: latest.petId,
          ownerId: latest.ownerId,
          type,
          severity,
          message: `Variation de poids de ${percentChange.toFixed(1)}% détectée. ${
            type === 'weight_gain' 
              ? 'Votre animal a pris du poids rapidement.' 
              : 'Votre animal a perdu du poids rapidement.'
          } Consultez un vétérinaire si cela persiste.`,
          triggeredAt: new Date().toISOString(),
          dismissed: false
        });
      }
    }
    
    return alerts;
  } catch (error) {
    console.error('Error checking weight alerts:', error);
    return [];
  }
};

const checkActivityAlerts = async (petId: string): Promise<Omit<WellnessAlert, 'id'>[]> => {
  try {
    const alerts: Omit<WellnessAlert, 'id'>[] = [];
    
    // Récupérer les 7 dernières entrées d'activité
    const wellnessRef = collection(db, 'wellnessTracking');
    const q = query(
      wellnessRef,
      where('petId', '==', petId),
      where('type', '==', 'activity'),
      orderBy('date', 'desc'),
      firestoreLimit(7)
    );
    
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => doc.data() as WellnessEntry);
    
    if (entries.length >= 7) {
      const average = entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length;
      const latest = entries[0];
      
      // Alerte si activité < 50% de la moyenne
      if (latest.value < average * 0.5) {
        alerts.push({
          petId: latest.petId,
          ownerId: latest.ownerId,
          type: 'low_activity',
          severity: 'warning',
          message: `Activité réduite détectée. Votre animal est moins actif que d'habitude (${latest.value} ${latest.unit} vs moyenne de ${average.toFixed(0)} ${latest.unit}).`,
          triggeredAt: new Date().toISOString(),
          dismissed: false
        });
      }
    }
    
    return alerts;
  } catch (error) {
    console.error('Error checking activity alerts:', error);
    return [];
  }
};

const checkFoodAlerts = async (petId: string): Promise<Omit<WellnessAlert, 'id'>[]> => {
  try {
    const alerts: Omit<WellnessAlert, 'id'>[] = [];
    
    // Récupérer les 2 dernières entrées d'alimentation
    const wellnessRef = collection(db, 'wellnessTracking');
    const q = query(
      wellnessRef,
      where('petId', '==', petId),
      where('type', '==', 'food'),
      orderBy('date', 'desc'),
      firestoreLimit(2)
    );
    
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => doc.data() as WellnessEntry);
    
    if (entries.length >= 2) {
      const latest = entries[0];
      const previous = entries[1];
      
      const percentChange = ((latest.value - previous.value) / previous.value) * 100;
      
      // Alerte si variation > 30%
      if (Math.abs(percentChange) > 30) {
        alerts.push({
          petId: latest.petId,
          ownerId: latest.ownerId,
          type: 'food_change',
          severity: 'info',
          message: `Changement dans l'alimentation détecté (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%). Surveillez le comportement de votre animal.`,
          triggeredAt: new Date().toISOString(),
          dismissed: false
        });
      }
    }
    
    return alerts;
  } catch (error) {
    console.error('Error checking food alerts:', error);
    return [];
  }
};

const createAlert = async (alert: Omit<WellnessAlert, 'id'>): Promise<string> => {
  try {
    // Vérifier si une alerte similaire existe déjà (non dismissée, même type, même pet, dans les dernières 24h)
    const alertsRef = collection(db, 'wellnessAlerts');
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const existingQuery = query(
      alertsRef,
      where('petId', '==', alert.petId),
      where('type', '==', alert.type),
      where('dismissed', '==', false),
      where('triggeredAt', '>=', oneDayAgo.toISOString())
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log('Similar alert already exists, skipping');
      return existingSnapshot.docs[0].id;
    }
    
    const docRef = await addDoc(alertsRef, alert);
    console.log('Alert created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const getActiveAlerts = async (petId: string): Promise<WellnessAlert[]> => {
  try {
    const alertsRef = collection(db, 'wellnessAlerts');
    const q = query(
      alertsRef,
      where('petId', '==', petId),
      where('dismissed', '==', false),
      orderBy('triggeredAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WellnessAlert));
  } catch (error) {
    console.error('Error getting active alerts:', error);
    throw error;
  }
};

export const dismissAlert = async (alertId: string): Promise<void> => {
  try {
    const alertRef = doc(db, 'wellnessAlerts', alertId);
    await updateDoc(alertRef, {
      dismissed: true
    });
    console.log('Alert dismissed:', alertId);
  } catch (error) {
    console.error('Error dismissing alert:', error);
    throw error;
  }
};

// ==================== ANALYTICS ====================

export const calculateWellnessStats = (entries: WellnessEntry[]) => {
  if (entries.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      trend: 'stable' as 'increasing' | 'decreasing' | 'stable'
    };
  }
  
  const values = entries.map(e => e.value);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Calculer la tendance (comparer première moitié vs deuxième moitié)
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (entries.length >= 4) {
    const half = Math.floor(entries.length / 2);
    const firstHalf = entries.slice(0, half);
    const secondHalf = entries.slice(half);
    
    const avgFirst = firstHalf.reduce((sum, e) => sum + e.value, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, e) => sum + e.value, 0) / secondHalf.length;
    
    const percentDiff = ((avgSecond - avgFirst) / avgFirst) * 100;
    
    if (percentDiff > 5) trend = 'increasing';
    else if (percentDiff < -5) trend = 'decreasing';
  }
  
  return { average, min, max, trend };
};




