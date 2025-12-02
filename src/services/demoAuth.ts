// Demo Authentication Service
// Provides working authentication without Firebase

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  role: 'owner' | 'vet' | 'admin';
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  petId?: string;
  avatarUrl?: string;
  avatarLocal?: any;
}

export interface DemoPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  gender: 'Male' | 'Female';
  location: string;
  ownerId: string;
  imageEmoji: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: 'vaccine' | 'treatment' | 'surgery' | 'operation' | 'vermifuge';
  date: string;
  description: string;
  veterinarian?: string;
  notes?: string;
}

// Demo Users Database
export const DEMO_USERS: DemoUser[] = [
  {
    id: 'admin-1',
    email: 'admin@petcare.com',
    password: 'admin123',
    role: 'admin',
    firstName: 'Charles',
    lastName: 'DuBois',
    phone: '+32 2 123 4567',
    location: 'Bruxelles, Belgique',
    avatarUrl: 'https://ui-avatars.com/api/?name=Charles+DuBois&background=0D4C92&color=fff',
  },
  {
    id: 'owner-1',
    email: 'owner@petcare.com',
    password: 'owner123',
    role: 'owner',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+32 49 90 89 808',
    location: 'BELGIQUE',
    petId: 'pet-1',
    avatarLocal: require('../../assets/doctors/uifaces-popular-avatar.jpg'),
    avatarUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=004c8c&color=fff&size=200',
  },
  {
    id: 'owner-2',
    email: 'charles@example.com',
    password: 'demo123',
    role: 'owner',
    firstName: 'Charles',
    lastName: 'DuBois',
    phone: '+32 2 123 4567',
    location: 'Bruxelles',
    petId: 'pet-2',
    avatarLocal: require('../../assets/doctors/uifaces-popular-avatar-2.jpg'),
    avatarUrl: 'https://ui-avatars.com/api/?name=Charles+DuBois&background=5eb3b3&color=fff&size=200',
  },
  {
    id: 'vet-1',
    email: 'vet@petcare.com',
    password: 'vet123',
    role: 'vet',
    firstName: 'Dr. Christine',
    lastName: 'Hartono',
    phone: '+32 2 234 5678',
    location: 'Wavre',
    avatarLocal: require('../../assets/doctors/uifaces-popular-avatar-3.jpg'),
    avatarUrl: 'https://ui-avatars.com/api/?name=Christine+Hartono&background=7b68ee&color=fff&size=200',
  },
];

// Demo Pets Database
export const DEMO_PETS: DemoPet[] = [
  {
    id: 'pet-1',
    name: 'kitty',
    species: 'Chat',
    breed: 'European Shorthair',
    age: 7,
    weight: 6,
    gender: 'Male',
    location: 'wavre',
    ownerId: 'owner-1',
    imageEmoji: '🐱',
  },
  {
    id: 'pet-2',
    name: 'Max',
    species: 'Chien',
    breed: 'Golden Retriever',
    age: 3,
    weight: 28,
    gender: 'Male',
    location: 'Bruxelles',
    ownerId: 'owner-2',
    imageEmoji: '🐕',
  },
];

