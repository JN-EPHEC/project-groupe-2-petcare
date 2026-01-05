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
import { updateVaccination } from '../../services/firestoreService';

interface EditVaccinationScreenProps {
  navigation: any;
  route: any;
}

export const EditVaccinationScreen: React.FC<EditVaccinationScreenProps> = ({
  navigation,
  route,
}) => {
  const { vaccination, pet, onSave } = route.params;

  const [type, setType] = useState(vaccination.type);
  const [date, setDate] = useState(new Date(vaccination.date));
  const [vet, setVet] = useState(vaccination.vet || '');
  const [notes, setNotes] = useState(vaccination.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
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

      await updateVaccination(vaccination.id, {
        type: type.trim(),
        date: date.toISOString(),
        vet: vet.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      console.log('✅ Vaccin modifié avec succès');
      setIsSuccess(true);
      setIsSaving(false);

      if (onSave) onSave();

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating vaccination:', error);
      setIsSaving(false);
      showError(error.message || 'Impossible de modifier le vaccin');
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
          <Text style={styles.saveButtonText}>Modifié !</Text>
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
        <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le vaccin</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.section}>
          <Input
            label="Type de vaccin *"
            value={type}
            onChangeText={setType}
            placeholder="Ex: Rage, DHPP, Leucose..."
            maxLength={50}
          />
          <Text style={styles.helperText}>{type.length}/50 caractères</Text>

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

