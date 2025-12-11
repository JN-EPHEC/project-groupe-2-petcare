import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
  updateProfile
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
  approved?: boolean;
  rating?: number;
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
 * Le compte est créé avec approved: false et nécessite l'approbation d'un admin
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
      approved: false, // En attente d'approbation par un admin
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
      approved: false,
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
      return null;
    }
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
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
    }
    
    return null;
  } catch (error: any) {
    console.error('Erreur de récupération utilisateur:', error);
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

