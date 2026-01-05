import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// Interfaces
export interface Pet {
  id: string;
  name: string;
  type: string; // dog, cat, rabbit, rodent, bird, horse, pony, etc.
  breed: string;
  age: number;
  weight: number;
  height?: number; // Taille en cm
  emoji: string;
  ownerId: string;
  vetId?: string; // ID du vétérinaire attitré
  vetName?: string; // Nom du vétérinaire (pour affichage)
  birthDate?: string; // Date de naissance ISO
  gender?: string; // male, female
  identification?: string; // Numéro d'identification (puce, tatouage)
  sterilizationStatus?: string; // yes, no, unknown
  color?: string;
  microchipId?: string; // Déprécié: utiliser identification
  avatarUrl?: string | null;
}

export interface HealthRecord {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  type: 'vaccination' | 'checkup' | 'treatment' | 'surgery' | 'emergency';
  title: string;
  date: string;
  vet: string;
  description: string;
  medications?: string[];
  cost?: number;
}

export interface Vaccination {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  vaccineName: string;
  date: string;
  nextDueDate: string;
  vet: string;
  batchNumber?: string;
}

export interface Reminder {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  title: string;
  type: 'vaccine' | 'vermifuge' | 'checkup' | 'medication' | 'other';
  date: string;
  time?: string;
  completed: boolean;
  notes?: string;
}

export interface Document {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  name: string;
  type: string;
  url: string | null;
  uploadDate: string;
  size?: number;
}

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  ownerName: string;
  vetId: string;
  vetName: string;
  date: string;
  time: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

// ==================== PETS ====================

export const getPetsByOwnerId = async (ownerId: string): Promise<Pet[]> => {
  try {
    const q = query(collection(db, 'pets'), where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);
    
    const pets = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pet[];
    
    console.log('📋 getPetsByOwnerId - Nombre d\'animaux:', pets.length);
    pets.forEach(pet => {
      console.log(`🐾 Animal: ${pet.name} - avatarUrl: ${pet.avatarUrl || 'AUCUNE'}`);
    });
    
    return pets;
  } catch (error) {
    console.error('Error getting pets:', error);
    return [];
  }
};

export const addPet = async (petData: Omit<Pet, 'id'>): Promise<string> => {
  try {
    console.log('💾 addPet - Données reçues:', petData);
    console.log('💾 addPet - avatarUrl:', petData.avatarUrl);
    
    const dataToSave = {
      ...petData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    console.log('💾 addPet - Données à sauvegarder dans Firebase:', dataToSave);
    
    const docRef = await addDoc(collection(db, 'pets'), dataToSave);
    
    console.log('✅ addPet - Animal sauvegardé avec ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ addPet - Error adding pet:', error);
    throw error;
  }
};

export const getPetById = async (petId: string): Promise<Pet | null> => {
  try {
    const docRef = doc(db, 'pets', petId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Pet;
    }
    return null;
  } catch (error) {
    console.error('Error getting pet:', error);
    return null;
  }
};

export const updatePet = async (petId: string, data: Partial<Pet>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'pets', petId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating pet:', error);
    throw error;
  }
};

export const deletePet = async (petId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'pets', petId));
  } catch (error) {
    console.error('Error deleting pet:', error);
    throw error;
  }
};

/**
 * Récupérer tous les animaux d'un vétérinaire
 */
