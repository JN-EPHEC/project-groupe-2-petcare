import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as firebaseAuth from '../services/firebaseAuth';
import { getPetsByOwnerId, Pet } from '../services/firestoreService';
import { doc, onSnapshot, collection, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Type pour l'utilisateur (compatible avec l'ancien DemoUser)
export interface User {
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
  consultationRate?: string;
  emergencyAvailable?: boolean;
  approved?: boolean;
  rating?: number;
  isPremium?: boolean;
  premiumSince?: string;
  subscriptionType?: 'monthly' | 'yearly';
  activeSubscriptionId?: string;
}

interface AuthContextType {
  user: User | null;
  currentPet: Pet | null;
  pets: Pet[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signUpVet: (vetData: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshPets: () => Promise<void>;
  refreshUser: () => Promise<void>;
  selectPet: (pet: Pet) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true); // true au démarrage pour vérifier l'auth

  // Observer l'état d'authentification au démarrage
  useEffect(() => {
    console.log("🔐 [AuthContext] Initialisation onAuthStateChange listener");
    
    const unsubscribe = firebaseAuth.onAuthStateChange(async (firebaseUser) => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔐 [AuthContext] onAuthStateChange callback triggered");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      
      if (firebaseUser) {
        console.log("✅ [AuthContext] Firebase User trouvé:");
        console.log("   - ID:", firebaseUser.id);
        console.log("   - Email:", firebaseUser.email);
        console.log("   - Role:", firebaseUser.role);
        console.log("   - isPremium:", firebaseUser.isPremium);
        
        setUser(firebaseUser as User);
        console.log("💾 [AuthContext] User state mis à jour");
        
        // Charger les animaux de l'utilisateur
        if (firebaseUser.role === 'owner') {
          console.log("🐾 [AuthContext] Chargement des pets pour owner...");
          const userPets = await getPetsByOwnerId(firebaseUser.id);
          setPets(userPets || []);
          if (userPets && userPets.length > 0) {
            setCurrentPet(userPets[0]);
          }
          console.log("✅ [AuthContext] Pets chargés:", userPets?.length || 0);
        }
      } else {
        console.log("❌ [AuthContext] Pas de Firebase User - déconnexion");
        console.log("🧹 [AuthContext] Nettoyage du state (user, pets, currentPet)");
        setUser(null);
        setCurrentPet(null);
        setPets([]);
      }
      
      console.log("✅ [AuthContext] setIsLoading(false)");
      setIsLoading(false);
    });

    return () => {
      console.log("🧹 [AuthContext] Cleanup onAuthStateChange listener");
      unsubscribe();
    };
  }, []);

