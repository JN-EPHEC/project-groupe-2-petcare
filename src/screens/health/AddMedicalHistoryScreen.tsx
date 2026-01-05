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
import * as DocumentPicker from 'expo-document-picker';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Input, CustomPicker } from '../../components';
import { addMedicalHistory } from '../../services/firestoreService';
import { uploadMedicalDocument } from '../../services/imageUploadService';
import { useAuth } from '../../context/AuthContext';

interface AddMedicalHistoryScreenProps {
  navigation: any;
  route: any;
}

const HISTORY_TYPES = [
  { label: 'Maladie', value: 'maladie' },
  { label: 'Allergie', value: 'allergie' },
  { label: 'Chirurgie', value: 'chirurgie' },
  { label: 'Autre', value: 'autre' },
];

export const AddMedicalHistoryScreen: React.FC<AddMedicalHistoryScreenProps> = ({
  navigation,
  route,
}) => {
  const { pet, onSave } = route.params;
  const { user } = useAuth();

  const [type, setType] = useState<'maladie' | 'allergie' | 'chirurgie' | 'autre'>('maladie');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [documents, setDocuments] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        // Vérifier la taille (5 Mo max = 5 * 1024 * 1024 bytes)
        if (file.size && file.size > 5 * 1024 * 1024) {
          (Platform.OS === 'web' ? window.alert : Alert.alert)('Le document doit faire moins de 5 Mo');
          return;
        }

        setSelectedFiles([...selectedFiles, file]);
        console.log('✅ Document sélectionné:', file.name);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      (Platform.OS === 'web' ? window.alert : Alert.alert)('Veuillez entrer un titre');
      return false;
    }

    if (!description.trim()) {
      (Platform.OS === 'web' ? window.alert : Alert.alert)('Veuillez entrer une description');
      return false;
    }

    if (description.length > 200) {
      (Platform.OS === 'web' ? window.alert : Alert.alert)('La description ne peut pas dépasser 200 caractères');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);
      setIsUploadingDoc(true);

      // Upload des documents
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const url = await uploadMedicalDocument(user?.id || '', pet.id, file.uri);
        uploadedUrls.push(url);
      }
      setIsUploadingDoc(false);

      await addMedicalHistory({
        petId: pet.id,
        petName: pet.name,
        ownerId: user?.id || '',
        type,
        title: title.trim(),
        description: description.trim(),
        date: date.toISOString(),
        documents: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      });

      console.log('✅ Antécédent ajouté avec succès');
      setIsSuccess(true);
      setIsSaving(false);

      if (onSave) onSave();
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error: any) {
      console.error('Error adding medical history:', error);
      setIsSaving(false);
      setIsUploadingDoc(false);
      (Platform.OS === 'web' ? window.alert : Alert.alert)(error.message || 'Erreur');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un antécédent</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type d'antécédent</Text>
          <CustomPicker
            value={type}
            onValueChange={(value) => setType(value as any)}
            options={HISTORY_TYPES}
            icon="document-text"
          />
        </View>

        <View style={styles.section}>
          <Input label="Titre *" value={title} onChangeText={setTitle} placeholder="Ex: Fracture patte arrière" />

          <Input
            label="Description *"
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez l'antécédent..."
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.helperText}>
            {description.length}/200 caractères
            {description.length > 200 && <Text style={{ color: '#FF6B6B' }}> - Maximum dépassé !</Text>}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date *</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.dateInputContainer}>
                <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <input
                  type="date"
                  value={date.toISOString().split('T')[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '16px', fontWeight: '600', color: colors.navy, outline: 'none', padding: '8px 0' }}
                />
              </View>
            ) : (
              <TouchableOpacity style={styles.dateInputContainer} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>{date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</Text>
              </TouchableOpacity>
            )}
          </View>
          {showDatePicker && Platform.OS !== 'web' && <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents (PDF, max 5 Mo)</Text>
          
          {selectedFiles.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              <Ionicons name="document" size={24} color={colors.teal} />
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileSize}>{((file.size || 0) / 1024).toFixed(0)} Ko</Text>
              <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addDocButton} onPress={handlePickDocument}>
            <Ionicons name="add-circle-outline" size={24} color={colors.teal} />
            <Text style={styles.addDocText}>Joindre un document PDF</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSuccess && styles.saveButtonSuccess, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving || isSuccess}
        >
          {isSuccess ? (
            <>
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
              <Text style={styles.saveButtonText}>Antécédent ajouté !</Text>
            </>
          ) : isSaving ? (
            <>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.saveButtonText}>{isUploadingDoc ? 'Upload documents...' : 'Enregistrement...'}</Text>
            </>
          ) : (
            <>
              <Ionicons name="save" size={24} color={colors.white} />
              <Text style={styles.saveButtonText}>Enregistrer l'antécédent</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl, paddingBottom: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  headerTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.navy },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.navy, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  helperText: { fontSize: typography.fontSize.xs, color: colors.gray, marginTop: spacing.xs },
  inputGroup: { marginBottom: spacing.md },
  inputLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.navy, marginBottom: spacing.sm },
  dateInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightBlue, borderRadius: borderRadius.lg, padding: spacing.md },
  dateText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semiBold, color: colors.navy },
  fileItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  fileName: { flex: 1, fontSize: typography.fontSize.sm, color: colors.navy },
  fileSize: { fontSize: typography.fontSize.xs, color: colors.gray },
  addDocButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lightBlue, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm, borderWidth: 2, borderColor: colors.teal, borderStyle: 'dashed' },
  addDocText: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semiBold, color: colors.teal },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.teal, borderRadius: borderRadius.xl, padding: spacing.md, gap: spacing.sm, marginTop: spacing.lg },
  saveButtonDisabled: { backgroundColor: colors.gray },
  saveButtonSuccess: { backgroundColor: '#4CAF50' },
  saveButtonText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white },
});
