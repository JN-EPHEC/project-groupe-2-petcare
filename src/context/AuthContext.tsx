import React, { createContext, useContext, useState, ReactNode } from 'react';
import { demoAuth, DemoUser, DemoPet } from '../services/demoAuth';

interface AuthContextType {
  user: DemoUser | null;
  currentPet: DemoPet | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [currentPet, setCurrentPet] = useState<DemoPet | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await demoAuth.signIn(email, password);
      setUser(loggedInUser);
      
      // Load user's pet if they have one
      if (loggedInUser?.petId) {
        const pet = demoAuth.getPetById(loggedInUser.petId);
        setCurrentPet(pet || null);
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
      const newUser = await demoAuth.signUp(userData);
      setUser(newUser);
      
      // Load the newly created pet
      if (newUser.petId) {
        const pet = demoAuth.getPetById(newUser.petId);
        setCurrentPet(pet || null);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await demoAuth.signOut();
    setUser(null);
    setCurrentPet(null);
  };

  return (
    <AuthContext.Provider value={{ user, currentPet, signIn, signUp, signOut, isLoading }}>
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