// Demo Health Records
export const DEMO_HEALTH_RECORDS: HealthRecord[] = [
  // ===== KITTY'S RECORDS (pet-1) =====
  
  // Vaccines
  {
    id: 'hr-1',
    petId: 'pet-1',
    type: 'vaccine',
    date: '2025-06-08',
    description: 'Vaccin antirabique',
    veterinarian: 'Dr. Christine Hartono',
    notes: 'Vaccination annuelle complétée avec succès. Prochaine dose dans 12 mois.',
  },
  {
    id: 'hr-2',
    petId: 'pet-1',
    type: 'vaccine',
    date: '2025-08-20',
    description: 'Vaccin typhus (FVRCP)',
    veterinarian: 'Dr. Ariyo Hartono',
    notes: 'Protection contre le typhus, le coryza et la panleucopénie féline.',
  },
  {
    id: 'hr-3',
    petId: 'pet-1',
    type: 'vaccine',
    date: '2024-06-10',
    description: 'Vaccin antirabique (année précédente)',
    veterinarian: 'Dr. Christine Hartono',
    notes: 'Rappel annuel effectué.',
  },
  
  // Vermifuges
  {
    id: 'hr-4',
    petId: 'pet-1',
    type: 'vermifuge',
    date: '2025-08-10',
    description: 'Vermifuge trimestriel - Milbemax',
    veterinarian: 'Dr. Ariyo Hartono',
    notes: 'Programme de vermifugation régulier. Dose: 1 comprimé selon poids.',
  },
  {
    id: 'hr-5',
    petId: 'pet-1',
    type: 'vermifuge',
    date: '2025-05-10',
    description: 'Vermifuge trimestriel - Milbemax',
    veterinarian: 'Dr. Christine Hartono',
    notes: 'Administration sans complications.',
  },
  {
    id: 'hr-6',
    petId: 'pet-1',
    type: 'vermifuge',
    date: '2025-02-10',
    description: 'Vermifuge trimestriel - Milbemax',
    veterinarian: 'Dr. Ariyo Hartono',
    notes: 'Traitement préventif régulier.',
  },
  
  // Treatments
  {
    id: 'hr-7',
    petId: 'pet-1',
    type: 'treatment',
    date: '2025-03-15',
    description: 'Antibiotiques pour infection de l\'oreille',
    veterinarian: 'Dr. Christine Hartono',
    notes: 'Traitement de 10 jours terminé. Infection guérie complètement.',
  },
  {
    id: 'hr-8',
    petId: 'pet-1',
    type: 'treatment',
    date: '2025-07-22',
    description: 'Traitement anti-puces Frontline',
    veterinarian: 'Dr. Ariyo Hartono',
    notes: 'Application topique mensuelle. Renouveler chaque mois pendant l\'été.',
  },
  {
    id: 'hr-9',
    petId: 'pet-1',
    type: 'treatment',
    date: '2024-12-05',
    description: 'Traitement anti-inflammatoire',
    veterinarian: 'Dr. Christine Hartono',
    notes: 'Pour douleurs articulaires légères. Metacam 0.5ml pendant 5 jours.',
  },
  
  // Operations
  {
    id: 'hr-10',
    petId: 'pet-1',
    type: 'operation',
    date: '2023-11-20',
    description: 'Nettoyage dentaire sous anesthésie',
    veterinarian: 'Dr. Marc Dubois',
    notes: 'Détartrage complet. Extraction d\'une dent. Récupération excellente.',
  },
  {
    id: 'hr-11',
    petId: 'pet-1',
    type: 'surgery',
    date: '2020-03-15',
    description: 'Stérilisation',
    veterinarian: 'Dr. Christine Hartono',
    notes: 'Castration réalisée à l\'âge de 6 mois. Récupération sans complications.',
  },
  
  // ===== MAX'S RECORDS (pet-2) =====
  
  // Vaccines
  {
    id: 'hr-12',
    petId: 'pet-2',
    type: 'vaccine',
    date: '2025-07-20',
    description: 'Vaccin DHPP (Distemper, Hépatite, Parvo, Parainfluenza)',
    veterinarian: 'Dr. Ariyo Hartono',
    notes: 'Rappels à jour. Protection complète.',
  },
  {
    id: 'hr-13',
    petId: 'pet-2',
    type: 'vaccine',
    date: '2024-07-15',
    description: 'Vaccin DHPP (rappel annuel)',
    veterinarian: 'Dr. Christine Hartono',
    notes: 'Vaccination annuelle effectuée.',
  },
  {
    id: 'hr-14',
    petId: 'pet-2',
    type: 'vaccine',
    date: '2025-06-05',
    description: 'Vaccin antirabique',
    veterinarian: 'Dr. Sophie Laurent',
    notes: 'Obligatoire pour voyages. Valide 3 ans.',
  },
  
  // Vermifuges
  {
    id: 'hr-15',
    petId: 'pet-2',
    type: 'vermifuge',
    date: '2025-08-15',
    description: 'Vermifuge - Drontal Plus',
    veterinarian: 'Dr. Ariyo Hartono',
    notes: 'Dose adaptée au poids (28kg). Renouveler dans 3 mois.',
  },
  {
    id: 'hr-16',
    petId: 'pet-2',
    type: 'vermifuge',
    date: '2025-05-15',
    description: 'Vermifuge - Drontal Plus',
    veterinarian: 'Dr. Christine Hartono',
    notes: 'Traitement préventif trimestriel.',
  },
  
  // Treatments
  {
    id: 'hr-17',
    petId: 'pet-2',
    type: 'treatment',
    date: '2025-04-10',
    description: 'Traitement dermatite allergique',
    veterinarian: 'Dr. Sophie Laurent',
    notes: 'Apoquel 16mg pendant 2 semaines. Amélioration significative.',
  },
  {
    id: 'hr-18',
    petId: 'pet-2',
    type: 'treatment',
    date: '2025-06-20',
    description: 'Traitement anti-tiques Bravecto',
    veterinarian: 'Dr. Ariyo Hartono',
    notes: 'Protection 12 semaines. Efficace contre puces et tiques.',
  },
  
  // Surgery
  {
    id: 'hr-19',
    petId: 'pet-2',
    type: 'surgery',
    date: '2024-11-05',
    description: 'Stérilisation (castration)',
    veterinarian: 'Dr. Christine Hartono',
    notes: 'Procédure standard. Rétablissement réussi en 10 jours. Points retirés.',
  },
  
  // Operations
  {
    id: 'hr-20',
    petId: 'pet-2',
    type: 'operation',
    date: '2025-01-20',
    description: 'Retrait d\'une masse cutanée bénigne',
    veterinarian: 'Dr. Marc Dubois',
    notes: 'Lipome retiré de l\'épaule droite. Analyse histologique: bénin.',
  },
];