  // Observer les changements en temps réel des données utilisateur
  useEffect(() => {
    if (!user?.id) return;

    const userDocRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log('🔄 User data updated from Firestore:', userData);
        // Mettre à jour TOUTES les données utilisateur
        setUser((prevUser) => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            firstName: userData.firstName || prevUser.firstName,
            lastName: userData.lastName || prevUser.lastName,
            phone: userData.phone || prevUser.phone,
            location: userData.location || prevUser.location,
            avatarUrl: userData.avatarUrl || prevUser.avatarUrl,
            specialty: userData.specialty,
            experience: userData.experience,
            clinicName: userData.clinicName,
            clinicAddress: userData.clinicAddress,
            consultationRate: userData.consultationRate,
            emergencyAvailable: userData.emergencyAvailable,
            isPremium: userData.isPremium || false,
            premiumSince: userData.premiumSince,
            subscriptionType: userData.subscriptionType,
            activeSubscriptionId: userData.activeSubscriptionId,
            rating: userData.rating,
          } as User;
        });
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Observer les changements des subscriptions pour mettre à jour le statut premium
  useEffect(() => {
    if (!user?.id) return;

    const subscriptionsRef = collection(db, 'customers', user.id, 'subscriptions');
    const unsubscribe = onSnapshot(subscriptionsRef, async (snapshot) => {
      console.log('🔄 Subscriptions updated');
      
      // Vérifier si l'utilisateur a un abonnement actif
      const activeSubscriptions = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.status === 'active' || data.status === 'trialing';
      });

      const hasActiveSubscription = activeSubscriptions.length > 0;
      console.log('📊 Has active subscription:', hasActiveSubscription);

      // Mettre à jour le statut premium dans Firestore
      const userDocRef = doc(db, 'users', user.id);
      try {
        await updateDoc(userDocRef, {
          isPremium: hasActiveSubscription,
        });
        console.log('✅ Statut premium mis à jour:', hasActiveSubscription);
      } catch (error) {
        console.error('❌ Erreur mise à jour statut premium:', error);
      }

      // Mettre à jour l'état local immédiatement
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          isPremium: hasActiveSubscription,
        };
      });
    });

    return () => unsubscribe();
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await firebaseAuth.signIn(email, password);
      
      if (loggedInUser) {
        setUser(loggedInUser as User);
        
        // Charger les animaux de l'utilisateur propriétaire
        if (loggedInUser.role === 'owner') {
          const userPets = await getPetsByOwnerId(loggedInUser.id);
          setPets(userPets || []);
          if (userPets && userPets.length > 0) {
            setCurrentPet(userPets[0]);
          }
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: any) => {
    setIsLoading(true);
    try {
      const newUser = await firebaseAuth.signUp(
        userData.email,
        userData.password,
        {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || '',
          location: userData.location || '',
        }
      );
      
      if (newUser) {
        setUser(newUser as User);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpVet = async (vetData: any) => {
    setIsLoading(true);
    try {
      const newVet = await firebaseAuth.signUpVet(
        vetData.email,
        vetData.password,
        {
          firstName: vetData.firstName,
          lastName: vetData.lastName,
          phone: vetData.phone || '',
          location: vetData.location || '',
          specialty: vetData.specialty || '',
          clinicName: vetData.clinicName || '',
          clinicAddress: vetData.clinicAddress || '',
          experience: vetData.experience || '',
          licenseNumber: vetData.licenseNumber || '',
        }
      );
      
      if (newVet) {
        setUser(newVet as User);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚪 [AuthContext] signOut() appelé");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
      await firebaseAuth.signOut();
      console.log("✅ [AuthContext] firebaseAuth.signOut() réussi");
      
      setUser(null);
      setCurrentPet(null);
      setPets([]);
      console.log("🧹 [AuthContext] State nettoyé (user, pets, currentPet = null)");
    } catch (error) {
      console.error('❌ [AuthContext] Error signing out:', error);
      throw error;
    }
  };

  const refreshPets = async () => {
    if (user && user.role === 'owner') {
      try {
        const userPets = await getPetsByOwnerId(user.id);
        setPets(userPets || []);
        if (userPets && userPets.length > 0) {
          setCurrentPet(userPets[0]);
        } else {
          setCurrentPet(null);
        }
      } catch (error) {
        console.error('Error refreshing pets:', error);
      }
    }
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 Rafraîchissement manuel des données utilisateur...');
      const userDocRef = doc(db, 'users', user.id);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log('✅ Données utilisateur rechargées:', userData);
        
        // Mettre à jour toutes les données utilisateur
        setUser((prevUser) => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            firstName: userData.firstName || prevUser.firstName,
            lastName: userData.lastName || prevUser.lastName,
            phone: userData.phone || prevUser.phone,
            location: userData.location || prevUser.location,
            avatarUrl: userData.avatarUrl || prevUser.avatarUrl,
            specialty: userData.specialty,
            experience: userData.experience,
            clinicName: userData.clinicName,
            clinicAddress: userData.clinicAddress,
            consultationRate: userData.consultationRate,
            emergencyAvailable: userData.emergencyAvailable,
            isPremium: userData.isPremium || false,
            premiumSince: userData.premiumSince,
            subscriptionType: userData.subscriptionType,
            activeSubscriptionId: userData.activeSubscriptionId,
            rating: userData.rating,
          } as User;
        });
      }
    } catch (error) {
      console.error('❌ Erreur rafraîchissement utilisateur:', error);
    }
  };

  const selectPet = (pet: Pet) => {
    console.log('🐾 Sélection de l\'animal:', pet.name);
    setCurrentPet(pet);
  };

  return (
    <AuthContext.Provider value={{ user, currentPet, pets, signIn, signUp, signUpVet, signOut, refreshPets, refreshUser, selectPet, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