export const getPetsByVetId = async (vetId: string): Promise<Pet[]> => {
  try {
    const q = query(collection(db, 'pets'), where('vetId', '==', vetId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pet[];
  } catch (error) {
    console.error('Error getting pets by vet:', error);
    return [];
  }
};

// ==================== HEALTH RECORDS ====================

export const getHealthRecordsByOwnerId = async (ownerId: string): Promise<HealthRecord[]> => {
  try {
    const q = query(
      collection(db, 'health_records'), 
      where('ownerId', '==', ownerId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HealthRecord[];
  } catch (error) {
    console.error('Error getting health records:', error);
    return [];
  }
};

export const addHealthRecord = async (recordData: Omit<HealthRecord, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'health_records'), {
      ...recordData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding health record:', error);
    throw error;
  }
};

export const getHealthRecordsByPetId = async (petId: string): Promise<HealthRecord[]> => {
  try {
    const q = query(
      collection(db, 'health_records'), 
      where('petId', '==', petId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HealthRecord[];
  } catch (error) {
    console.error('Error getting health records by pet:', error);
    return [];
  }
};

export const updateHealthRecord = async (recordId: string, data: Partial<HealthRecord>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'health_records', recordId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating health record:', error);
    throw error;
  }
};

export const deleteHealthRecord = async (recordId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'health_records', recordId));
  } catch (error) {
    console.error('Error deleting health record:', error);
    throw error;
  }
};

// ==================== REMINDERS ====================

export const getRemindersByOwnerId = async (ownerId: string): Promise<Reminder[]> => {
  try {
    const q = query(
      collection(db, 'reminders'), 
      where('ownerId', '==', ownerId),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Reminder[];
  } catch (error) {
    console.error('Error getting reminders:', error);
    return [];
  }
};

export const addReminder = async (reminderData: Omit<Reminder, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'reminders'), {
      ...reminderData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding reminder:', error);
    throw error;
  }
};

export const updateReminder = async (reminderId: string, data: Partial<Reminder>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'reminders', reminderId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
};

export const deleteReminder = async (reminderId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'reminders', reminderId));
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};

export const completeReminder = async (reminderId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'reminders', reminderId), {
      completed: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error completing reminder:', error);
    throw error;
  }
};

// ==================== DOCUMENTS ====================

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
      ...doc.data()
    })) as Document[];
  } catch (error) {
    console.error('Error getting documents:', error);
    return [];
  }
};

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
      ...doc.data()
    })) as Document[];
  } catch (error) {
    console.error('Error getting documents by pet:', error);
    return [];
  }
};

export const addDocument = async (documentData: Omit<Document, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'documents'), {
      ...documentData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

export const updateDocument = async (documentId: string, data: Partial<Document>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'documents', documentId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'documents', documentId));
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// ==================== APPOINTMENTS ====================

export const getAppointmentsByOwnerId = async (ownerId: string): Promise<Appointment[]> => {
  try {
    // TEMPORAIRE : Sans orderBy pour éviter l'erreur d'index
    // Une fois l'index créé manuellement, réactivez orderBy('date', 'asc')
    const q = query(
      collection(db, 'appointments'), 
      where('ownerId', '==', ownerId)
      // orderBy('date', 'asc') // ← À RÉACTIVER après création de l'index
    );
    const querySnapshot = await getDocs(q);
    
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
    
    // Tri côté client en attendant l'index
    return appointments.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    return [];
  }
};

export const getAppointmentsByVetId = async (vetId: string): Promise<Appointment[]> => {
  try {
    // TEMPORAIRE : Sans orderBy pour éviter l'erreur d'index
    // Une fois l'index créé manuellement, réactivez orderBy('date', 'asc')
    const q = query(
      collection(db, 'appointments'), 
      where('vetId', '==', vetId)
      // orderBy('date', 'asc') // ← À RÉACTIVER après création de l'index
    );
    const querySnapshot = await getDocs(q);
    
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
    
    // Tri côté client en attendant l'index
    return appointments.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    console.error('Error getting vet appointments:', error);
    return [];
  }
};

export const addAppointment = async (appointmentData: Omit<Appointment, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding appointment:', error);
    throw error;
  }
};

export const updateAppointment = async (appointmentId: string, data: Partial<Appointment>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

export const completeAppointment = async (appointmentId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status: 'completed',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    throw error;
  }
};

// ==================== VET PROFILE ====================

export const getVetProfile = async (vetId: string): Promise<any> => {
  try {
    const docRef = doc(db, 'users', vetId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().role === 'vet') {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting vet profile:', error);
    return null;
  }
};

export const updateVetProfile = async (vetId: string, data: any): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', vetId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating vet profile:', error);
    throw error;
  }
};

export const getVets = async (): Promise<any[]> => {
  try {
    console.log('🔍 Récupération des vétérinaires...');
    
    // Première tentative : vétérinaires approuvés
    const qApproved = query(
      collection(db, 'users'), 
      where('role', '==', 'vet'),
      where('approved', '==', true)
    );
    const approvedSnapshot = await getDocs(qApproved);
    const approvedVets = approvedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('✅ Vétérinaires approuvés:', approvedVets.length);
    
    if (approvedVets.length > 0) {
      return approvedVets;
    }
    
    // Fallback : tous les vétérinaires (même non approuvés)
    console.log('⚠️ Aucun vétérinaire approuvé, récupération de TOUS les vétérinaires');
    const qAll = query(
      collection(db, 'users'), 
      where('role', '==', 'vet')
    );
    const allSnapshot = await getDocs(qAll);
    const allVets = allSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📊 Total vétérinaires (tous):', allVets.length);
    return allVets;
    
  } catch (error) {
    console.error('❌ Error getting vets:', error);
    return [];
  }
};

