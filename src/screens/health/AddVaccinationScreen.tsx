import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Input } from '../../components';
import { addVaccination } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

interface AddVaccinationScreenProps {
  navigation: any;
  route: any;
}

export const AddVaccinationScreen: React.FC<AddVaccinationScreenProps> = ({
  navigation,
  route,
}) => {
  const { pet, onSave } = route.params;
  const { user } = useAuth();

  const [type, setType] = useState('');
  const [date, setDate] = useState(new Date());
  const [vet, setVet] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const validateDate = (dateStr: string): boolean => {
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateStr.match(regex);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    // Vérifier les limites
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;
    
    // Vérifier les jours par mois
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Année bissextile
    if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
      daysInMonth[1] = 29;
    }
    
    if (day > daysInMonth[month - 1]) return false;
    
    return true;
  };

  const validate = (): boolean => {
    if (!type.trim()) {
      showError('Veuillez entrer un type de vaccin');
      return false;
    }

    if (type.length > 50) {
      showError('Le type de vaccin ne peut pas dépasser 50 caractères');
      return false;
    }

    // Pas de validation de format de date car on utilise un date picker natif
    // La date est toujours valide

    return true;
  };

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Erreur', message);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);

      await addVaccination({
        petId: pet.id,
        petName: pet.name,
        ownerId: pet.ownerId || user?.id || '',
        type: type.trim(),
        date: date.toISOString(),
        vet: vet.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      console.log('✅ Vaccin ajouté avec succès');
      setIsSuccess(true);
      setIsSaving(false);

      if (onSave) onSave();

      // Retour après 1.5 secondes
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('Error adding vaccination:', error);
      setIsSaving(false);
      showError(error.message || 'Impossible d\'ajouter le vaccin');
    }
  };

  const getButtonStyle = () => {
    if (isSuccess) return [styles.saveButton, styles.saveButtonSuccess];
    if (isSaving) return [styles.saveButton, styles.saveButtonDisabled];
    return styles.saveButton;
  };

  const getButtonContent = () => {
    if (isSuccess) {
      return (
        <>
          <Ionicons name="checkmark-circle" size={24} color={colors.white} />
          <Text style={styles.saveButtonText}>Vaccin ajouté !</Text>
        </>
      );
    }
    if (isSaving) {
      return (
        <>
          <ActivityIndicator size="small" color={colors.white} />
          <Text style={styles.saveButtonText}>Enregistrement...</Text>
        </>
      );
    }
    return (
      <>
        <Ionicons name="save" size={24} color={colors.white} />
        <Text style={styles.saveButtonText}>Enregistrer le vaccin</Text>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un vaccin</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du vaccin</Text>

          <Input
            label="Type de vaccin *"
            value={type}
            onChangeText={setType}
            placeholder="Ex: Rage, DHPP, Leucose..."
            maxLength={50}
          />
          <Text style={styles.helperText}>
            {type.length}/50 caractères
            {type.length > 50 && (
              <Text style={{ color: '#FF6B6B' }}> - Maximum dépassé !</Text>
            )}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date du vaccin *</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.dateInputContainer}>
                <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <input
                  type="date"
                  value={date.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setDate(newDate);
                    }
                  }}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.navy,
                    outline: 'none',
                    padding: '8px 0',
                  }}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.helperText}>
              Format : JJ/MM/AAAA (ex: 15/03/2024)
            </Text>
          </View>

          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Input
            label="Vétérinaire"
            value={vet}
            onChangeText={setVet}
            placeholder="Nom du vétérinaire (optionnel)"
          />

          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes additionnelles (optionnel)"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={getButtonStyle()}
          onPress={handleSave}
          disabled={isSaving || isSuccess}
          activeOpacity={0.8}
        >
          {getButtonContent()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  dateText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray,
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

