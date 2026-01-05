import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getPetsByOwnerId } from '../../services/firestoreService';
import { addWellnessEntry } from '../../services/wellnessService';
import { getWellnessUnit, getWellnessLabel, validateWellnessValue } from '../../utils/wellnessAnalytics';

interface AddWellnessEntryScreenProps {
  navigation: any;
  route: any;
}

export const AddWellnessEntryScreen: React.FC<AddWellnessEntryScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { petId: initialPetId } = route.params || {};
  
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [type, setType] = useState<'weight' | 'activity' | 'food' | 'growth'>('weight');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const types = [
    { id: 'weight', label: 'Poids', icon: 'scale-outline', unit: 'kg', color: '#FF6B6B' },
    { id: 'activity', label: 'Activité', icon: 'walk-outline', unit: 'min', color: '#4ECDC4' },
    { id: 'food', label: 'Alimentation', icon: 'restaurant-outline', unit: 'g', color: '#FFB300' },
    { id: 'growth', label: 'Croissance', icon: 'trending-up-outline', unit: 'cm', color: '#95E1D3' },
  ];
  
  useEffect(() => {
    loadPets();
  }, [user]);
  
  const loadPets = async () => {
    if (!user?.id) return;
    
    try {
      const userPets = await getPetsByOwnerId(user.id);
      setPets(userPets);
      
      if (initialPetId) {
        const pet = userPets.find(p => p.id === initialPetId);
        if (pet) setSelectedPet(pet);
      } else if (userPets.length > 0) {
        setSelectedPet(userPets[0]);
      }
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };
  
  const handleSave = async () => {
    console.log('🔘 Bouton Enregistrer cliqué');
    
    if (!selectedPet) {
      const message = 'Veuillez sélectionner un animal';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Erreur', message);
      }
      return;
    }
    
    const numValue = parseFloat(value);
    console.log('📊 Valeur entrée:', value, '→ Nombre:', numValue);
    
    if (isNaN(numValue) || numValue <= 0) {
      const message = 'Veuillez entrer une valeur valide (nombre positif)';
      console.log('❌ Valeur invalide');
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Erreur', message);
      }
      return;
    }
    
    // Valider la valeur selon le type
    const validation = validateWellnessValue(type, numValue);
    if (!validation.valid) {
      console.log('❌ Validation échouée:', validation.message);
      const message = validation.message || 'Valeur invalide';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Attention', message);
      }
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('💾 Début enregistrement...');
      
      const entryData = {
        petId: selectedPet.id,
        petName: selectedPet.name,
        ownerId: user?.id || '',
        type,
        date: new Date(date).toISOString(),
        value: numValue,
        unit: getWellnessUnit(type),
        notes: notes.trim() || undefined,
      };
      
      console.log('📦 Données à enregistrer:', entryData);
      
      await addWellnessEntry(entryData);
      
      console.log('✅ Enregistrement réussi !');
      setIsSuccess(true);
      setIsSaving(false);
      
      // Attendre 2 secondes puis naviguer
      setTimeout(() => {
        console.log('🔙 Retour à l\'écran précédent');
        navigation.goBack();
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Erreur enregistrement wellness:', error);
      setIsSaving(false);
      const message = error?.message || 'Impossible d\'enregistrer la mesure';
      if (Platform.OS === 'web') {
        window.alert('Erreur: ' + message);
      } else {
        Alert.alert('Erreur', message);
      }
    }
  };
  
  const selectedTypeData = types.find(t => t.id === type);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nouvelle Mesure</Text>
          <Text style={styles.headerSubtitle}>Enregistrer une donnée de bien-être</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pet Selector */}
        <Text style={styles.label}>Animal *</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.petSelector}
        >
          {pets.map(pet => (
            <TouchableOpacity
              key={pet.id}
              style={[
                styles.petChip,
                selectedPet?.id === pet.id && styles.petChipSelected
              ]}
              onPress={() => setSelectedPet(pet)}
            >
              <Text style={styles.petEmoji}>{pet.emoji}</Text>
              <Text style={[
                styles.petName,
                selectedPet?.id === pet.id && styles.petNameSelected
              ]}>
                {pet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Type Selector */}
        <Text style={styles.label}>Type de mesure *</Text>
        <View style={styles.typeSelector}>
          {types.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.typeCard,
                type === t.id && { 
                  backgroundColor: t.color,
                  borderColor: t.color 
                }
              ]}
              onPress={() => setType(t.id as any)}
            >
              <Ionicons 
                name={t.icon as any} 
                size={32} 
                color={type === t.id ? colors.white : t.color} 
              />
              <Text style={[
                styles.typeLabel,
                type === t.id && { color: colors.white }
              ]}>
                {t.label}
              </Text>
              <Text style={[
                styles.typeUnit,
                type === t.id && { color: colors.white }
              ]}>
                ({t.unit})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Value Input */}
        <Text style={styles.label}>
          Valeur ({selectedTypeData?.unit}) *
        </Text>
        <View style={styles.valueInputContainer}>
          <TextInput
            style={styles.valueInput}
            value={value}
            onChangeText={setValue}
            placeholder={`Ex: ${type === 'weight' ? '5.5' : type === 'activity' ? '45' : type === 'food' ? '200' : '30'}`}
            placeholderTextColor={colors.gray}
            keyboardType="decimal-pad"
          />
          <View style={[styles.unitBadge, { backgroundColor: selectedTypeData?.color }]}>
            <Text style={styles.unitBadgeText}>{selectedTypeData?.unit}</Text>
          </View>
        </View>
        
        {/* Hints */}
        <View style={styles.hintBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.teal} />
          <Text style={styles.hintText}>
            {type === 'weight' && 'Pesez votre animal à la même heure pour plus de précision'}
            {type === 'activity' && 'Durée totale d\'activité physique en minutes'}
            {type === 'food' && 'Quantité totale de nourriture consommée en grammes'}
            {type === 'growth' && 'Taille ou longueur de votre animal en centimètres'}
          </Text>
        </View>
        
        {/* Date Input */}
        <Text style={styles.label}>Date *</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.gray}
        />
        
        {/* Notes */}
        <Text style={styles.label}>Notes (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Observations, comportement, contexte..."
          placeholderTextColor={colors.gray}
          multiline
          numberOfLines={4}
        />
        
        {/* Save Button */}
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            isSaving && styles.saveButtonDisabled,
            isSuccess && styles.saveButtonSuccess
          ]}
          onPress={handleSave}
          disabled={isSaving || isSuccess}
        >
          {isSuccess ? (
            <>
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
              <Text style={styles.saveButtonText}>Mesure enregistrée !</Text>
            </>
          ) : isSaving ? (
            <>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.saveButtonText}>Enregistrement...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
              <Text style={styles.saveButtonText}>Enregistrer la mesure</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    backgroundColor: colors.navy,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.lightBlue,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  petSelector: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.lightGray,
    gap: spacing.xs,
  },
  petChipSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  petEmoji: {
    fontSize: 24,
  },
  petName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  petNameSelected: {
    color: colors.white,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    gap: spacing.xs,
  },
  typeLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  typeUnit: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  valueInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  unitBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  unitBadgeText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.lightBlue,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hintText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.teal,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray,
    opacity: 0.8,
  },
  saveButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});





