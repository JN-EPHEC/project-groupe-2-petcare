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
import { db } from '../config/firebase';

// Interfaces
export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight: number;
  emoji: string;
  ownerId: string;
  birthDate?: string;
  gender?: string;
  color?: string;
  microchipId?: string;
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
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Pet[];
  } catch (error) {
    console.error('Error getting pets:', error);
    return [];
  }
};

export const addPet = async (petData: Omit<Pet, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'pets'), {
      ...petData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding pet:', error);
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

// ==================== VACCINATIONS ====================

export const getVaccinationsByOwnerId = async (ownerId: string): Promise<Vaccination[]> => {
  try {
    const q = query(
      collection(db, 'vaccinations'), 
      where('ownerId', '==', ownerId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Vaccination[];
  } catch (error) {
    console.error('Error getting vaccinations:', error);
    return [];
  }
};

export const getVaccinationsByPetId = async (petId: string): Promise<Vaccination[]> => {
  try {
    const q = query(
      collection(db, 'vaccinations'), 
      where('petId', '==', petId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Vaccination[];
  } catch (error) {
    console.error('Error getting vaccinations by pet:', error);
    return [];
  }
};

export const addVaccination = async (vaccinationData: Omit<Vaccination, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'vaccinations'), {
      ...vaccinationData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding vaccination:', error);
    throw error;
  }
};

export const updateVaccination = async (vaccinationId: string, data: Partial<Vaccination>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'vaccinations', vaccinationId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating vaccination:', error);
    throw error;
  }
};

export const deleteVaccination = async (vaccinationId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'vaccinations', vaccinationId));
  } catch (error) {
    console.error('Error deleting vaccination:', error);
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
    const q = query(
      collection(db, 'appointments'), 
      where('ownerId', '==', ownerId),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting appointments:', error);
    return [];
  }
};

export const getAppointmentsByVetId = async (vetId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'), 
      where('vetId', '==', vetId),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Appointment[];
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
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'vet'),
      where('approved', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting vets:', error);
    return [];
  }
};

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
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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

