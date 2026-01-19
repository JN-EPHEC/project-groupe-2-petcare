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
 * Script pour suspendre/activer un utilisateur
 * Usage: node scripts/suspendUser.js <email> <action>
 *        action: suspend | activate
 */
async function manageUserStatus() {
  const email = process.argv[2];
  const action = process.argv[3];

  if (!email || !action || !['suspend', 'activate'].includes(action)) {
    console.error('❌ Usage: node scripts/suspendUser.js <email> <suspend|activate>');
    console.error('   Exemples:');
    console.error('   - Suspendre: node scripts/suspendUser.js user@example.com suspend');
    console.error('   - Activer:   node scripts/suspendUser.js user@example.com activate');
    process.exit(1);
  }

  try {
    console.log(`\n${action === 'suspend' ? '⏸️  Suspension' : '▶️  Activation'} du compte...\n`);

    // Trouver l'utilisateur par email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('✅ Utilisateur trouvé');
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   UID: ${userRecord.uid}\n`);

    if (action === 'suspend') {
      // Désactiver dans Firebase Auth
      await admin.auth().updateUser(userRecord.uid, {
        disabled: true,
      });

      // Mettre à jour dans Firestore
      await db.collection('users').doc(userRecord.uid).update({
        status: 'suspended',
        disabled: true,
        suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('==================================================');
      console.log('🎉 COMPTE SUSPENDU AVEC SUCCÈS !');
      console.log('==================================================\n');
      console.log(`⏸️  ${email} ne peut plus se connecter`);
    } else {
      // Activer dans Firebase Auth
      await admin.auth().updateUser(userRecord.uid, {
        disabled: false,
      });

      // Mettre à jour dans Firestore
      await db.collection('users').doc(userRecord.uid).update({
        status: 'active',
        disabled: false,
        reactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('==================================================');
      console.log('🎉 COMPTE ACTIVÉ AVEC SUCCÈS !');
      console.log('==================================================\n');
      console.log(`▶️  ${email} peut maintenant se connecter`);
    }
    
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR:');
    
    if (error.code === 'auth/user-not-found') {
      console.error('   → Aucun utilisateur trouvé avec cet email');
    } else {
      console.error('   →', error.message);
    }
    
    console.error('\n');
    process.exit(1);
  }
}

manageUserStatus();








