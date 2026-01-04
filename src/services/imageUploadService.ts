import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload une image vers Firebase Storage avec timeout
 * @param uri - URI locale de l'image
 * @param path - Chemin dans Firebase Storage (ex: 'pets/userId/petId.jpg')
 * @returns URL de téléchargement de l'image
 */
export const uploadImage = async (uri: string, path: string): Promise<string> => {
  const UPLOAD_TIMEOUT = 10000; // 10 secondes

  const uploadPromise = (async () => {
    // Convertir l'URI en blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Créer une référence dans Firebase Storage
    const storageRef = ref(storage, path);
    
    // Uploader le blob
    await uploadBytes(storageRef, blob);
    
    // Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  })();

  const timeoutPromise = new Promise<string>((_, reject) => 
    setTimeout(() => reject(new Error('Upload timeout (CORS ou réseau)')), UPLOAD_TIMEOUT)
  );

  try {
    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (error: any) {
    console.error('Error uploading image:', error);
    // Si c'est une erreur CORS, on la rend plus explicite
    if (error?.message?.includes('CORS') || error?.message?.includes('timeout')) {
      throw new Error('CORS_ERROR');
    }
    throw error;
  }
};

/**
 * Upload une image de profil d'animal
 * @param uri - URI locale de l'image
 * @param userId - ID du propriétaire
 * @param petId - ID de l'animal (optionnel, généré si non fourni)
 * @returns URL de téléchargement
 */
export const uploadPetImage = async (
  uri: string, 
  userId: string, 
  petId?: string
): Promise<string> => {
  const timestamp = Date.now();
  const filename = petId ? `${petId}.jpg` : `${timestamp}.jpg`;
  const path = `pets/${userId}/${filename}`;
  
  return await uploadImage(uri, path);
};

/**
 * Upload une image de profil utilisateur
 * @param uri - URI locale de l'image
 * @param userId - ID de l'utilisateur
 * @returns URL de téléchargement
 */
export const uploadUserAvatar = async (
  uri: string,
  userId: string
): Promise<string> => {
  const timestamp = Date.now();
  const path = `avatars/${userId}/${timestamp}.jpg`;
  
  return await uploadImage(uri, path);
};