// Demo Documents
export interface DemoDocument {
  id: string;
  petId: string;
  name: string;
  type: string;
  uploadDate: string;
}

export const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    id: 'doc-1',
    petId: 'pet-1',
    name: 'PDF 1 - Certificat de vaccination',
    type: 'pdf',
    uploadDate: '2025-06-08',
  },
  {
    id: 'doc-2',
    petId: 'pet-1',
    name: 'PDF 2 - Historique médical',
    type: 'pdf',
    uploadDate: '2025-01-15',
  },
  {
    id: 'doc-3',
    petId: 'pet-1',
    name: 'PDF 3 - Carte d\'assurance',
    type: 'pdf',
    uploadDate: '2024-12-01',
  },
  {
    id: 'doc-4',
    petId: 'pet-1',
    name: 'PDF 4 - Certificat de pedigree',
    type: 'pdf',
    uploadDate: '2024-06-20',
  },
];

// Demo Reminders
export interface DemoReminder {
  id: string;
  petId: string;
  title: string;
  date: string;
  type: 'vaccine' | 'vermifuge' | 'checkup' | 'medication';
  status: 'past' | 'upcoming';
}

export const DEMO_REMINDERS: DemoReminder[] = [
  // ===== PAST REMINDERS =====
  
  // Juin 2025
  {
    id: 'rem-1',
    petId: 'pet-1',
    title: 'Vaccin antirabique',
    date: '2025-06-08',
    type: 'vaccine',
    status: 'past',
  },
  {
    id: 'rem-2',
    petId: 'pet-1',
    title: 'Contrôle annuel',
    date: '2025-06-15',
    type: 'checkup',
    status: 'past',
  },
  {
    id: 'rem-3',
    petId: 'pet-1',
    title: 'Traitement anti-puces',
    date: '2025-06-25',
    type: 'medication',
    status: 'past',
  },
  
  // Août 2025
  {
    id: 'rem-4',
    petId: 'pet-1',
    title: 'Vermifuge trimestriel',
    date: '2025-08-10',
    type: 'vermifuge',
    status: 'past',
  },
  {
    id: 'rem-5',
    petId: 'pet-1',
    title: 'Vaccin typhus',
    date: '2025-08-20',
    type: 'vaccine',
    status: 'past',
  },
  {
    id: 'rem-6',
    petId: 'pet-1',
    title: 'Nettoyage dentaire',
    date: '2025-08-28',
    type: 'checkup',
    status: 'past',
  },
  
  // ===== UPCOMING REMINDERS =====
  
  // Juin 2026
  {
    id: 'rem-7',
    petId: 'pet-1',
    title: 'Vaccin antirabique (rappel)',
    date: '2026-06-08',
    type: 'vaccine',
    status: 'upcoming',
  },
  {
    id: 'rem-8',
    petId: 'pet-1',
    title: 'Contrôle annuel',
    date: '2026-06-15',
    type: 'checkup',
    status: 'upcoming',
  },
  {
    id: 'rem-9',
    petId: 'pet-1',
    title: 'Traitement anti-puces mensuel',
    date: '2026-06-25',
    type: 'medication',
    status: 'upcoming',
  },
  {
    id: 'rem-10',
    petId: 'pet-1',
    title: 'Examen de routine',
    date: '2026-06-30',
    type: 'checkup',
    status: 'upcoming',
  },
  
  // Août 2026
  {
    id: 'rem-11',
    petId: 'pet-1',
    title: 'Vermifuge trimestriel',
    date: '2026-08-10',
    type: 'vermifuge',
    status: 'upcoming',
  },
  {
    id: 'rem-12',
    petId: 'pet-1',
    title: 'Vaccin typhus (rappel)',
    date: '2026-08-20',
    type: 'vaccine',
    status: 'upcoming',
  },
  {
    id: 'rem-13',
    petId: 'pet-1',
    title: 'Traitement anti-tiques',
    date: '2026-08-25',
    type: 'medication',
    status: 'upcoming',
  },
  
  // ===== MAX'S REMINDERS (Pet 2) =====
  
  // Past
  {
    id: 'rem-14',
    petId: 'pet-2',
    title: 'Vaccin DHPP',
    date: '2025-06-05',
    type: 'vaccine',
    status: 'past',
  },
  {
    id: 'rem-15',
    petId: 'pet-2',
    title: 'Vermifuge',
    date: '2025-08-15',
    type: 'vermifuge',
    status: 'past',
  },
  
  // Upcoming
  {
    id: 'rem-16',
    petId: 'pet-2',
    title: 'Vaccin DHPP (rappel)',
    date: '2026-06-05',
    type: 'vaccine',
    status: 'upcoming',
  },
  {
    id: 'rem-17',
    petId: 'pet-2',
    title: 'Contrôle dentaire',
    date: '2026-06-18',
    type: 'checkup',
    status: 'upcoming',
  },
  {
    id: 'rem-18',
    petId: 'pet-2',
    title: 'Vermifuge',
    date: '2026-08-15',
    type: 'vermifuge',
    status: 'upcoming',
  },
];

