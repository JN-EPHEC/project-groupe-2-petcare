import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
  updateProfile,
  deleteUser as firebaseDeleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface FirebaseUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'vet' | 'admin';
  phone?: string;
  location?: string;
  avatarUrl?: string;
  specialty?: string;
  experience?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  workingHours?: string;
  emergencyAvailable?: boolean;
  approved?: boolean;
  rating?: number;
  isPremium?: boolean;
  premiumSince?: string;
  subscriptionType?: 'monthly' | 'yearly';
  onboardingCompleted?: boolean;
}

/**
 * Connexion avec email et mot de passe
 */
export const signIn = async (email: string, password: string): Promise<FirebaseUserData | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      const error = new Error('Email non vérifié') as any;
      error.code = 'auth/email-not-verified';
      error.email = email;
      throw error;
    }
    
    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Vérifier si l'utilisateur est suspendu ou supprimé
      if (userData.status === 'suspended' || userData.disabled === true) {
        await signOut(auth);
        const error = new Error('Votre compte a été suspendu. Contactez l\'administrateur.') as any;
        error.code = 'auth/account-suspended';
        throw error;
      }
      
      if (userData.status === 'deleted' || userData.deleted === true) {
        await signOut(auth);
        const error = new Error('Ce compte n\'existe plus. Contactez l\'administrateur.') as any;
        error.code = 'auth/account-deleted';
        throw error;
      }
      
      // Note: La vérification de l'email suffit pour tous les utilisateurs (propriétaires ET vétérinaires)
      // Plus besoin d'approbation manuelle pour les vétérinaires
      
      return {
        id: user.uid,
        email: user.email || email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        phone: userData.phone,
        location: userData.location,
        avatarUrl: userData.avatarUrl,
        specialty: userData.specialty,
        experience: userData.experience,
        clinicName: userData.clinicName,
        clinicAddress: userData.clinicAddress,
        approved: userData.approved,
        rating: userData.rating,
        isPremium: userData.isPremium || false,
        premiumSince: userData.premiumSince,
        subscriptionType: userData.subscriptionType,
      };
    }
    
    return null;
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    throw error; // Re-throw l'erreur originale avec le code
  }
};

/**
 * Inscription d'un nouveau propriétaire
 */
export const signUp = async (
  email: string, 
  password: string, 
  userData: {
    firstName: string;
    lastName: string;
    phone: string;
    location: string;
  }
): Promise<FirebaseUserData | null> => {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`,
    });
    
    // Envoyer l'email de vérification
    await sendEmailVerification(user);
    
    // Créer le document utilisateur dans Firestore
    const userDocData = {
      email: email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'owner' as const,
      phone: userData.phone,
      location: userData.location,
      avatarUrl: `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=0D4C92&color=fff`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', user.uid), userDocData);
    
    return {
      id: user.uid,
      email: email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'owner',
      phone: userData.phone,
      location: userData.location,
      avatarUrl: userDocData.avatarUrl,
    };
  } catch (error: any) {
    console.error('Erreur d\'inscription:', error);
    throw error; // Re-throw l'erreur originale avec le code
  }
};

/**
 * Inscription d'un nouveau vétérinaire
 * Le vétérinaire reçoit un email de vérification comme les propriétaires
 * Une fois l'email vérifié, il peut se connecter directement
 */
export const signUpVet = async (
  email: string, 
  password: string, 
  vetData: {
    firstName: string;
    lastName: string;
    phone: string;
    location: string;
    specialty: string;
    clinicName: string;
    clinicAddress: string;
    experience: string;
    licenseNumber?: string;
  }
): Promise<FirebaseUserData | null> => {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil
    await updateProfile(user, {
      displayName: `Dr. ${vetData.firstName} ${vetData.lastName}`,
    });
    
    // Envoyer l'email de vérification
    await sendEmailVerification(user);
    
    // Créer le document utilisateur dans Firestore avec les informations vétérinaires
    const vetDocData = {
      email: email,
      firstName: vetData.firstName,
      lastName: vetData.lastName,
      role: 'vet' as const,
      phone: vetData.phone,
      location: vetData.location,
      specialty: vetData.specialty,
      clinicName: vetData.clinicName,
      clinicAddress: vetData.clinicAddress,
      experience: vetData.experience,
      licenseNumber: vetData.licenseNumber || '',
      approved: true, // Approuvé automatiquement après vérification d'email
      rating: 0,
      avatarUrl: `https://ui-avatars.com/api/?name=${vetData.firstName}+${vetData.lastName}&background=0D4C92&color=fff`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', user.uid), vetDocData);
    
    return {
      id: user.uid,
      email: email,
      firstName: vetData.firstName,
      lastName: vetData.lastName,
      role: 'vet',
      phone: vetData.phone,
      location: vetData.location,
      specialty: vetData.specialty,
      clinicName: vetData.clinicName,
      clinicAddress: vetData.clinicAddress,
      experience: vetData.experience,
      approved: true,
      rating: 0,
      avatarUrl: vetDocData.avatarUrl,
    };
  } catch (error: any) {
    console.error('Erreur d\'inscription vétérinaire:', error);
    throw error; // Re-throw l'erreur originale avec le code
  }
};

