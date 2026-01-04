// Script pour vérifier les vétérinaires dans Firestore
const admin = require('firebase-admin');

// Initialiser Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkVets() {
  try {
    console.log('🔍 Vérification des vétérinaires dans Firestore...\n');

    // Récupérer TOUS les utilisateurs avec role = "vet"
    const allVetsQuery = await db.collection('users')
      .where('role', '==', 'vet')
      .get();

    console.log(`📊 Total de vétérinaires avec role='vet': ${allVetsQuery.size}\n`);

    if (allVetsQuery.size === 0) {
      console.log('❌ AUCUN VÉTÉRINAIRE TROUVÉ !');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💡 Solution : Exécutez le script addTestVet.js');
      console.log('   npm run add-test-vet');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      process.exit(1);
    }

    allVetsQuery.forEach(doc => {
      const data = doc.data();
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📋 ID: ${doc.id}`);
      console.log(`👤 Nom: ${data.firstName} ${data.lastName}`);
      console.log(`📧 Email: ${data.email}`);
      console.log(`✅ Role: ${data.role} ${data.role === 'vet' ? '✓' : '✗'}`);
      console.log(`✅ Approved: ${data.approved} ${data.approved === true ? '✓' : '✗'}`);
      console.log(`🏥 Clinique: ${data.clinicName || 'Non renseigné'}`);
      console.log(`📍 Location: ${data.location || 'Non renseigné'}`);
      console.log(`📞 Phone: ${data.phone || 'Non renseigné'}`);
      console.log(`🎓 Specialty: ${data.specialty || 'Non renseigné'}`);
      
      if (data.role !== 'vet' || data.approved !== true) {
        console.log('\n⚠️  PROBLÈME DÉTECTÉ:');
        if (data.role !== 'vet') {
          console.log(`   ❌ role devrait être "vet" mais est "${data.role}"`);
        }
        if (data.approved !== true) {
          console.log(`   ❌ approved devrait être true mais est ${data.approved}`);
        }
      } else {
        console.log('\n✅ Ce vétérinaire est VALIDE et devrait apparaître dans l\'app');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });

    // Maintenant vérifier avec les DEUX filtres (comme dans l'app)
    const approvedVetsQuery = await db.collection('users')
      .where('role', '==', 'vet')
      .where('approved', '==', true)
      .get();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RÉSUMÉ:');
    console.log(`   Total vétérinaires: ${allVetsQuery.size}`);
    console.log(`   Vétérinaires approuvés: ${approvedVetsQuery.size}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (approvedVetsQuery.size === 0) {
      console.log('❌ AUCUN VÉTÉRINAIRE APPROUVÉ !');
      console.log('\n💡 Solutions:');
      console.log('   1. Vérifiez que approved = true (booléen, pas string)');
      console.log('   2. Vérifiez que role = "vet" (string exacte)');
      console.log('   3. Ou exécutez: npm run add-test-vet\n');
    } else {
      console.log('✅ Les vétérinaires devraient apparaître dans l\'app !');
      console.log('\n💡 Si ce n\'est pas le cas:');
      console.log('   1. Rechargez l\'app (Ctrl+R)');
      console.log('   2. Vérifiez la console du navigateur pour les erreurs');
      console.log('   3. Vérifiez que vous êtes sur le bon écran\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkVets();



