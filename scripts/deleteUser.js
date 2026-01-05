const admin = require('firebase-admin');
const serviceAccount = require('../petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

/**
 * Script pour supprimer complètement un utilisateur (Auth + Firestore)
 * Usage: node scripts/deleteUser.js <email>
 */
async function deleteUser() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: node scripts/deleteUser.js <email>');
    console.error('   Exemple: node scripts/deleteUser.js user@example.com');
    process.exit(1);
  }

  try {
    console.log('\n🗑️  Suppression de l\'utilisateur...\n');

    // Trouver l'utilisateur par email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('✅ Utilisateur trouvé dans Firebase Auth');
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   UID: ${userRecord.uid}\n`);

    // Supprimer de Firestore
    try {
      await db.collection('users').doc(userRecord.uid).delete();
      console.log('✅ Document Firestore supprimé');
    } catch (error) {
      console.warn('⚠️  Erreur lors de la suppression du document Firestore (peut-être inexistant)');
    }

    // Supprimer de Firebase Auth
    await admin.auth().deleteUser(userRecord.uid);
    console.log('✅ Utilisateur supprimé de Firebase Auth\n');

    console.log('==================================================');
    console.log('🎉 UTILISATEUR SUPPRIMÉ AVEC SUCCÈS !');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR lors de la suppression:');
    
    if (error.code === 'auth/user-not-found') {
      console.error('   → Aucun utilisateur trouvé avec cet email');
    } else if (error.code === 'auth/invalid-email') {
      console.error('   → Email invalide');
    } else {
      console.error('   →', error.message);
    }
    
    console.error('\n');
    process.exit(1);
  }
}

deleteUser();