// Alias pour getAllVets (utilisé dans EmergencyScreen)
export const getAllVets = getVets;

export const getVetsByLocation = async (location: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'vet'),
      where('approved', '==', true),
      where('location', '==', location)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting vets by location:', error);
    // Fallback: get all vets and filter client-side
    const allVets = await getVets();
    return allVets.filter(vet => vet.location?.toLowerCase().includes(location.toLowerCase()));
  }
};

// ==================== PATIENTS ====================

export const getPatientsByVetId = async (vetId: string): Promise<any[]> => {
  try {
    // Get all appointments for this vet
    const appointments = await getAppointmentsByVetId(vetId);
    
    // Extract unique pet IDs
    const petIds = [...new Set(appointments.map(apt => apt.petId))];
    
    // Get pet details for each unique pet
    const patients = [];
    for (const petId of petIds) {
      const pet = await getPetById(petId);
      if (pet) {
        // Get owner info
        const ownerDoc = await getDoc(doc(db, 'users', pet.ownerId));
        if (ownerDoc.exists()) {
          patients.push({
            ...pet,
            ownerName: `${ownerDoc.data().firstName} ${ownerDoc.data().lastName}`,
            ownerPhone: ownerDoc.data().phone,
          });
        }
      }
    }
    
    return patients;
  } catch (error) {
    console.error('Error getting patients by vet:', error);
    return [];
  }
};

export const getPatientDetails = async (petId: string): Promise<any> => {
  try {
    const pet = await getPetById(petId);
    if (!pet) return null;
    
    // Get owner info
    const ownerDoc = await getDoc(doc(db, 'users', pet.ownerId));
    const ownerData = ownerDoc.exists() ? ownerDoc.data() : null;
    
    // Get health records
    const healthRecords = await getHealthRecordsByPetId(petId);
    
    // Get vaccinations
    const vaccinations = await getVaccinationsByPetId(petId);
    
    return {
      pet,
      owner: ownerData ? {
        id: ownerDoc.id,
        ...ownerData,
      } : null,
      healthRecords,
      vaccinations,
    };
  } catch (error) {
    console.error('Error getting patient details:', error);
    return null;
  }
};

// ==================== ADMIN - USERS ====================

export const getAllUsers = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    
    // Filtrer les utilisateurs supprimés
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(user => user.deleted !== true && user.status !== 'deleted');
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const getUsersByRole = async (role: 'owner' | 'vet' | 'admin'): Promise<any[]> => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users by role:', error);
    return [];
  }
};

export const updateUserRole = async (userId: string, role: 'owner' | 'vet' | 'admin'): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const promoteToAdmin = async (userId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role: 'admin',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ==================== ADMIN - VET APPROVAL ====================

export const getPendingVets = async (): Promise<any[]> => {
  try {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'vet'),
      where('approved', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting pending vets:', error);
    return [];
  }
};

export const approveVet = async (vetId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', vetId), {
      approved: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error approving vet:', error);
    throw error;
  }
};

export const rejectVet = async (vetId: string, reason?: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', vetId), {
      approved: false,
      rejectionReason: reason || 'Non précisée',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error rejecting vet:', error);
    throw error;
  }
};

// ==================== ADMIN - ANALYTICS ====================

export const getPlatformStats = async (): Promise<any> => {
  try {
    const [users, pets, appointments] = await Promise.all([
      getAllUsers(),
      getDocs(collection(db, 'pets')),
      getDocs(collection(db, 'appointments')),
    ]);
    
    const owners = users.filter(u => u.role === 'owner');
    const vets = users.filter(u => u.role === 'vet');
    const approvedVets = vets.filter(v => v.approved);
    
    const upcomingAppointments = appointments.docs.filter(
      doc => doc.data().status === 'upcoming'
    );
    
    return {
      totalUsers: users.length,
      totalOwners: owners.length,
      totalVets: vets.length,
      approvedVets: approvedVets.length,
      totalPets: pets.size,
      totalAppointments: appointments.size,
      upcomingAppointments: upcomingAppointments.length,
    };
  } catch (error) {
    console.error('Error getting platform stats:', error);
    return {
      totalUsers: 0,
      totalOwners: 0,
      totalVets: 0,
      approvedVets: 0,
      totalPets: 0,
      totalAppointments: 0,
      upcomingAppointments: 0,
    };
  }
};

