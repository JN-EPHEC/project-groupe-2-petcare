import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import {
  scanDocument,
  importImageFromGallery,
  importPDFDocument,
  uploadDocument,
  createDocument,
  DOCUMENT_CATEGORIES,
  DocumentCategory,
  formatFileSize,
} from '../../services/documentService';

interface AddDocumentScreenProps {
  navigation: any;
  route: any;
}

export const AddDocumentScreen: React.FC<AddDocumentScreenProps> = ({ navigation, route }) => {
  const { user, pets: contextPets } = useAuth();
  const pets = contextPets || [];
  const preselectedPetId = route.params?.petId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string>(preselectedPetId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf'>('image');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);

  const handleScanDocument = async () => {
    const result = await scanDocument();
    if (result) {
      setFileUri(result.uri);
      setFileType('image');
      setFileName(`scan_${Date.now()}.jpg`);
      setFileSize(result.size);
    }
  };

  const handleImportImage = async () => {
    const result = await importImageFromGallery();
    if (result) {
      setFileUri(result.uri);
      setFileType('image');
      setFileName(`image_${Date.now()}.jpg`);
      setFileSize(result.size);
    }
  };

  const handleImportPDF = async () => {
    const result = await importPDFDocument();
    if (result) {
      setFileUri(result.uri);
      setFileType('pdf');
      setFileName(result.name);
      setFileSize(result.size);
    }
  };

  const handleSaveDocument = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre');
      return;
    }

    if (!selectedPetId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un animal');
      return;
    }

    if (!fileUri) {
      Alert.alert('Erreur', 'Veuillez scanner ou importer un document');
      return;
    }

    if (category === 'other' && !customCategory.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une catégorie personnalisée');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    try {
      setIsUploading(true);

      const selectedPet = pets.find(p => p.id === selectedPetId);
      if (!selectedPet) {
        throw new Error('Animal non trouvé');
      }

      console.log('📤 Starting document upload...', { fileName, petId: selectedPetId });

      // Upload le fichier vers Firebase Storage
      const fileUrl = await uploadDocument(fileUri, fileName, user.id, selectedPetId);
      console.log('✅ File uploaded to Storage:', fileUrl);

      // Créer le document dans Firestore
      console.log('📝 Creating document in Firestore...');
      const documentData = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        customCategory: category === 'other' ? customCategory.trim() : undefined,
        petId: selectedPetId,
        petName: selectedPet.name,
        ownerId: user.id,
        fileUrl,
        fileType,
        fileName,
        fileSize,
        date,
        uploadDate: new Date().toISOString(),
      };
      console.log('Document data:', documentData);
      
      await createDocument(documentData);
      console.log('✅ Document created in Firestore');

      setIsUploading(false);
      
      if (Platform.OS === 'web') {
        window.alert('Document enregistré avec succès');
        navigation.goBack();
      } else {
        Alert.alert('Succès', 'Document enregistré avec succès', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.error('❌ Error saving document:', error);
      console.error('Error details:', error.message, error.code);
      setIsUploading(false);
      
      const errorMessage = error.message || 'Impossible d\'enregistrer le document';
      if (Platform.OS === 'web') {
        window.alert(`Erreur: ${errorMessage}`);
      } else {
        Alert.alert('Erreur', errorMessage);
      }
    }
  };

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const selectedCategoryData = DOCUMENT_CATEGORIES.find(c => c.value === category);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter un document</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Section: Scanner/Importer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Document</Text>
          
          {!fileUri ? (
            <View style={styles.uploadOptions}>
              <TouchableOpacity style={styles.uploadButton} onPress={handleScanDocument}>
                <Ionicons name="camera" size={40} color={colors.teal} />
                <Text style={styles.uploadButtonText}>Scanner</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadButton} onPress={handleImportImage}>
                <Ionicons name="images" size={40} color={colors.teal} />
                <Text style={styles.uploadButtonText}>Galerie</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.uploadButton} onPress={handleImportPDF}>
                <Ionicons name="document" size={40} color={colors.teal} />
                <Text style={styles.uploadButtonText}>PDF</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.filePreview}>
              {fileType === 'image' ? (
                <Image source={{ uri: fileUri }} style={styles.imagePreview} />
              ) : (
                <View style={styles.pdfPreview}>
                  <Ionicons name="document-text" size={64} color={colors.teal} />
                  <Text style={styles.pdfFileName}>{fileName}</Text>
                </View>
              )}
              <Text style={styles.fileSize}>{formatFileSize(fileSize)}</Text>
              <TouchableOpacity
                style={styles.changeFileButton}
                onPress={() => {
                  setFileUri(null);
                  setFileName('');
                  setFileSize(0);
                }}
              >
                <Text style={styles.changeFileButtonText}>Changer de fichier</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Section: Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Informations</Text>

          {/* Titre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Vaccination antirabique"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
              placeholderTextColor={colors.gray}
            />
            <Text style={styles.charCount}>{title.length}/50</Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (optionnelle)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ajoutez des détails..."
              value={description}
              onChangeText={setDescription}
              maxLength={250}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.gray}
            />
            <Text style={styles.charCount}>{description.length}/250</Text>
          </View>

          {/* Animal */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Animal *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowPetPicker(!showPetPicker)}
            >
              <Text style={styles.pickerButtonText}>
                {selectedPet ? `${selectedPet.emoji} ${selectedPet.name}` : 'Sélectionner un animal'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.gray} />
            </TouchableOpacity>

            {showPetPicker && (
              <View style={styles.pickerOptions}>
                {pets.length === 0 ? (
                  <View style={styles.noPetsContainer}>
                    <Text style={styles.noPetsText}>Aucun animal trouvé</Text>
                    <TouchableOpacity
                      style={styles.addPetButton}
                      onPress={() => {
                        navigation.navigate('AddPet');
                        setShowPetPicker(false);
                      }}
                    >
                      <Text style={styles.addPetButtonText}>Ajouter un animal</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  pets.map(pet => (
                    <TouchableOpacity
                      key={pet.id}
                      style={styles.pickerOption}
                      onPress={() => {
                        setSelectedPetId(pet.id);
                        setShowPetPicker(false);
                      }}
                    >
                      <Text style={styles.pickerOptionText}>
                        {pet.emoji} {pet.name}
                      </Text>
                      {selectedPetId === pet.id && (
                        <Ionicons name="checkmark" size={20} color={colors.teal} />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Catégorie */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={styles.pickerButtonText}>
                {selectedCategoryData?.label || 'Sélectionner une catégorie'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.gray} />
            </TouchableOpacity>

            {showCategoryPicker && (
              <View style={styles.pickerOptions}>
                {DOCUMENT_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.value}
                    style={styles.pickerOption}
                    onPress={() => {
                      setCategory(cat.value);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{cat.label}</Text>
                    {category === cat.value && (
                      <Ionicons name="checkmark" size={20} color={colors.teal} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Catégorie personnalisée si "Autre" */}
          {category === 'other' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catégorie personnalisée *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Carnet de santé"
                value={customCategory}
                onChangeText={setCustomCategory}
                maxLength={30}
                placeholderTextColor={colors.gray}
              />
              <Text style={styles.charCount}>{customCategory.length}/30</Text>
            </View>
          )}

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date du document *</Text>
            <TextInput
              style={styles.input}
              placeholder="AAAA-MM-JJ"
              value={date}
              onChangeText={setDate}
              placeholderTextColor={colors.gray}
            />
          </View>
        </View>

        {/* Bouton Enregistrer */}
        <TouchableOpacity
          style={[styles.saveButton, isUploading && styles.saveButtonDisabled]}
          onPress={handleSaveDocument}
          disabled={isUploading}
          activeOpacity={0.8}
        >
          {isUploading ? (
            <>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.saveButtonText}>Enregistrement...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.md,
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
    paddingBottom: spacing.xxl * 2, // Extra space pour voir le bouton en mobile
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.teal,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginTop: spacing.xs,
  },
  filePreview: {
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  pdfPreview: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  pdfFileName: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  changeFileButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.teal,
  },
  changeFileButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.teal,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.navy,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  pickerButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
  },
  pickerOptions: {
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.lightGray,
    maxHeight: 200,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  pickerOptionText: {
    fontSize: typography.fontSize.md,
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
    marginBottom: spacing.xl,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray,
  },
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  noPetsContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noPetsText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginBottom: spacing.md,
  },
  addPetButton: {
    backgroundColor: colors.teal,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  addPetButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.white,
  },
});