/**
 * Déconnexion
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Erreur de déconnexion:', error);
    throw error; // Re-throw l'erreur originale avec le code
  }
};

/**
 * Renvoyer l'email de vérification
 */
export const resendVerificationEmail = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
    } else {
      throw new Error('Aucun utilisateur connecté ou email déjà vérifié');
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
    throw error;
  }
};

/**
 * Récupérer les données utilisateur actuelles
 */
export const getCurrentUser = async (): Promise<FirebaseUserData | null> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      console.log('❌ [getCurrentUser] Aucun utilisateur Firebase connecté');
      return null;
    }
    
    console.log('🔍 [getCurrentUser] Récupération des données pour:', user.uid, user.email);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('📦 [getCurrentUser] Données brutes Firestore:', userData);
      console.log('👤 [getCurrentUser] firstName:', userData.firstName);
      console.log('👤 [getCurrentUser] lastName:', userData.lastName);
      console.log('📧 [getCurrentUser] email:', userData.email);
      console.log('🎭 [getCurrentUser] role:', userData.role);
      
      const result = {
        id: user.uid,
        email: user.email || '',
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        phone: userData.phone,
        location: userData.location,
        avatarUrl: userData.avatarUrl,
        specialty: userData.specialty,
        experience: userData.experience,
        clinicName: userData.clinicName,
        clinicAddress: userData.clinicAddress,
        approved: userData.approved,
        rating: userData.rating,
      };
      
      console.log('✅ [getCurrentUser] Données retournées:', result);
      return result;
    } else {
      console.log('❌ [getCurrentUser] Document utilisateur inexistant dans Firestore pour:', user.uid);
    }
    
    return null;
  } catch (error: any) {
    console.error('❌ [getCurrentUser] Erreur de récupération utilisateur:', error);
    return null;
  }
};

/**
 * Observer l'état d'authentification
 */
export const onAuthStateChange = (callback: (user: FirebaseUserData | null) => void) => {
  return auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      const userData = await getCurrentUser();
      callback(userData);
    } else {
      callback(null);
    }
  });
};

/**
 * Réinitialiser le mot de passe
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Erreur de réinitialisation de mot de passe:', error);
    throw error;
  }
};

/**
 * Supprimer complètement le compte utilisateur
 * Supprime l'utilisateur de Firebase Auth et toutes ses données de Firestore
 */
