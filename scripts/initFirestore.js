const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Charger le service account
const serviceAccount = require('../petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'petcare-2a317'
});

const db = admin.firestore();
const auth = admin.auth();

console.log('🔥 Initialisation de Firebase Firestore...\n');

// Fonction pour créer un utilisateur et son document Firestore
async function createUser(email, password, userData) {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: `${userData.firstName} ${userData.lastName}`,
    });

    console.log(`✅ Utilisateur Auth créé: ${email}`);

    // Créer le document utilisateur dans Firestore
    await db.collection('users').doc(userRecord.uid).set({
      ...userData,
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Document Firestore créé pour: ${email}\n`);

    return userRecord.uid;
  } catch (error) {
    console.error(`❌ Erreur pour ${email}:`, error.message);
    return null;
  }
}

// Fonction principale d'initialisation
async function initializeFirestore() {
  try {
    console.log('📝 Création des utilisateurs...\n');

    // 1. Créer l'utilisateur propriétaire (Charles)
    const ownerId = await createUser('owner@petcare.com', 'owner123', {
      firstName: 'Charles',
      lastName: 'Dupont',
      role: 'owner',
      phone: '+32 49 123 4567',
      location: 'Wavre, Belgique',
      avatarUrl: 'https://ui-avatars.com/api/?name=Charles+Dupont&background=0D4C92&color=fff',
    });

    // 2. Créer l'utilisateur vétérinaire
    const vetId = await createUser('vet@petcare.com', 'vet123', {
      firstName: 'Dr. Sophie',
      lastName: 'Martin',
      role: 'vet',
      phone: '+32 2 123 4567',
      location: 'Bruxelles, Belgique',
      specialty: 'Vétérinaire généraliste',
      experience: '10 ans',
      clinicName: 'Clinique Vétérinaire de Bruxelles',
      clinicAddress: 'Rue de la Loi 123, 1040 Bruxelles',
      approved: true,
      rating: 4.8,
      avatarUrl: 'https://ui-avatars.com/api/?name=Sophie+Martin&background=00BCD4&color=fff',
    });

    // 3. Créer l'utilisateur admin
    const adminId = await createUser('admin@petcare.com', 'admin123', {
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '+32 49 111 2222',
      location: 'Bruxelles, Belgique',
      avatarUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=0D4C92&color=fff',
    });

    if (!ownerId) {
      console.error('❌ Impossible de créer les données sans utilisateur propriétaire');
      return;
    }

    console.log('🐾 Création des animaux...\n');

    // 4. Créer les animaux
    const pet1Ref = await db.collection('pets').add({
      name: 'Rex',
      type: 'dog',
      breed: 'Labrador',
      age: 3,
      weight: 30,
      emoji: '🐕',
      ownerId: ownerId,
      birthDate: '2021-05-15',
      gender: 'male',
      color: 'Doré',
      microchipId: '123456789',
      avatarUrl: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Animal créé: Rex (${pet1Ref.id})`);

    const pet2Ref = await db.collection('pets').add({
      name: 'Minou',
      type: 'cat',
      breed: 'Persan',
      age: 2,
      weight: 4.5,
      emoji: '🐈',
      ownerId: ownerId,
      birthDate: '2022-03-20',
      gender: 'female',
      color: 'Blanc',
      microchipId: '987654321',
      avatarUrl: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Animal créé: Minou (${pet2Ref.id})\n`);

    console.log('💉 Création des vaccinations...\n');

    // 5. Créer des vaccinations
    await db.collection('vaccinations').add({
      petId: pet1Ref.id,
      petName: 'Rex',
      ownerId: ownerId,
      vaccineName: 'Rage',
      date: '2024-01-15',
      nextDueDate: '2025-01-15',
      vet: 'Dr. Sophie Martin',
      batchNumber: 'RAB-2024-001',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('vaccinations').add({
      petId: pet1Ref.id,
      petName: 'Rex',
      ownerId: ownerId,
      vaccineName: 'DHPP',
      date: '2024-02-10',
      nextDueDate: '2025-02-10',
      vet: 'Dr. Sophie Martin',
      batchNumber: 'DHPP-2024-002',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('vaccinations').add({
      petId: pet2Ref.id,
      petName: 'Minou',
      ownerId: ownerId,
      vaccineName: 'Typhus',
      date: '2024-03-05',
      nextDueDate: '2025-03-05',
      vet: 'Dr. Sophie Martin',
      batchNumber: 'TYP-2024-003',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ 3 vaccinations créées\n');

    console.log('🏥 Création de l\'historique médical...\n');

    // 6. Créer des dossiers médicaux
    await db.collection('health_records').add({
      petId: pet1Ref.id,
      petName: 'Rex',
      ownerId: ownerId,
      type: 'vaccination',
      title: 'Vaccination antirabique',
      date: '2024-01-15',
      vet: 'Dr. Sophie Martin',
      description: 'Vaccination contre la rage',
      medications: [],
      cost: 45,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('health_records').add({
      petId: pet1Ref.id,
      petName: 'Rex',
      ownerId: ownerId,
      type: 'checkup',
      title: 'Contrôle annuel',
      date: '2024-06-10',
      vet: 'Dr. Sophie Martin',
      description: 'Examen général, tout va bien',
      medications: [],
      cost: 60,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('health_records').add({
      petId: pet2Ref.id,
      petName: 'Minou',
      ownerId: ownerId,
      type: 'treatment',
      title: 'Traitement vermifuge',
      date: '2024-07-20',
      vet: 'Dr. Sophie Martin',
      description: 'Administration de vermifuge',
      medications: ['Milbemax'],
      cost: 25,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ 3 dossiers médicaux créés\n');

    console.log('⏰ Création des rappels...\n');

    // 7. Créer des rappels
    await db.collection('reminders').add({
      petId: pet1Ref.id,
      petName: 'Rex',
      ownerId: ownerId,
      title: 'Vaccin antirabique',
      type: 'vaccine',
      date: '2025-01-15',
      time: '14:00',
      completed: false,
      notes: 'Rappel de vaccination annuelle',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('reminders').add({
      petId: pet1Ref.id,
      petName: 'Rex',
      ownerId: ownerId,
      title: 'Vermifuge',
      type: 'vermifuge',
      date: '2024-12-15',
      time: '10:00',
      completed: false,
      notes: 'Traitement vermifuge trimestriel',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('reminders').add({
      petId: pet2Ref.id,
      petName: 'Minou',
      ownerId: ownerId,
      title: 'Contrôle vétérinaire',
      type: 'checkup',
      date: '2024-12-01',
      time: '15:30',
      completed: false,
      notes: 'Contrôle de routine',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ 3 rappels créés\n');

    console.log('📄 Création des documents...\n');

    // 8. Créer des documents
    await db.collection('documents').add({
      petId: pet1Ref.id,
      petName: 'Rex',
      ownerId: ownerId,
      name: 'Passeport Rex.pdf',
      type: 'pdf',
      url: null,
      uploadDate: '2024-01-10',
      size: 245000,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('documents').add({
      petId: pet1Ref.id,
      petName: 'Rex',
      ownerId: ownerId,
      name: 'Carnet de santé Rex.pdf',
      type: 'pdf',
      url: null,
      uploadDate: '2024-03-15',
      size: 180000,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ 2 documents créés\n');

    if (vetId) {
      console.log('📅 Création des rendez-vous...\n');

      // 9. Créer des rendez-vous
      await db.collection('appointments').add({
        petId: pet1Ref.id,
        petName: 'Rex',
        ownerId: ownerId,
        ownerName: 'Charles Dupont',
        vetId: vetId,
        vetName: 'Dr. Sophie Martin',
        date: '2024-12-15',
        time: '14:00',
        type: 'Consultation',
        status: 'upcoming',
        notes: 'Contrôle de routine',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection('appointments').add({
        petId: pet2Ref.id,
        petName: 'Minou',
        ownerId: ownerId,
        ownerName: 'Charles Dupont',
        vetId: vetId,
        vetName: 'Dr. Sophie Martin',
        date: '2024-12-20',
        time: '10:30',
        type: 'Vaccination',
        status: 'upcoming',
        notes: 'Vaccination annuelle',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Add more appointments for testing
      await db.collection('appointments').add({
        petId: pet1Ref.id,
        petName: 'Rex',
        ownerId: ownerId,
        ownerName: 'Charles Dupont',
        vetId: vetId,
        vetName: 'Dr. Sophie Martin',
        date: '2024-11-15',
        time: '09:00',
        type: 'Vaccination',
        status: 'completed',
        notes: 'Vaccin antirabique effectué',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection('appointments').add({
        petId: pet2Ref.id,
        petName: 'Minou',
        ownerId: ownerId,
        ownerName: 'Charles Dupont',
        vetId: vetId,
        vetName: 'Dr. Sophie Martin',
        date: '2024-12-25',
        time: '16:00',
        type: 'Contrôle',
        status: 'cancelled',
        notes: 'Annulé par le propriétaire',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('✅ 4 rendez-vous créés (2 upcoming, 1 completed, 1 cancelled)\n');
    }

    // 10. Créer un vétérinaire en attente d'approbation
    console.log('👨‍⚕️ Création d\'un vétérinaire en attente...\n');
    
    const pendingVetId = await createUser('pendingvet@petcare.com', 'vet123', {
      firstName: 'Dr. Jean',
      lastName: 'Martin',
      role: 'vet',
      phone: '+32 2 987 6543',
      location: 'Namur, Belgique',
      specialty: 'Chirurgien',
      experience: '5 ans',
      clinicName: 'Clinique Vétérinaire de Namur',
      clinicAddress: 'Avenue de la Gare 45, Namur',
      approved: false,
      avatarUrl: 'https://ui-avatars.com/api/?name=Jean+Martin&background=9B59B6&color=fff',
    });

    console.log('✅ 1 vétérinaire en attente d\'approbation créé\n');

    // 11. Créer plus d'animaux avec différents types
    console.log('🐾 Création d\'animaux supplémentaires...\n');

    const pet3Ref = await db.collection('pets').add({
      name: 'Lucky',
      type: 'other',
      breed: 'Lapin nain',
      age: 1,
      weight: 1.5,
      emoji: '🐰',
      ownerId: ownerId,
      gender: 'male',
      birthDate: '2023-06-15',
      color: 'Blanc et gris',
      avatarUrl: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const pet4Ref = await db.collection('pets').add({
      name: 'Bella',
      type: 'cat',
      breed: 'Siamois',
      age: 4,
      weight: 4,
      emoji: '🐱',
      ownerId: ownerId,
      gender: 'female',
      birthDate: '2020-03-20',
      color: 'Crème',
      avatarUrl: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ 2 animaux supplémentaires créés (Lucky le lapin, Bella le chat)\n');

    console.log('🎉 Initialisation terminée avec succès!\n');
    console.log('📊 Résumé:');
    console.log('  - 4 utilisateurs créés (owner, vet, admin, pending vet)');
    console.log('  - 4 animaux créés (2 chiens, 2 chats, 1 autre)');
    console.log('  - 3 vaccinations créées');
    console.log('  - 3 dossiers médicaux créés');
    console.log('  - 3 rappels créés');
    console.log('  - 2 documents créés');
    console.log('  - 4 rendez-vous créés (2 upcoming, 1 completed, 1 cancelled)\n');

    console.log('✅ Tu peux maintenant te connecter avec:');
    console.log('  📧 Propriétaire: owner@petcare.com / owner123');
    console.log('  👨‍⚕️ Vétérinaire: vet@petcare.com / vet123');
    console.log('  🔐 Admin: admin@petcare.com / admin123\n');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    process.exit();
  }
}

// Lancer l'initialisation
initializeFirestore();

