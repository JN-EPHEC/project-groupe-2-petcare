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
import { Input, CustomPicker } from '../../components';
import { addTreatment } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

interface AddTreatmentScreenProps {
  navigation: any;
  route: any;
}

const TREATMENT_TYPES = [
  { label: 'Anti-puces', value: 'antipuce' },
  { label: 'Antibiotique', value: 'antibiotique' },
  { label: 'Vermifuge', value: 'vermifuge' },
  { label: 'Autre', value: 'autre' },
];

export const AddTreatmentScreen: React.FC<AddTreatmentScreenProps> = ({
  navigation,
  route,
}) => {
  const { pet, onSave } = route.params;
  const { user } = useAuth();

  const [type, setType] = useState<'antipuce' | 'antibiotique' | 'vermifuge' | 'autre'>('antipuce');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [frequency, setFrequency] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const validate = (): boolean => {
    if (!name.trim()) {
      showError('Veuillez entrer un nom de traitement');
      return false;
    }

    if (endDate < startDate) {
      showError('La date de fin doit être après la date de début');
      return false;
    }

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

      await addTreatment({
        petId: pet.id,
        petName: pet.name,
        ownerId: user?.id || '',
        type,
        name: name.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        frequency: frequency.trim() || undefined,
        dosage: dosage.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      console.log('✅ Traitement ajouté avec succès');
      setIsSuccess(true);
      setIsSaving(false);

      if (onSave) onSave();

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('Error adding treatment:', error);
      setIsSaving(false);
      showError(error.message || 'Impossible d\'ajouter le traitement');
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
          <Text style={styles.saveButtonText}>Traitement ajouté !</Text>
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
        <Text style={styles.saveButtonText}>Enregistrer le traitement</Text>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un traitement</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de traitement</Text>
          <CustomPicker
            value={type}
            onValueChange={(value) => setType(value as any)}
            options={TREATMENT_TYPES}
            placeholder="Sélectionnez un type"
            icon="medical"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du traitement</Text>

          <Input
            label="Nom du traitement *"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Frontline, Amoxicilline..."
          />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date de début *</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.dateInputContainer}>
                <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <input
                  type="date"
                  value={startDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setStartDate(newDate);
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
                onPress={() => setShowStartDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showStartDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date de fin *</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.dateInputContainer}>
                <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <input
                  type="date"
                  value={endDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setEndDate(newDate);
                    }
                  }}
                  min={startDate.toISOString().split('T')[0]}
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
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>
                  {endDate.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showEndDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
              minimumDate={startDate}
            />
          )}

          <Input
            label="Dosage"
            value={dosage}
            onChangeText={setDosage}
            placeholder="Ex: 1 comprimé (optionnel)"
          />

          <Input
            label="Fréquence"
            value={frequency}
            onChangeText={setFrequency}
            placeholder="Ex: 2 fois par jour (optionnel)"
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



