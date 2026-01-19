import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_MODE_KEY = '@offline_mode_enabled';
const PENDING_SYNC_KEY = '@pending_sync_data';

export interface PendingData {
  id: string;
  type: 'vaccination' | 'treatment' | 'medical_history' | 'reminder' | 'document' | 'pet' | 'wellness';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

/**
 * Service de gestion du mode hors ligne
 * Note: Ceci est une implémentation de démonstration
 */
export const offlineService = {
  /**
   * Vérifier si le mode hors ligne est activé
   */
  async isOfflineModeEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(OFFLINE_MODE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking offline mode:', error);
      return false;
    }
  },

  /**
   * Activer/désactiver le mode hors ligne
   */
  async setOfflineMode(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_MODE_KEY, enabled.toString());
      console.log(`📴 Mode hors ligne ${enabled ? 'activé' : 'désactivé'}`);
    } catch (error) {
      console.error('Error setting offline mode:', error);
      throw error;
    }
  },

  /**
   * Vérifier la connectivité réseau
   */
  async checkNetworkStatus(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true && state.isInternetReachable === true;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  },

  /**
   * Ajouter des données en attente de synchronisation
   */
  async addPendingData(data: Omit<PendingData, 'id' | 'timestamp'>): Promise<void> {
    try {
      const pendingDataStr = await AsyncStorage.getItem(PENDING_SYNC_KEY);
      const pendingData: PendingData[] = pendingDataStr ? JSON.parse(pendingDataStr) : [];
      
      const newData: PendingData = {
        ...data,
        id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      
      pendingData.push(newData);
      await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pendingData));
      
      console.log(`💾 Données ajoutées en attente de synchronisation: ${data.type}`);
    } catch (error) {
      console.error('Error adding pending data:', error);
      throw error;
    }
  },

  /**
   * Obtenir toutes les données en attente
   */
  async getPendingData(): Promise<PendingData[]> {
    try {
      const pendingDataStr = await AsyncStorage.getItem(PENDING_SYNC_KEY);
      return pendingDataStr ? JSON.parse(pendingDataStr) : [];
    } catch (error) {
      console.error('Error getting pending data:', error);
      return [];
    }
  },

  /**
   * Obtenir le nombre de données en attente
   */
  async getPendingDataCount(): Promise<number> {
    try {
      const pendingData = await this.getPendingData();
      return pendingData.length;
    } catch (error) {
      console.error('Error getting pending data count:', error);
      return 0;
    }
  },

  /**
   * Simuler la synchronisation des données (pour démo)
   */
  async syncPendingData(): Promise<{ success: number; failed: number }> {
    try {
      const pendingData = await this.getPendingData();
      
      if (pendingData.length === 0) {
        return { success: 0, failed: 0 };
      }

      console.log(`🔄 Début de la synchronisation de ${pendingData.length} éléments...`);
      
      // Simuler un délai de synchronisation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Pour la démo, on simule que toutes les synchros réussissent
      const success = pendingData.length;
      
      // Effacer les données synchronisées
      await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify([]));
      
      console.log(`✅ Synchronisation terminée: ${success} éléments synchronisés`);
      
      return { success, failed: 0 };
    } catch (error) {
      console.error('Error syncing data:', error);
      return { success: 0, failed: await this.getPendingDataCount() };
    }
  },

  /**
   * Effacer toutes les données en attente
   */
  async clearPendingData(): Promise<void> {
    try {
      await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify([]));
      console.log('🗑️ Données en attente effacées');
    } catch (error) {
      console.error('Error clearing pending data:', error);
      throw error;
    }
  },

  /**
   * Obtenir les statistiques du mode hors ligne
   */
  async getOfflineStats(): Promise<{
    enabled: boolean;
    isOnline: boolean;
    pendingCount: number;
    lastSync: Date | null;
  }> {
    try {
      const [enabled, isOnline, pendingCount] = await Promise.all([
        this.isOfflineModeEnabled(),
        this.checkNetworkStatus(),
        this.getPendingDataCount(),
      ]);

      // Pour la démo, on simule une date de dernière synchro
      const lastSyncStr = await AsyncStorage.getItem('@last_sync_date');
      const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;

      return {
        enabled,
        isOnline,
        pendingCount,
        lastSync,
      };
    } catch (error) {
      console.error('Error getting offline stats:', error);
      return {
        enabled: false,
        isOnline: true,
        pendingCount: 0,
        lastSync: null,
      };
    }
  },

  /**
   * Enregistrer la date de dernière synchronisation
   */
  async setLastSyncDate(): Promise<void> {
    try {
      await AsyncStorage.setItem('@last_sync_date', new Date().toISOString());
    } catch (error) {
      console.error('Error setting last sync date:', error);
    }
  },

  /**
   * Ajouter des données de démonstration (pour tester)
   */
  async addDemoData(): Promise<void> {
    const demoData: Omit<PendingData, 'id' | 'timestamp'>[] = [
      {
        type: 'vaccination',
        action: 'create',
        data: { vaccineName: 'Rage', petName: 'Max' },
      },
      {
        type: 'reminder',
        action: 'update',
        data: { title: 'Vermifuge', completed: true },
      },
      {
        type: 'wellness',
        action: 'create',
        data: { type: 'weight', value: 25 },
      },
    ];

    for (const data of demoData) {
      await this.addPendingData(data);
    }
    
    console.log('📝 Données de démonstration ajoutées');
  },
};