export const getMonthlyGrowth = async (): Promise<any[]> => {
  try {
    const users = await getAllUsers();
    
    // Group by month
    const monthlyData: any = {};
    users.forEach(user => {
      if (user.createdAt) {
        const date = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, users: 0, owners: 0, vets: 0 };
        }
        
        monthlyData[monthKey].users += 1;
        if (user.role === 'owner') monthlyData[monthKey].owners += 1;
        if (user.role === 'vet') monthlyData[monthKey].vets += 1;
      }
    });
    
    return Object.values(monthlyData).sort((a: any, b: any) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error('Error getting monthly growth:', error);
    return [];
  }
};

export const getTopVets = async (): Promise<any[]> => {
  try {
    const vets = await getUsersByRole('vet');
    const appointments = await getDocs(collection(db, 'appointments'));
    
    // Count appointments per vet
    const vetAppointments: any = {};
    appointments.docs.forEach(doc => {
      const vetId = doc.data().vetId;
      if (vetId) {
        vetAppointments[vetId] = (vetAppointments[vetId] || 0) + 1;
      }
    });
    
    // Add appointment count to vets and sort
    const vetsWithStats = vets.map(vet => ({
      ...vet,
      appointmentsCount: vetAppointments[vet.id] || 0,
    })).sort((a, b) => b.appointmentsCount - a.appointmentsCount);
    
    return vetsWithStats.slice(0, 10); // Top 10
  } catch (error) {
    console.error('Error getting top vets:', error);
    return [];
  }
};

// ==================== ADMIN - PETS ====================

export const getAllPets = async (): Promise<Pet[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'pets'));
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pet[];
  } catch (error) {
    console.error('Error getting all pets:', error);
    return [];
  }
};

export const getPetsByType = async (type: 'dog' | 'cat' | 'other'): Promise<Pet[]> => {
  try {
    const q = query(collection(db, 'pets'), where('type', '==', type));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pet[];
  } catch (error) {
    console.error('Error getting pets by type:', error);
    return [];
  }
};

// ==================== ADMIN - USER MANAGEMENT ADVANCED ====================

/**
 * Suspendre un utilisateur (désactiver son compte)
 * Note: Marque l'utilisateur comme suspendu dans Firestore
 * La vérification du statut sera faite à la connexion
 */
export const suspendUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'suspended',
      disabled: true,
      suspendedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Utilisateur suspendu dans Firestore');
  } catch (error) {
    console.error('Error suspending user:', error);
    throw error;
  }
};

/**
 * Activer un utilisateur (réactiver son compte)
 */
export const activateUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'active',
      disabled: false,
      suspendedAt: null,
      reactivatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Utilisateur activé dans Firestore');
  } catch (error) {
    console.error('Error activating user:', error);
    throw error;
  }
};

/**
 * Marquer un utilisateur comme supprimé (soft delete)
 * Note: Ne supprime pas réellement de Firebase Auth
 * mais marque comme supprimé dans Firestore
 */
export const softDeleteUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'deleted',
      disabled: true,
      deleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Utilisateur marqué comme supprimé dans Firestore');
  } catch (error) {
    console.error('Error soft deleting user:', error);
    throw error;
  }
};

/**
 * Mettre à jour le profil d'un utilisateur
 */
export const updateUserProfile = async (userId: string, data: Partial<{
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  specialty?: string;
  clinicName?: string;
  clinicAddress?: string;
  experience?: string;
  clinicPhone?: string;
  consultationRate?: string;
  workingHours?: string;
  emergencyAvailable?: boolean;
  onboardingCompleted?: boolean;
}>): Promise<void> => {
  try {
    console.log('📝 updateUserProfile called with userId:', userId);
    console.log('📝 Data to update:', data);
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ User profile updated successfully in Firestore');
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
};

/**
 * Obtenir un utilisateur spécifique par ID
 */
export const getUserById = async (userId: string): Promise<any> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      throw new Error('Utilisateur non trouvé');
    }
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

// ==================== BLOG ARTICLES ====================