// Demo Veterinarians
export interface DemoVet {
  id: string;
  name: string;
  specialty: string;
  location: string;
  distance: string;
  phone: string;
  imageEmoji: string;
  avatarUrl: string;
  avatarLocal?: any;
  latitude?: number;
  longitude?: number;
}

export const DEMO_VETS: DemoVet[] = [
  {
    id: 'vet-1',
    name: 'drh. Ariyo Hartono',
    specialty: 'Dentiste vétérinaire',
    location: 'Bierges',
    distance: '1.8 KM',
    phone: '+32 2 123 4567',
    imageEmoji: '👨‍⚕️',
    avatarLocal: require('../../assets/doctors/uifaces-popular-avatar.jpg'),
    avatarUrl: 'https://ui-avatars.com/api/?name=Ariyo+Hartono&background=2c5282&color=fff&size=200&bold=true',
    latitude: 50.7172,
    longitude: 4.5931,
  },
  {
    id: 'vet-2',
    name: 'drh. Christine',
    specialty: 'Vétérinaire généraliste',
    location: 'Limal',
    distance: '2.1 KM',
    phone: '+32 2 234 5678',
    imageEmoji: '👩‍⚕️',
    avatarLocal: require('../../assets/doctors/uifaces-popular-avatar-3.jpg'),
    avatarUrl: 'https://ui-avatars.com/api/?name=Christine+Moreau&background=5eb3b3&color=fff&size=200&bold=true',
    latitude: 50.6833,
    longitude: 4.5667,
  },
  {
    id: 'vet-3',
    name: 'drh. Marc Dubois',
    specialty: 'Dentiste vétérinaire',
    location: 'Bierges',
    distance: '1.8 KM',
    phone: '+32 2 345 6789',
    imageEmoji: '👨‍⚕️',
    avatarLocal: require('../../assets/doctors/uifaces-popular-avatar-4.jpg'),
    avatarUrl: 'https://ui-avatars.com/api/?name=Marc+Dubois&background=004c8c&color=fff&size=200&bold=true',
    latitude: 50.7165,
    longitude: 4.5925,
  },
  {
    id: 'vet-4',
    name: 'drh. Sophie Laurent',
    specialty: 'Vétérinaire généraliste',
    location: 'Wavre',
    distance: '2.1 KM',
    phone: '+32 2 456 7890',
    imageEmoji: '👩‍⚕️',
    avatarLocal: require('../../assets/doctors/uifaces-popular-avatar-5.jpg'),
    avatarUrl: 'https://ui-avatars.com/api/?name=Sophie+Laurent&background=d97706&color=fff&size=200&bold=true',
    latitude: 50.7167,
    longitude: 4.6167,
  },
];

