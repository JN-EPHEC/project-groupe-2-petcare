import { WellnessEntry } from '../types/premium';

/**
 * Formate les données pour les graphiques
 */
export const formatChartData = (entries: WellnessEntry[]) => {
  // Trier par date croissante pour le graphique
  const sorted = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return {
    labels: sorted.map(entry => formatDate(entry.date)),
    datasets: [{
      data: sorted.map(entry => entry.value)
    }]
  };
};

/**
 * Formate une date pour l'affichage
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
};

/**
 * Formate une date complète
 */
export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('fr-FR', options);
};

/**
 * Calcule la variation entre deux valeurs
 */
export const calculateChange = (current: number, previous: number): {
  value: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
} => {
  const value = current - previous;
  const percentage = previous !== 0 ? (value / previous) * 100 : 0;
  
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(percentage) > 1) {
    direction = percentage > 0 ? 'up' : 'down';
  }
  
  return { value, percentage, direction };
};

/**
 * Obtient la couleur selon le type de wellness
 */
export const getWellnessColor = (type: string): string => {
  switch (type) {
    case 'weight':
      return '#FF6B6B';
    case 'activity':
      return '#4ECDC4';
    case 'food':
      return '#FFB300';
    case 'growth':
      return '#95E1D3';
    default:
      return '#6C757D';
  }
};

/**
 * Obtient l'icône selon le type de wellness
 */
export const getWellnessIcon = (type: string): string => {
  switch (type) {
    case 'weight':
      return 'scale-outline';
    case 'activity':
      return 'walk-outline';
    case 'food':
      return 'restaurant-outline';
    case 'growth':
      return 'trending-up-outline';
    default:
      return 'analytics-outline';
  }
};

/**
 * Obtient l'unité selon le type
 */
export const getWellnessUnit = (type: string): string => {
  switch (type) {
    case 'weight':
      return 'kg';
    case 'activity':
      return 'min';
    case 'food':
      return 'g';
    case 'growth':
      return 'cm';
    default:
      return '';
  }
};

/**
 * Obtient le label selon le type
 */
export const getWellnessLabel = (type: string): string => {
  switch (type) {
    case 'weight':
      return 'Poids';
    case 'activity':
      return 'Activité';
    case 'food':
      return 'Alimentation';
    case 'growth':
      return 'Croissance';
    default:
      return 'Données';
  }
};

/**
 * Valide une valeur selon le type
 */
export const validateWellnessValue = (type: string, value: number): {
  valid: boolean;
  message?: string;
} => {
  if (value <= 0) {
    return { valid: false, message: 'La valeur doit être positive' };
  }
  
  switch (type) {
    case 'weight':
      if (value > 200) {
        return { valid: false, message: 'Le poids semble trop élevé' };
      }
      break;
    case 'activity':
      if (value > 1440) { // 24 heures en minutes
        return { valid: false, message: 'L\'activité ne peut pas dépasser 24h' };
      }
      break;
    case 'food':
      if (value > 10000) {
        return { valid: false, message: 'La quantité semble trop élevée' };
      }
      break;
    case 'growth':
      if (value > 300) {
        return { valid: false, message: 'La taille semble trop élevée' };
      }
      break;
  }
  
  return { valid: true };
};

/**
 * Génère des recommandations basées sur les données
 */
export const generateRecommendations = (
  type: string, 
  entries: WellnessEntry[]
): string[] => {
  const recommendations: string[] = [];
  
  if (entries.length < 2) {
    recommendations.push('Continuez à enregistrer des données pour obtenir des recommandations personnalisées.');
    return recommendations;
  }
  
  const latest = entries[0];
  const previous = entries[1];
  const change = calculateChange(latest.value, previous.value);
  
  switch (type) {
    case 'weight':
      if (change.direction === 'up' && Math.abs(change.percentage) > 10) {
        recommendations.push('Prise de poids rapide détectée. Consultez votre vétérinaire.');
        recommendations.push('Vérifiez les portions alimentaires et l\'activité physique.');
      } else if (change.direction === 'down' && Math.abs(change.percentage) > 10) {
        recommendations.push('Perte de poids rapide détectée. Consultez votre vétérinaire.');
        recommendations.push('Assurez-vous que votre animal mange normalement.');
      } else {
        recommendations.push('Le poids est stable. Continuez ainsi !');
      }
      break;
      
    case 'activity':
      if (change.direction === 'down' && Math.abs(change.percentage) > 30) {
        recommendations.push('Baisse d\'activité importante. Encouragez le jeu et les promenades.');
        recommendations.push('Si la léthargie persiste, consultez un vétérinaire.');
      } else if (latest.value < 30) {
        recommendations.push('Activité quotidienne faible. Essayez d\'augmenter les sorties.');
      } else {
        recommendations.push('Bon niveau d\'activité. Votre animal est en forme !');
      }
      break;
      
    case 'food':
      if (change.direction === 'down' && Math.abs(change.percentage) > 30) {
        recommendations.push('Diminution de l\'appétit détectée. Surveillez le comportement.');
      } else if (change.direction === 'up' && Math.abs(change.percentage) > 30) {
        recommendations.push('Augmentation de l\'appétit. Vérifiez que les portions restent appropriées.');
      }
      break;
  }
  
  return recommendations;
};