export const getPublishedArticles = async (): Promise<any[]> => {
  try {
    const articlesRef = collection(db, 'blogArticles');
    const q = query(
      articlesRef, 
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting published articles:', error);
    throw error;
  }
};

export const getArticlesByCategory = async (category: string): Promise<any[]> => {
  try {
    const articlesRef = collection(db, 'blogArticles');
    const q = query(
      articlesRef,
      where('status', '==', 'published'),
      where('category', '==', category),
      orderBy('publishedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting articles by category:', error);
    throw error;
  }
};

export const getArticleById = async (id: string): Promise<any> => {
  try {
    const articleRef = doc(db, 'blogArticles', id);
    const articleDoc = await getDoc(articleRef);
    
    if (articleDoc.exists()) {
      return {
        id: articleDoc.id,
        ...articleDoc.data()
      };
    } else {
      throw new Error('Article non trouvé');
    }
  } catch (error) {
    console.error('Error getting article by ID:', error);
    throw error;
  }
};

export const searchArticles = async (searchQuery: string): Promise<any[]> => {
  try {
    const articlesRef = collection(db, 'blogArticles');
    const q = query(
      articlesRef,
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    
    const lowerQuery = searchQuery.toLowerCase();
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(article => 
        article.title.toLowerCase().includes(lowerQuery) ||
        article.excerpt.toLowerCase().includes(lowerQuery) ||
        article.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
      );
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
};

export const createArticle = async (article: any): Promise<string> => {
  try {
    const articlesRef = collection(db, 'blogArticles');
    const docRef = await addDoc(articlesRef, {
      ...article,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0
    });
    
    console.log('Article created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
};

export const updateArticle = async (id: string, updates: any): Promise<void> => {
  try {
    const articleRef = doc(db, 'blogArticles', id);
    await updateDoc(articleRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    console.log('Article updated:', id);
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
  }
};

export const deleteArticle = async (id: string): Promise<void> => {
  try {
    const articleRef = doc(db, 'blogArticles', id);
    await deleteDoc(articleRef);
    console.log('Article deleted:', id);
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
};

export const incrementArticleViews = async (id: string): Promise<void> => {
  try {
    const articleRef = doc(db, 'blogArticles', id);
    const articleDoc = await getDoc(articleRef);
    
    if (articleDoc.exists()) {
      const currentViews = articleDoc.data().viewCount || 0;
      await updateDoc(articleRef, {
        viewCount: currentViews + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing article views:', error);
    // Ne pas throw pour ne pas bloquer l'affichage de l'article
  }
};

export const getAllArticles = async (): Promise<any[]> => {
  try {
    const articlesRef = collection(db, 'blogArticles');
    const q = query(articlesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all articles:', error);
    throw error;
  }
};

// ==================== PET SHARING ====================

export const createPetShareLink = async (petId: string, ownerId: string): Promise<string> => {
  try {
    // Générer un token unique
    const shareToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const sharedPetsRef = collection(db, 'sharedPets');
    const docRef = await addDoc(sharedPetsRef, {
      petId,
      ownerId,
      shareToken,
      createdAt: new Date().toISOString(),
      accessCount: 0,
      isActive: true
    });
    
    console.log('Share link created:', shareToken);
    
    // Retourner le token pour construire l'URL côté client
    return shareToken;
  } catch (error) {
    console.error('Error creating share link:', error);
    throw error;
  }
};

export const getPetByShareToken = async (token: string): Promise<any> => {
  try {
    const sharedPetsRef = collection(db, 'sharedPets');
    const q = query(
      sharedPetsRef,
      where('shareToken', '==', token),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Lien de partage invalide ou expiré');
    }
    
    const sharedPetData = snapshot.docs[0].data();
    
    // Incrémenter le compteur d'accès
    const shareRef = doc(db, 'sharedPets', snapshot.docs[0].id);
    await updateDoc(shareRef, {
      accessCount: sharedPetData.accessCount + 1
    });
    
    // Récupérer les données de l'animal
    const petRef = doc(db, 'pets', sharedPetData.petId);
    const petDoc = await getDoc(petRef);
    
    if (!petDoc.exists()) {
      throw new Error('Animal non trouvé');
    }
    
    return {
      id: petDoc.id,
      ...petDoc.data()
    };
  } catch (error) {
    console.error('Error getting pet by share token:', error);
    throw error;
  }
};

export const getSharedPetData = async (token: string): Promise<any> => {
  try {
    const sharedPetsRef = collection(db, 'sharedPets');
    const q = query(
      sharedPetsRef,
      where('shareToken', '==', token),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Lien de partage invalide ou expiré');
    }
    
    const sharedPetData = snapshot.docs[0].data();
    
    // Incrémenter le compteur d'accès
    const shareRef = doc(db, 'sharedPets', snapshot.docs[0].id);
    await updateDoc(shareRef, {
      accessCount: sharedPetData.accessCount + 1
    });
    
    // Récupérer toutes les données
    const [petDoc, vaccinationsSnapshot, healthRecordsSnapshot, remindersSnapshot, ownerDoc] = await Promise.all([
      getDoc(doc(db, 'pets', sharedPetData.petId)),
      getDocs(query(collection(db, 'vaccinations'), where('petId', '==', sharedPetData.petId))),
      getDocs(query(collection(db, 'healthRecords'), where('petId', '==', sharedPetData.petId))),
      getDocs(query(collection(db, 'reminders'), where('petId', '==', sharedPetData.petId))),
      getDoc(doc(db, 'users', sharedPetData.ownerId))
    ]);
    
    if (!petDoc.exists()) {
      throw new Error('Animal non trouvé');
    }
    
    const ownerData = ownerDoc.exists() ? ownerDoc.data() : {};
    
    return {
      pet: {
        id: petDoc.id,
        ...petDoc.data()
      },
      vaccinations: vaccinationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      healthRecords: healthRecordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      reminders: remindersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      owner: {
        firstName: ownerData.firstName,
        lastName: ownerData.lastName,
        location: ownerData.location
      }
    };
  } catch (error) {
    console.error('Error getting shared pet data:', error);
    throw error;
  }
};

export const revokeShareLink = async (shareId: string): Promise<void> => {
  try {
    const shareRef = doc(db, 'sharedPets', shareId);
    await updateDoc(shareRef, {
      isActive: false
    });
    console.log('Share link revoked:', shareId);
  } catch (error) {
    console.error('Error revoking share link:', error);
    throw error;
  }
};

export const getActiveShares = async (petId: string, ownerId?: string): Promise<any[]> => {
  try {
    const sharedPetsRef = collection(db, 'sharedPets');
    
    // Si ownerId n'est pas fourni, on utilise l'utilisateur connecté
    const currentUser = auth.currentUser;
    const userId = ownerId || currentUser?.uid;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Requête simplifiée : seulement ownerId (pas besoin d'index composite)
    const q = query(
      sharedPetsRef,
      where('ownerId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    // Filtrage et tri côté client (plus simple, pas d'index requis)
    const shares = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(share => 
        share.petId === petId && 
        share.isActive === true
      )
      .sort((a, b) => {
        // Tri par date décroissante
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    
    return shares;
  } catch (error) {
    console.error('Error getting active shares:', error);
    throw error;
  }
};

// ==================== PREMIUM VETS ====================

export const getPremiumVets = async (): Promise<any[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('role', '==', 'vet'),
      where('approved', '==', true),
      where('isPremiumPartner', '==', true)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting premium vets:', error);
    throw error;
  }
};

// ==================== SUBSCRIPTIONS (PREMIUM) ====================

export interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  plan: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePaymentIntentId?: string;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: any;
  updatedAt: any;
}

/**
 * Créer un nouvel abonnement après un paiement réussi
 */
export const createSubscription = async (subscriptionData: Omit<Subscription, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'subscriptions'), {
      ...subscriptionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log('✅ Abonnement créé:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erreur création abonnement:', error);
    throw error;
  }
};

/**
 * Récupérer l'abonnement actif d'un utilisateur
 */
export const getActiveSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Subscription;
  } catch (error) {
    console.error('Erreur récupération abonnement actif:', error);
    return null;
  }
};

/**
 * Récupérer tous les abonnements d'un utilisateur
 */
export const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Subscription[];
  } catch (error) {
    console.error('Erreur récupération abonnements:', error);
    return [];
  }
};

/**
 * Annuler un abonnement
 */
export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    const subRef = doc(db, 'subscriptions', subscriptionId);
    await updateDoc(subRef, {
      status: 'cancelled',
      cancelAtPeriodEnd: true,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Abonnement annulé:', subscriptionId);
  } catch (error) {
    console.error('❌ Erreur annulation abonnement:', error);
    throw error;
  }
};

/**
 * Mettre à jour le statut d'un abonnement
 */
export const updateSubscriptionStatus = async (
  subscriptionId: string, 
  status: 'active' | 'cancelled' | 'expired'
): Promise<void> => {
  try {
    const subRef = doc(db, 'subscriptions', subscriptionId);
    await updateDoc(subRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Statut abonnement mis à jour:', subscriptionId, status);
  } catch (error) {
    console.error('❌ Erreur mise à jour statut:', error);
    throw error;
  }
};

/**
 * Obtenir toutes les statistiques des abonnements (Admin)
 */
export const getSubscriptionStats = async (): Promise<any> => {
  try {
    const snapshot = await getDocs(collection(db, 'subscriptions'));
    
    const stats = {
      total: snapshot.size,
      active: 0,
      cancelled: 0,
      expired: 0,
      trial: 0,
      monthlyRevenue: 0,
      yearlyRevenue: 0,
    };
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'active' || data.status === 'cancelled' || data.status === 'expired' || data.status === 'trial') {
        stats[data.status]++;
      }
      
      if (data.status === 'active') {
        if (data.plan === 'monthly') {
          stats.monthlyRevenue += data.amount;
        } else {
          stats.yearlyRevenue += data.amount;
        }
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Erreur récupération stats abonnements:', error);
    return null;
  }
};

// Aliases pour les fonctions d'appointments
export const createAppointment = addAppointment;

export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'appointments', appointmentId));
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};

// ==================== GESTION DU CARNET DE SANTÉ ====================

/**
 * Interfaces pour le carnet de santé
 */
export interface Vaccination {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  type: string; // Type de vaccin (max 50 caractères)
  date: string; // Date au format ISO
  nextDueDate?: string; // Prochaine date de rappel
  vet?: string; // Nom du vétérinaire
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  type: 'antipuce' | 'antibiotique' | 'vermifuge' | 'autre'; // Type de traitement
  name: string; // Nom du traitement
  startDate: string; // Date de début
  endDate: string; // Date de fin
  frequency?: string; // Fréquence (ex: "2 fois par jour")
  dosage?: string; // Dosage
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  type: 'maladie' | 'allergie' | 'chirurgie' | 'autre'; // Type d'antécédent
  title: string; // Titre de l'antécédent
  description: string; // Description (max 200 caractères)
  date: string; // Date de l'incident
  documents?: string[]; // URLs des documents attachés
  createdAt: string;
  updatedAt: string;
}

// ==================== VACCINATIONS ====================

/**
 * Ajouter un vaccin
 */
export const addVaccination = async (vaccination: Omit<Vaccination, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Validation de la date
    const date = new Date(vaccination.date);
    if (isNaN(date.getTime())) {
      throw new Error('Format de date invalide');
    }

    // Validation du type (max 50 caractères)
    if (vaccination.type.length > 50) {
      throw new Error('Le type de vaccin ne peut pas dépasser 50 caractères');
    }

    const vaccinationData = {
      ...vaccination,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'vaccinations'), vaccinationData);
    console.log('✅ Vaccin ajouté:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erreur ajout vaccin:', error);
    throw error;
  }
};

/**
 * Obtenir les vaccins d'un animal
 */
export const getVaccinationsByPetId = async (petId: string): Promise<Vaccination[]> => {
  try {
    const q = query(
      collection(db, 'vaccinations'),
      where('petId', '==', petId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vaccination));
  } catch (error) {
    console.error('Erreur récupération vaccins:', error);
    return [];
  }
};

/**
 * Modifier un vaccin
 */
export const updateVaccination = async (vaccinationId: string, updates: Partial<Vaccination>): Promise<void> => {
  try {
    // Validation de la date si elle est modifiée
    if (updates.date) {
      const date = new Date(updates.date);
      if (isNaN(date.getTime())) {
        throw new Error('Format de date invalide');
      }
    }

    // Validation du type si il est modifié
    if (updates.type && updates.type.length > 50) {
      throw new Error('Le type de vaccin ne peut pas dépasser 50 caractères');
    }

    const vaccinationRef = doc(db, 'vaccinations', vaccinationId);
    await updateDoc(vaccinationRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Vaccin modifié:', vaccinationId);
  } catch (error) {
    console.error('❌ Erreur modification vaccin:', error);
    throw error;
  }
};

/**
 * Supprimer un vaccin
 */
export const deleteVaccination = async (vaccinationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'vaccinations', vaccinationId));
    console.log('✅ Vaccin supprimé:', vaccinationId);
  } catch (error) {
    console.error('❌ Erreur suppression vaccin:', error);
    throw error;
  }
};

// ==================== TRAITEMENTS ====================

/**
 * Ajouter un traitement
 */
export const addTreatment = async (treatment: Omit<Treatment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Validation des dates
    const startDate = new Date(treatment.startDate);
    const endDate = new Date(treatment.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Format de date invalide');
    }

    if (endDate < startDate) {
      throw new Error('La date de fin doit être après la date de début');
    }

    const treatmentData = {
      ...treatment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'treatments'), treatmentData);
    console.log('✅ Traitement ajouté:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erreur ajout traitement:', error);
    throw error;
  }
};

/**
 * Obtenir les traitements d'un animal
 */
export const getTreatmentsByPetId = async (petId: string): Promise<Treatment[]> => {
  try {
    const q = query(
      collection(db, 'treatments'),
      where('petId', '==', petId),
      orderBy('startDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Treatment));
  } catch (error) {
    console.error('Erreur récupération traitements:', error);
    return [];
  }
};

/**
 * Modifier un traitement
 */
export const updateTreatment = async (treatmentId: string, updates: Partial<Treatment>): Promise<void> => {
  try {
    // Validation des dates si elles sont modifiées
    if (updates.startDate || updates.endDate) {
      const startDate = updates.startDate ? new Date(updates.startDate) : null;
      const endDate = updates.endDate ? new Date(updates.endDate) : null;

      if ((startDate && isNaN(startDate.getTime())) || (endDate && isNaN(endDate.getTime()))) {
        throw new Error('Format de date invalide');
      }
    }

    const treatmentRef = doc(db, 'treatments', treatmentId);
    await updateDoc(treatmentRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Traitement modifié:', treatmentId);
  } catch (error) {
    console.error('❌ Erreur modification traitement:', error);
    throw error;
  }
};

/**
 * Supprimer un traitement
 */
export const deleteTreatment = async (treatmentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'treatments', treatmentId));
    console.log('✅ Traitement supprimé:', treatmentId);
  } catch (error) {
    console.error('❌ Erreur suppression traitement:', error);
    throw error;
  }
};

// ==================== ANTÉCÉDENTS MÉDICAUX ====================

/**
 * Ajouter un antécédent médical
 */
export const addMedicalHistory = async (history: Omit<MedicalHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Validation de la date
    const date = new Date(history.date);
    if (isNaN(date.getTime())) {
      throw new Error('Format de date invalide');
    }

    // Validation de la description (max 200 caractères)
    if (history.description.length > 200) {
      throw new Error('La description ne peut pas dépasser 200 caractères');
    }

    const historyData = {
      ...history,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'medicalHistory'), historyData);
    console.log('✅ Antécédent médical ajouté:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erreur ajout antécédent:', error);
    throw error;
  }
};