// Demo Authentication Functions
class DemoAuthService {
  private currentUser: DemoUser | null = null;

  async signIn(email: string, password: string): Promise<DemoUser | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
      this.currentUser = user;
      return user;
    }

    throw new Error('Invalid email or password');
  }

  async signUp(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    petName: string;
    password: string;
  }): Promise<DemoUser> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create new demo user
    const newUser: DemoUser = {
      id: `owner-${Date.now()}`,
      email: userData.email,
      password: userData.password,
      role: 'owner',
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      location: 'BELGIQUE',
      petId: `pet-${Date.now()}`,
    };

    // Create new demo pet
    const newPet: DemoPet = {
      id: newUser.petId!,
      name: userData.petName,
      species: 'Chat',
      breed: 'Mixed',
      age: 1,
      weight: 4,
      gender: 'Male',
      location: 'BELGIQUE',
      ownerId: newUser.id,
      imageEmoji: '🐱',
    };

    // In a real app, we'd save to database
    // For demo, just add to arrays
    DEMO_USERS.push(newUser);
    DEMO_PETS.push(newPet);

    this.currentUser = newUser;
    return newUser;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
  }

  getCurrentUser(): DemoUser | null {
    return this.currentUser;
  }

  getUserById(userId: string): DemoUser | undefined {
    return DEMO_USERS.find(u => u.id === userId);
  }

  getPetById(petId: string): DemoPet | undefined {
    return DEMO_PETS.find(p => p.id === petId);
  }

  getPetsByOwner(ownerId: string): DemoPet[] {
    return DEMO_PETS.filter(p => p.ownerId === ownerId);
  }

  getHealthRecordsByPet(petId: string): HealthRecord[] {
    return DEMO_HEALTH_RECORDS.filter(hr => hr.petId === petId);
  }

  getDocumentsByPet(petId: string): DemoDocument[] {
    return DEMO_DOCUMENTS.filter(d => d.petId === petId);
  }

  getRemindersByPet(petId: string): DemoReminder[] {
    return DEMO_REMINDERS.filter(r => r.petId === petId);
  }

  getAllVets(): DemoVet[] {
    return DEMO_VETS;
  }
}

export const demoAuth = new DemoAuthService();
export default demoAuth;

