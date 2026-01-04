import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, db } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Alert } from 'react-native';

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  customCategory?: string;
  petId: string;
  petName: string;
  ownerId: string;
  fileUrl: string;
  fileType: 'image' | 'pdf';
  fileName: string;
  fileSize: number; // en bytes
  date: string; // Date du document (ex: date de vaccination)
  uploadDate: string; // Date d'upload
  createdAt: any;
  updatedAt: any;
}

export type DocumentCategory = 
  | 'vaccination'
  | 'surgery'
  | 'analysis'
  | 'insurance'
  | 'invoice'
  | 'prescription'
  | 'xray'
  | 'other';

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'vaccination', label: '💉 Vaccination' },
  { value: 'surgery', label: '🔪 Chirurgie' },
  { value: 'analysis', label: '🔬 Analyses' },
  { value: 'insurance', label: '🛡️ Assurance' },
  { value: 'invoice', label: '🧾 Facture' },
  { value: 'prescription', label: '💊 Ordonnance' },
  { value: 'xray', label: '📷 Radiographie' },
  { value: 'other', label: '📄 Autre' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

/**
 * Demande la permission d'accès à la caméra
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Demande la permission d'accès à la galerie
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
};

/**
 * Scanner/Prendre une photo d'un document
 */
export const scanDocument = async (): Promise<{ uri: string; type: string; size: number } | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission refusée',
        'Veuillez autoriser l\'accès à la caméra pour scanner un document.'
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Vérifier la taille (estimation)
      const estimatedSize = asset.width * asset.height * 3; // Rough estimate
      if (estimatedSize > MAX_FILE_SIZE) {
        Alert.alert('Fichier trop volumineux', 'Le document ne doit pas dépasser 10 Mo.');
        return null;
      }

      return {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        size: estimatedSize,
      };
    }

    return null;
  } catch (error) {
    console.error('Error scanning document:', error);
    Alert.alert('Erreur', 'Impossible de scanner le document');
    return null;
  }
};

/**
 * Importer un document depuis la galerie (image)
 */
export const importImageFromGallery = async (): Promise<{ uri: string; type: string; size: number } | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission refusée',
        'Veuillez autoriser l\'accès à la galerie pour importer un document.'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      const estimatedSize = asset.width * asset.height * 3;
      if (estimatedSize > MAX_FILE_SIZE) {
        Alert.alert('Fichier trop volumineux', 'Le document ne doit pas dépasser 10 Mo.');
        return null;
      }

      return {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        size: estimatedSize,
      };
    }

    return null;
  } catch (error) {
    console.error('Error importing image from gallery:', error);
    Alert.alert('Erreur', 'Impossible d\'importer l\'image');
    return null;
  }
};

/**
 * Importer un document PDF
 */
export const importPDFDocument = async (): Promise<{ uri: string; type: string; size: number; name: string } | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      if (asset.size && asset.size > MAX_FILE_SIZE) {
        Alert.alert('Fichier trop volumineux', 'Le document ne doit pas dépasser 10 Mo.');
        return null;
      }

      return {
        uri: asset.uri,
        type: asset.mimeType || 'application/pdf',
        size: asset.size || 0,
        name: asset.name,
      };
    }

    return null;
  } catch (error) {
    console.error('Error importing PDF document:', error);
    Alert.alert('Erreur', 'Impossible d\'importer le document PDF');
    return null;
  }
};

/**
 * Upload un document vers Firebase Storage
 */
export const uploadDocument = async (
  fileUri: string,
  fileName: string,
  ownerId: string,
  petId: string
): Promise<string> => {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const storagePath = `documents/${ownerId}/${petId}/${timestamp}_${fileName}`;
    
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Impossible d\'uploader le document');
  }
};

/**
 * Créer un document dans Firestore
 */
export const createDocument = async (documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Nettoyer les valeurs undefined (Firestore ne les accepte pas)
    const cleanData: any = {};
    Object.keys(documentData).forEach(key => {
      const value = (documentData as any)[key];
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });
    
    const docRef = await addDoc(collection(db, 'documents'), {
      ...cleanData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Impossible de créer le document');
  }
};

/**
 * Récupérer tous les documents d'un propriétaire
 */
export const getDocumentsByOwnerId = async (ownerId: string): Promise<Document[]> => {
  try {
    const q = query(
      collection(db, 'documents'),
      where('ownerId', '==', ownerId),
      orderBy('uploadDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Document));
  } catch (error) {
    console.error('Error getting documents by owner:', error);
    return [];
  }
};

/**
 * Récupérer les documents d'un animal spécifique
 */
export const getDocumentsByPetId = async (petId: string): Promise<Document[]> => {
  try {
    const q = query(
      collection(db, 'documents'),
      where('petId', '==', petId),
      orderBy('uploadDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Document));
  } catch (error) {
    console.error('Error getting documents by pet:', error);
    return [];
  }
};

/**
 * Mettre à jour un document
 */
export const updateDocument = async (
  documentId: string,
  updates: Partial<Omit<Document, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', documentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error('Impossible de mettre à jour le document');
  }
};

/**
 * Supprimer un document
 */
export const deleteDocument = async (document: Document): Promise<void> => {
  try {
    // Supprimer le fichier de Storage
    const storageRef = ref(storage, document.fileUrl);
    await deleteObject(storageRef).catch(() => {
      console.warn('File not found in storage or already deleted');
    });
    
    // Supprimer le document de Firestore
    await deleteDoc(doc(db, 'documents', document.id));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Impossible de supprimer le document');
  }
};

/**
 * Filtrer les documents par catégorie
 */
export const filterDocumentsByCategory = (
  documents: Document[],
  category: DocumentCategory | 'all'
): Document[] => {
  if (category === 'all') return documents;
  return documents.filter(doc => doc.category === category);
};

/**
 * Rechercher des documents par mot-clé
 */
export const searchDocuments = (documents: Document[], keyword: string): Document[] => {
  if (!keyword.trim()) return documents;
  
  const lowerKeyword = keyword.toLowerCase();
  return documents.filter(doc =>
    doc.title.toLowerCase().includes(lowerKeyword) ||
    doc.description?.toLowerCase().includes(lowerKeyword) ||
    doc.petName.toLowerCase().includes(lowerKeyword) ||
    doc.category.toLowerCase().includes(lowerKeyword) ||
    doc.customCategory?.toLowerCase().includes(lowerKeyword)
  );
};

/**
 * Formater la taille du fichier
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Obtenir l'icône de la catégorie
 */
export const getCategoryIcon = (category: DocumentCategory): string => {
  const categoryData = DOCUMENT_CATEGORIES.find(c => c.value === category);
  return categoryData?.label.split(' ')[0] || '📄';
};

/**
 * Obtenir le label de la catégorie
 */
export const getCategoryLabel = (category: DocumentCategory, customCategory?: string): string => {
  if (category === 'other' && customCategory) {
    return customCategory;
  }
  const categoryData = DOCUMENT_CATEGORIES.find(c => c.value === category);
  return categoryData?.label.split(' ').slice(1).join(' ') || 'Autre';
};

