// Types et interfaces partagées pour les fonctionnalités Premium

export interface BlogArticle {
  id: string;
  title: string;
  category: 'emergency' | 'species' | 'nutrition' | 'behavior' | 'health';
  species: ('dog' | 'cat' | 'bird' | 'reptile' | 'other')[];
  excerpt: string;
  content: string;
  imageUrl: string;
  tags: string[];
  authorId: string;
  authorName: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

export interface SharedPet {
  id: string;
  petId: string;
  ownerId: string;
  shareToken: string;
  createdAt: string;
  expiresAt?: string;
  accessCount: number;
  isActive: boolean;
}

export interface WellnessEntry {
  id: string;
  petId: string;
  petName: string;
  ownerId: string;
  type: 'weight' | 'activity' | 'food' | 'growth';
  date: string;
  value: number;
  unit: string;
  notes?: string;
  createdAt: string;
}

export interface WellnessAlert {
  id: string;
  petId: string;
  ownerId: string;
  type: 'weight_loss' | 'weight_gain' | 'low_activity' | 'food_change';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: string;
  dismissed: boolean;
}

export interface SharedPetData {
  pet: {
    id: string;
    name: string;
    type: string;
    breed: string;
    age: number;
    weight: number;
    emoji: string;
    birthDate?: string;
    gender?: string;
    color?: string;
    microchipId?: string;
  };
  vaccinations: any[];
  healthRecords: any[];
  reminders: any[];
  owner: {
    firstName: string;
    lastName: string;
    location?: string;
  };
}

export type BlogCategory = BlogArticle['category'];
export type WellnessType = WellnessEntry['type'];
export type AlertSeverity = WellnessAlert['severity'];