export const deleteUserAccount = async (password: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    
    if (!user || !user.email) {
      throw new Error('No user is currently signed in');
    }
    
    // Ré-authentifier l'utilisateur avant la suppression (requis par Firebase)
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    const userId = user.uid;
    
    // 1. Supprimer toutes les données Firestore de l'utilisateur
    await deleteUserData(userId);
    
    // 2. Supprimer l'utilisateur de Firebase Auth
    await firebaseDeleteUser(user);
    
    console.log('✅ User account deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting user account:', error);
    
    // Messages d'erreur personnalisés
    if (error.code === 'auth/wrong-password') {
      throw new Error('Mot de passe incorrect');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Trop de tentatives. Réessayez plus tard');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('Veuillez vous reconnecter avant de supprimer votre compte');
    }
    
    throw error;
  }
};

/**
 * Supprimer toutes les données Firestore d'un utilisateur
 */
const deleteUserData = async (userId: string): Promise<void> => {
  const { deleteDoc, collection, query, where, getDocs } = await import('firebase/firestore');
  
  try {
    console.log(`🗑️ Deleting all data for user: ${userId}`);
    
    // 1. Récupérer tous les animaux de l'utilisateur
    const petsQuery = query(collection(db, 'pets'), where('ownerId', '==', userId));
    const petsSnapshot = await getDocs(petsQuery);
    const petIds = petsSnapshot.docs.map(doc => doc.id);
    
    console.log(`📦 Found ${petIds.length} pets to delete`);
    
    // 2. Supprimer tous les health_records AVANT de supprimer les pets
    for (const petId of petIds) {
      console.log(`🗑️ Deleting health_records for pet: ${petId}`);
      const healthRecordsQuery = query(collection(db, 'health_records'), where('petId', '==', petId));
      const healthRecordsSnapshot = await getDocs(healthRecordsQuery);
      for (const hrDoc of healthRecordsSnapshot.docs) {
        await deleteDoc(hrDoc.ref);
      }
    }
    
    // 3. Supprimer toutes les vaccinations AVANT de supprimer les pets
    for (const petId of petIds) {
      console.log(`🗑️ Deleting vaccinations for pet: ${petId}`);
      const vaccinationsQuery = query(collection(db, 'vaccinations'), where('petId', '==', petId));
      const vaccinationsSnapshot = await getDocs(vaccinationsQuery);
      for (const vDoc of vaccinationsSnapshot.docs) {
        await deleteDoc(vDoc.ref);
      }
    }
    
    // 3b. Supprimer tous les traitements AVANT de supprimer les pets
    for (const petId of petIds) {
      console.log(`🗑️ Deleting treatments for pet: ${petId}`);
      const treatmentsQuery = query(collection(db, 'treatments'), where('petId', '==', petId));
      const treatmentsSnapshot = await getDocs(treatmentsQuery);
      for (const tDoc of treatmentsSnapshot.docs) {
        await deleteDoc(tDoc.ref);
      }
    }
    
    // 3c. Supprimer tous les antécédents médicaux AVANT de supprimer les pets
    for (const petId of petIds) {
      console.log(`🗑️ Deleting medical history for pet: ${petId}`);
      const medicalHistoryQuery = query(collection(db, 'medicalHistory'), where('petId', '==', petId));
      const medicalHistorySnapshot = await getDocs(medicalHistoryQuery);
      for (const mhDoc of medicalHistorySnapshot.docs) {
        await deleteDoc(mhDoc.ref);
      }
    }
    
    // 3d. Supprimer tous les suivis de bien-être AVANT de supprimer les pets
    for (const petId of petIds) {
      console.log(`🗑️ Deleting wellness tracking for pet: ${petId}`);
      const wellnessQuery = query(collection(db, 'wellnessTracking'), where('petId', '==', petId));
      const wellnessSnapshot = await getDocs(wellnessQuery);
      for (const wDoc of wellnessSnapshot.docs) {
        await deleteDoc(wDoc.ref);
      }
    }
    
    // 3e. Supprimer toutes les alertes de bien-être AVANT de supprimer les pets
    for (const petId of petIds) {
      console.log(`🗑️ Deleting wellness alerts for pet: ${petId}`);
      const alertsQuery = query(collection(db, 'wellnessAlerts'), where('petId', '==', petId));
      const alertsSnapshot = await getDocs(alertsQuery);
      for (const aDoc of alertsSnapshot.docs) {
        await deleteDoc(aDoc.ref);
      }
    }
    
    // 4. Supprimer tous les documents AVANT de supprimer les pets
    for (const petId of petIds) {
      console.log(`🗑️ Deleting documents for pet: ${petId}`);
      const documentsQuery = query(collection(db, 'documents'), where('petId', '==', petId));
      const documentsSnapshot = await getDocs(documentsQuery);
      for (const dDoc of documentsSnapshot.docs) {
        await deleteDoc(dDoc.ref);
      }
    }
    
    // 5. Supprimer tous les liens de partage AVANT de supprimer les pets
    for (const petId of petIds) {
      console.log(`🗑️ Deleting sharedPets for pet: ${petId}`);
      const sharedPetsQuery = query(collection(db, 'sharedPets'), where('petId', '==', petId));
      const sharedPetsSnapshot = await getDocs(sharedPetsQuery);
      for (const spDoc of sharedPetsSnapshot.docs) {
        await deleteDoc(spDoc.ref);
      }
    }
    
    // 6. MAINTENANT supprimer les animaux eux-mêmes
    for (const petDoc of petsSnapshot.docs) {
      console.log(`🗑️ Deleting pet: ${petDoc.id}`);
      await deleteDoc(petDoc.ref);
    }
    
    // 7. Supprimer les rappels de l'utilisateur
    console.log(`🗑️ Deleting reminders`);
    const remindersQuery = query(collection(db, 'reminders'), where('ownerId', '==', userId));
    const remindersSnapshot = await getDocs(remindersQuery);
    for (const rDoc of remindersSnapshot.docs) {
      await deleteDoc(rDoc.ref);
    }
    
    // 8. Supprimer les rendez-vous de l'utilisateur
    console.log(`🗑️ Deleting appointments`);
    const appointmentsQuery = query(collection(db, 'appointments'), where('ownerId', '==', userId));
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    for (const aDoc of appointmentsSnapshot.docs) {
      await deleteDoc(aDoc.ref);
    }
    
    // 9. Supprimer les demandes de vétérinaire (si vétérinaire)
    console.log(`🗑️ Deleting vet_requests`);
    const vetRequestsQuery = query(collection(db, 'vet_requests'), where('vetId', '==', userId));
    const vetRequestsSnapshot = await getDocs(vetRequestsQuery);
    for (const vrDoc of vetRequestsSnapshot.docs) {
      await deleteDoc(vrDoc.ref);
    }
    
    // 10. Supprimer les abonnements premium de l'utilisateur
    console.log(`🗑️ Deleting subscriptions`);
    const subscriptionsQuery = query(collection(db, 'subscriptions'), where('userId', '==', userId));
    const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
    for (const sDoc of subscriptionsSnapshot.docs) {
      await deleteDoc(sDoc.ref);
    }
    
    // 11. Supprimer les notifications de l'utilisateur
    console.log(`🗑️ Deleting notifications`);
    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    for (const nDoc of notificationsSnapshot.docs) {
      await deleteDoc(nDoc.ref);
    }
    
    // 12. Supprimer le document utilisateur
    console.log(`🗑️ Deleting user document`);
    await deleteDoc(doc(db, 'users', userId));
    
    console.log('✅ All user data deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting user data:', error);
    throw error;
  }
};

/**
 * Mapper les codes d'erreur Firebase vers des messages clairs
 */
export const getFirebaseErrorMessage = (error: any): string => {
  const errorCode = error?.code || '';
  
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Aucun compte n\'existe avec cet email';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect';
    case 'auth/invalid-email':
      return 'Format d\'email invalide';
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet email';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard';
    case 'auth/network-request-failed':
      return 'Erreur de connexion. Vérifiez votre internet';
    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect';
    case 'auth/email-not-verified':
      return 'Veuillez vérifier votre email avant de vous connecter';
    default:
      return error?.message || 'Une erreur est survenue';
  }
};

