import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Alert, Share } from 'react-native';

export interface SharedAccess {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  ownerName: string;
  sharedWithUserId?: string;
  sharedWithEmail?: string;
  accessLevel: AccessLevel;
  shareMethod: 'link' | 'qr' | 'email';
  shareToken: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: any;
  acceptedAt?: any;
}

export type AccessLevel = 'read' | 'comment' | 'edit' | 'full';

export const ACCESS_LEVELS: { value: AccessLevel; label: string; description: string; icon: string }[] = [
  { value: 'read', label: 'Lecture seule', description: 'Peut uniquement consulter les informations', icon: '👀' },
  { value: 'comment', label: 'Commentaire', description: 'Peut consulter et ajouter des commentaires', icon: '💬' },
  { value: 'edit', label: 'Modification', description: 'Peut consulter et modifier les informations', icon: '✏️' },
  { value: 'full', label: 'Accès complet', description: 'Peut tout faire sauf supprimer le carnet', icon: '🔓' },
];

/**
 * Générer un token unique de partage
 */
const generateShareToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
};

/**
 * Créer un partage de carnet
 */
export const createPetShare = async (
  petId: string,
  petName: string,
  ownerId: string,
  ownerName: string,
  accessLevel: AccessLevel,
  shareMethod: 'link' | 'qr' | 'email',
  sharedWithEmail?: string,
  expirationDays?: number
): Promise<{ shareId: string; shareToken: string; shareUrl: string }> => {
  try {
    const shareToken = generateShareToken();
    const expiresAt = expirationDays 
      ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const shareData: Omit<SharedAccess, 'id'> = {
      petId,
      petName,
      ownerId,
      ownerName,
      sharedWithEmail,
      accessLevel,
      shareMethod,
      shareToken,
      expiresAt,
      isActive: true,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'shared_access'), shareData);

    // Générer l'URL de partage
    const shareUrl = `petcare://share/${shareToken}`;

    return {
      shareId: docRef.id,
      shareToken,
      shareUrl,
    };
  } catch (error) {
    console.error('Error creating pet share:', error);
    throw new Error('Impossible de créer le partage');
  }
};

/**
 * Récupérer les partages d'un animal
 */
export const getPetShares = async (petId: string): Promise<SharedAccess[]> => {
  try {
    const q = query(collection(db, 'shared_access'), where('petId', '==', petId), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SharedAccess));
  } catch (error) {
    console.error('Error getting pet shares:', error);
    return [];
  }
};

/**
 * Récupérer les carnets partagés avec un utilisateur
 */
export const getSharedWithMe = async (userId: string, userEmail: string): Promise<SharedAccess[]> => {
  try {
    const q1 = query(
      collection(db, 'shared_access'),
      where('sharedWithUserId', '==', userId),
      where('isActive', '==', true)
    );
    
    const q2 = query(
      collection(db, 'shared_access'),
      where('sharedWithEmail', '==', userEmail),
      where('isActive', '==', true)
    );
    
    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    const shares1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedAccess));
    const shares2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedAccess));
    
    // Fusionner et dédupliquer
    const allShares = [...shares1, ...shares2];
    const uniqueShares = allShares.filter((share, index, self) =>
      index === self.findIndex(s => s.id === share.id)
    );
    
    return uniqueShares;
  } catch (error) {
    console.error('Error getting shared with me:', error);
    return [];
  }
};

/**
 * Accepter un partage
 */
export const acceptShare = async (shareToken: string, userId: string): Promise<SharedAccess | null> => {
  try {
    const q = query(
      collection(db, 'shared_access'),
      where('shareToken', '==', shareToken),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Lien de partage invalide ou expiré');
    }
    
    const shareDoc = querySnapshot.docs[0];
    const shareData = shareDoc.data() as SharedAccess;
    
    // Vérifier l'expiration
    if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
      throw new Error('Ce lien de partage a expiré');
    }
    
    // Mettre à jour avec l'ID utilisateur
    await updateDoc(doc(db, 'shared_access', shareDoc.id), {
      sharedWithUserId: userId,
      acceptedAt: Timestamp.now(),
    });
    
    return {
      id: shareDoc.id,
      ...shareData,
      sharedWithUserId: userId,
    };
  } catch (error) {
    console.error('Error accepting share:', error);
    throw error;
  }
};

/**
 * Révoquer un partage
 */
export const revokeShare = async (shareId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'shared_access', shareId), {
      isActive: false,
    });
  } catch (error) {
    console.error('Error revoking share:', error);
    throw new Error('Impossible de révoquer le partage');
  }
};

/**
 * Modifier le niveau d'accès d'un partage
 */
export const updateShareAccessLevel = async (shareId: string, accessLevel: AccessLevel): Promise<void> => {
  try {
    await updateDoc(doc(db, 'shared_access', shareId), {
      accessLevel,
    });
  } catch (error) {
    console.error('Error updating share access level:', error);
    throw new Error('Impossible de modifier les droits d\'accès');
  }
};

/**
 * Vérifier les droits d'accès d'un utilisateur sur un carnet
 */
export const checkAccessLevel = async (petId: string, userId: string): Promise<AccessLevel | null> => {
  try {
    const q = query(
      collection(db, 'shared_access'),
      where('petId', '==', petId),
      where('sharedWithUserId', '==', userId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const shareData = querySnapshot.docs[0].data() as SharedAccess;
    
    // Vérifier l'expiration
    if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
      return null;
    }
    
    return shareData.accessLevel;
  } catch (error) {
    console.error('Error checking access level:', error);
    return null;
  }
};

/**
 * Partager un lien de carnet via les apps natives
 */
export const shareViaSystem = async (shareUrl: string, petName: string): Promise<void> => {
  try {
    await Share.share({
      message: `Découvrez le carnet de santé de ${petName} sur PetCare+\n\n${shareUrl}`,
      title: `Carnet de ${petName}`,
    });
  } catch (error) {
    console.error('Error sharing via system:', error);
  }
};

/**
 * Obtenir le label du niveau d'accès
 */
export const getAccessLevelLabel = (accessLevel: AccessLevel): string => {
  const level = ACCESS_LEVELS.find(l => l.value === accessLevel);
  return level ? level.label : accessLevel;
};

/**
 * Obtenir l'icône du niveau d'accès
 */
export const getAccessLevelIcon = (accessLevel: AccessLevel): string => {
  const level = ACCESS_LEVELS.find(l => l.value === accessLevel);
  return level ? level.icon : '🔒';
};

/**
 * Vérifier si un utilisateur peut effectuer une action
 */
export const canPerformAction = (accessLevel: AccessLevel | null, action: 'read' | 'comment' | 'edit'): boolean => {
  if (!accessLevel) return false;
  
  const hierarchy: AccessLevel[] = ['read', 'comment', 'edit', 'full'];
  const userLevelIndex = hierarchy.indexOf(accessLevel);
  const requiredLevelIndex = hierarchy.indexOf(action as AccessLevel);
  
  return userLevelIndex >= requiredLevelIndex;
};



