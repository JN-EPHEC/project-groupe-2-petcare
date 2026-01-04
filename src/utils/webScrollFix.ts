import { Platform } from 'react-native';

/**
 * Style fix pour les ScrollView sur web
 * Ajoute les propriétés nécessaires pour que le scroll fonctionne sur navigateur
 */
export const webScrollViewStyle = Platform.OS === 'web' ? {
  overflow: 'auto' as const,
  height: '100%',
  WebkitOverflowScrolling: 'touch' as const,
} : {};

/**
 * Style fix pour les conteneurs sur web
 */
export const webContainerStyle = Platform.OS === 'web' ? {
  height: '100vh',
  overflow: 'hidden' as const,
} : {};