/**
 * Obtenir les antécédents médicaux d'un animal
 */
export const getMedicalHistoryByPetId = async (petId: string): Promise<MedicalHistory[]> => {
  try {
    const q = query(
      collection(db, 'medicalHistory'),
      where('petId', '==', petId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalHistory));
  } catch (error) {
    console.error('Erreur récupération antécédents:', error);
    return [];
  }
};

/**
 * Modifier un antécédent médical
 */
export const updateMedicalHistory = async (historyId: string, updates: Partial<MedicalHistory>): Promise<void> => {
  try {
    // Validation de la date si elle est modifiée
    if (updates.date) {
      const date = new Date(updates.date);
      if (isNaN(date.getTime())) {
        throw new Error('Format de date invalide');
      }
    }

    // Validation de la description si elle est modifiée
    if (updates.description && updates.description.length > 200) {
      throw new Error('La description ne peut pas dépasser 200 caractères');
    }

    const historyRef = doc(db, 'medicalHistory', historyId);
    await updateDoc(historyRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Antécédent médical modifié:', historyId);
  } catch (error) {
    console.error('❌ Erreur modification antécédent:', error);
    throw error;
  }
};

/**
 * Supprimer un antécédent médical
 */
export const deleteMedicalHistory = async (historyId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'medicalHistory', historyId));
    console.log('✅ Antécédent médical supprimé:', historyId);
  } catch (error) {
    console.error('❌ Erreur suppression antécédent:', error);
    throw error;
  }
};

