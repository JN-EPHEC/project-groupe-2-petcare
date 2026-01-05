// Script pour ajouter un vétérinaire de test dans Firestore
const admin = require('firebase-admin');

// Initialiser Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addTestVet() {
  try {
    console.log('🔧 Ajout d\'un vétérinaire de test...\n');

    const vetData = {
      // AUTHENTIFICATION
      email: 'vet.test@petcare.com',
      
      // IDENTIFICATION
      role: 'vet',
      approved: true,
      
      // INFORMATIONS PERSONNELLES
      firstName: 'Christine',
      lastName: 'Hartono',
      
      // INFORMATIONS PROFESSIONNELLES
      specialty: 'Vétérinaire généraliste',
      clinicName: 'Clinique Vétérinaire de Wavre',
      clinicAddress: 'Rue de la Station 45, 1300 Wavre',
      location: 'Wavre',
      phone: '+32 2 234 5678',
      
      // AUTRES
      isPremiumPartner: false,
      rating: 4.8,
      experience: '8 ans',
      
      // MÉTADONNÉES
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      onboardingCompleted: true,
    };

    // Ajouter le vétérinaire
    const docRef = await db.collection('users').add(vetData);
    
    console.log('✅ Vétérinaire ajouté avec succès !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 ID: ${docRef.id}`);
    console.log(`👤 Nom: ${vetData.firstName} ${vetData.lastName}`);
    console.log(`🏥 Clinique: ${vetData.clinicName}`);
    console.log(`📍 Localisation: ${vetData.location}`);
    console.log(`✅ Role: ${vetData.role}`);
    console.log(`✅ Approved: ${vetData.approved}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Vérifier que le vétérinaire peut être récupéré
    const vetsQuery = await db.collection('users')
      .where('role', '==', 'vet')
      .where('approved', '==', true)
      .get();

    console.log(`🔍 Vétérinaires trouvés dans la base: ${vetsQuery.size}`);
    
    vetsQuery.forEach(doc => {
      const data = doc.data();
      console.log(`   • ${data.firstName} ${data.lastName} - ${data.location}`);
    });

    console.log('\n✨ Script terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addTestVet();




