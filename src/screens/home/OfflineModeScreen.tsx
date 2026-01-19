import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { offlineService } from '../../services/offlineService';

interface OfflineModeScreenProps {
  navigation: any;
}

export const OfflineModeScreen: React.FC<OfflineModeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  
  const [isOfflineEnabled, setIsOfflineEnabled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadOfflineStats = async () => {
    try {
      const stats = await offlineService.getOfflineStats();
      setIsOfflineEnabled(stats.enabled);
      setIsOnline(stats.isOnline);
      setPendingCount(stats.pendingCount);
      setLastSync(stats.lastSync);
    } catch (error) {
      console.error('Error loading offline stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOfflineStats();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadOfflineStats();
    }, [])
  );

  const handleToggleOfflineMode = async (value: boolean) => {
    try {
      await offlineService.setOfflineMode(value);
      setIsOfflineEnabled(value);
      
      Alert.alert(
        value ? '✅ Mode hors ligne activé' : '📡 Mode hors ligne désactivé',
        value 
          ? 'Vos données seront enregistrées localement et synchronisées automatiquement lorsque vous serez connecté.'
          : 'Toutes les données seront directement sauvegardées en ligne.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error toggling offline mode:', error);
      Alert.alert('Erreur', 'Impossible de modifier le mode hors ligne');
    }
  };

  const handleSync = async () => {
    if (pendingCount === 0) {
      Alert.alert('ℹ️ Synchronisation', 'Aucune donnée en attente de synchronisation.');
      return;
    }

    if (!isOnline) {
      Alert.alert(
        '📴 Pas de connexion',
        'Vous devez être connecté à Internet pour synchroniser vos données.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSyncing(true);
    try {
      const result = await offlineService.syncPendingData();
      await offlineService.setLastSyncDate();
      
      await loadOfflineStats();
      
      Alert.alert(
        '✅ Synchronisation terminée',
        `${result.success} élément${result.success > 1 ? 's' : ''} synchronisé${result.success > 1 ? 's' : ''} avec succès !`,
        [{ text: 'Parfait' }]
      );
    } catch (error) {
      console.error('Error syncing:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la synchronisation.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddDemoData = async () => {
    try {
      await offlineService.addDemoData();
      await loadOfflineStats();
      Alert.alert(
        '✅ Données ajoutées',
        'Des données de démonstration ont été ajoutées en attente de synchronisation.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adding demo data:', error);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      '⚠️ Effacer les données',
      'Êtes-vous sûr de vouloir effacer toutes les données en attente de synchronisation ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            try {
              await offlineService.clearPendingData();
              await loadOfflineStats();
              Alert.alert('✅ Données effacées', 'Toutes les données en attente ont été supprimées.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Erreur', 'Impossible d\'effacer les données.');
            }
          },
        },
      ]
    );
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Jamais';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins === 1) return 'Il y a 1 minute';
    if (diffMins < 60) return `Il y a ${diffMins} minutes`;
    if (diffHours === 1) return 'Il y a 1 heure';
    if (diffHours < 24) return `Il y a ${diffHours} heures`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Mode Hors Ligne</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Network Status Banner */}
        <View style={[styles.statusBanner, isOnline ? styles.statusOnline : styles.statusOffline]}>
          <Ionicons 
            name={isOnline ? 'wifi' : 'wifi-outline'} 
            size={24} 
            color={colors.white} 
          />
          <Text style={styles.statusText}>
            {isOnline ? '📡 Connecté à Internet' : '📴 Hors ligne'}
          </Text>
        </View>

        {/* Main Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleHeader}>
            <Ionicons name="cloud-offline" size={32} color={colors.navy} />
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Activer le mode hors ligne</Text>
              <Text style={styles.toggleDescription}>
                Continuez à utiliser l'application sans connexion Internet
              </Text>
            </View>
            <Switch
              value={isOfflineEnabled}
              onValueChange={handleToggleOfflineMode}
              trackColor={{ false: colors.gray, true: colors.teal }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.gray}
            />
          </View>
        </View>

        {/* Sync Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          
          <View style={styles.statRow}>
            <View style={styles.statIconContainer}>
              <Ionicons name="hourglass" size={24} color="#FF9800" />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Données en attente</Text>
              <Text style={styles.statValue}>{pendingCount} élément{pendingCount !== 1 ? 's' : ''}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <View style={styles.statIconContainer}>
              <Ionicons name="sync" size={24} color={colors.teal} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Dernière synchronisation</Text>
              <Text style={styles.statValue}>{formatLastSync(lastSync)}</Text>
            </View>
          </View>
        </View>

        {/* Sync Button */}
        {pendingCount > 0 && (
          <TouchableOpacity 
            style={[styles.syncButton, (!isOnline || isSyncing) && styles.syncButtonDisabled]}
            onPress={handleSync}
            disabled={!isOnline || isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="sync" size={24} color={colors.white} />
            )}
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Synchronisation en cours...' : 'Synchroniser maintenant'}
            </Text>
          </TouchableOpacity>
        )}

        {/* How it Works */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Comment ça fonctionne ?</Text>
          
          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Les données que vous créez ou modifiez sont enregistrées localement sur votre appareil
            </Text>
          </View>

          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Lorsque vous retrouvez une connexion Internet, les données sont automatiquement synchronisées
            </Text>
          </View>

          <View style={styles.infoStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Vous pouvez également forcer la synchronisation manuellement à tout moment
            </Text>
          </View>
        </View>

        {/* Features List */}
        <View style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>Fonctionnalités disponibles hors ligne</Text>
          
          {[
            { icon: 'medical', title: 'Vaccinations', description: 'Ajouter et consulter les vaccins' },
            { icon: 'clipboard', title: 'Carnet de santé', description: 'Accéder à l\'historique médical' },
            { icon: 'notifications', title: 'Rappels', description: 'Gérer vos rappels' },
            { icon: 'document-text', title: 'Documents', description: 'Consulter les documents enregistrés' },
            { icon: 'pulse', title: 'Suivi bien-être', description: 'Enregistrer poids et activités' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name={feature.icon as any} size={22} color={colors.teal} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          ))}
        </View>

        {/* Demo Buttons (for testing) */}
        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>🧪 Outils de démonstration</Text>
          <Text style={styles.demoDescription}>
            Pour tester le mode hors ligne, utilisez ces boutons :
          </Text>
          
          <TouchableOpacity style={styles.demoButton} onPress={handleAddDemoData}>
            <Ionicons name="add-circle" size={20} color={colors.teal} />
            <Text style={styles.demoButtonText}>Ajouter des données de test</Text>
          </TouchableOpacity>

          {pendingCount > 0 && (
            <TouchableOpacity 
              style={[styles.demoButton, styles.demoButtonDanger]} 
              onPress={handleClearData}
            >
              <Ionicons name="trash" size={20} color="#FF6B6B" />
              <Text style={[styles.demoButtonText, styles.demoButtonTextDanger]}>
                Effacer les données en attente
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={24} color="#FF9800" />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>Important</Text>
            <Text style={styles.warningText}>
              Le mode hors ligne est une fonctionnalité expérimentale. Assurez-vous de synchroniser régulièrement vos données pour éviter toute perte d'information.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#FF6B6B',
  },
  statusText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  toggleCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  toggleDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    lineHeight: 18,
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: spacing.sm,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.teal,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  syncButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.6,
  },
  syncButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
    paddingTop: 4,
  },
  featuresCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
  },
  demoCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: '#FFB300',
    borderStyle: 'dashed',
  },
  demoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  demoDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  demoButtonDanger: {
    borderColor: '#FF6B6B',
  },
  demoButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
  },
  demoButtonTextDanger: {
    color: '#FF6B6B',
  },
  warningCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#FFF3E0',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.black,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
