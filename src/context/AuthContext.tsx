import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as firebaseAuth from '../services/firebaseAuth';
import { getPetsByOwnerId, Pet } from '../services/firestoreService';

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
  approved?: boolean;
  rating?: number;
}

interface AuthContextType {
  user: User | null;
  currentPet: Pet | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signUpVet: (vetData: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshPets: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true au démarrage pour vérifier l'auth

  // Observer l'état d'authentification au démarrage
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser as User);
        
        // Charger le premier animal de l'utilisateur
        if (firebaseUser.role === 'owner') {
          const pets = await getPetsByOwnerId(firebaseUser.id);
          if (pets && pets.length > 0) {
            setCurrentPet(pets[0]);
          }
        }
      } else {
        setUser(null);
        setCurrentPet(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await firebaseAuth.signIn(email, password);
      
      if (loggedInUser) {
        setUser(loggedInUser as User);
        
        // Charger le premier animal de l'utilisateur propriétaire
        if (loggedInUser.role === 'owner') {
          const pets = await getPetsByOwnerId(loggedInUser.id);
          if (pets && pets.length > 0) {
            setCurrentPet(pets[0]);
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
    try {
      await firebaseAuth.signOut();
      setUser(null);
      setCurrentPet(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshPets = async () => {
    if (user && user.role === 'owner') {
      try {
        const pets = await getPetsByOwnerId(user.id);
        if (pets && pets.length > 0) {
          setCurrentPet(pets[0]);
        } else {
          setCurrentPet(null);
        }
      } catch (error) {
        console.error('Error refreshing pets:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, currentPet, signIn, signUp, signUpVet, signOut, refreshPets, isLoading }}>
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

