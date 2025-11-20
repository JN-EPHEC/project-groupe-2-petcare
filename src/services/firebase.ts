// Firebase Placeholder Service
// This file contains placeholder functions for Firebase integration
// Replace these with actual Firebase SDK calls when ready

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  petName: string;
  password: string;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
}

// Authentication Placeholders
export const firebaseAuth = {
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<User> => {
    console.log('Firebase Placeholder: signIn called', { email });
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uid: 'placeholder-uid-123',
          email: email,
          displayName: 'John Doe',
        });
      }, 1000);
    });
  },

  // Sign up new user
  signUp: async (userData: UserData): Promise<User> => {
    console.log('Firebase Placeholder: signUp called', userData);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uid: 'placeholder-uid-' + Date.now(),
          email: userData.email,
          displayName: `${userData.firstName} ${userData.lastName}`,
        });
      }, 1000);
    });
  },

  // Sign out
  signOut: async (): Promise<void> => {
    console.log('Firebase Placeholder: signOut called');
    return Promise.resolve();
  },

  // Get current user
  getCurrentUser: (): User | null => {
    console.log('Firebase Placeholder: getCurrentUser called');
    return null; // Return null until real auth is implemented
  },

  // Send password reset email
  sendPasswordResetEmail: async (email: string): Promise<void> => {
    console.log('Firebase Placeholder: sendPasswordResetEmail called', { email });
    return Promise.resolve();
  },
};

// Firestore Placeholders
export const firebaseFirestore = {
  // Get user profile
  getUserProfile: async (uid: string): Promise<any> => {
    console.log('Firebase Placeholder: getUserProfile called', { uid });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          uid: uid,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+32 49 90 89 808',
          location: 'BELGIQUE',
          pets: ['pet-id-123'],
        });
      }, 500);
    });
  },

  // Update user profile
  updateUserProfile: async (uid: string, data: any): Promise<void> => {
    console.log('Firebase Placeholder: updateUserProfile called', { uid, data });
    return Promise.resolve();
  },

  // Get pet profile
  getPetProfile: async (petId: string): Promise<any> => {
    console.log('Firebase Placeholder: getPetProfile called', { petId });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: petId,
          name: 'kitty',
          species: 'Chat',
          breed: 'European Shorthair',
          age: 7,
          weight: 6,
          gender: 'Male',
          location: 'wavre',
          ownerId: 'placeholder-uid-123',
        });
      }, 500);
    });
  },

  // Update pet profile
  updatePetProfile: async (petId: string, data: any): Promise<void> => {
    console.log('Firebase Placeholder: updatePetProfile called', { petId, data });
    return Promise.resolve();
  },

  // Get health records
  getHealthRecords: async (petId: string): Promise<any[]> => {
    console.log('Firebase Placeholder: getHealthRecords called', { petId });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', type: 'vaccine', date: '2025-06-08', description: 'Vaccine 1' },
          { id: '2', type: 'vermifuge', date: '2025-08-10', description: 'Vermifuge treatment' },
        ]);
      }, 500);
    });
  },

  // Add health record
  addHealthRecord: async (petId: string, record: any): Promise<void> => {
    console.log('Firebase Placeholder: addHealthRecord called', { petId, record });
    return Promise.resolve();
  },

  // Get nearby veterinarians
  getNearbyVets: async (location: string): Promise<any[]> => {
    console.log('Firebase Placeholder: getNearbyVets called', { location });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'drh. Ariyo Hartono',
            specialty: 'Veterinary Dentist',
            location: 'Bierges',
            distance: '1.8 KM',
            phone: '+32 2 123 4567',
          },
          {
            id: '2',
            name: 'drh. Christine',
            specialty: 'General Veterinary',
            location: 'Limal',
            distance: '2.1 KM',
            phone: '+32 2 234 5678',
          },
        ]);
      }, 500);
    });
  },
};

// Storage Placeholders
export const firebaseStorage = {
  // Upload document
  uploadDocument: async (file: any, path: string): Promise<string> => {
    console.log('Firebase Placeholder: uploadDocument called', { path });
    
    // Simulate upload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://placeholder-url.com/${path}`);
      }, 1000);
    });
  },

  // Get document URL
  getDocumentUrl: async (path: string): Promise<string> => {
    console.log('Firebase Placeholder: getDocumentUrl called', { path });
    return Promise.resolve(`https://placeholder-url.com/${path}`);
  },

  // Delete document
  deleteDocument: async (path: string): Promise<void> => {
    console.log('Firebase Placeholder: deleteDocument called', { path });
    return Promise.resolve();
  },
};

// Export all services
export default {
  auth: firebaseAuth,
  firestore: firebaseFirestore,
  storage: firebaseStorage,
};
