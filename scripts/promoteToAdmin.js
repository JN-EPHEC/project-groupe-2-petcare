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
 * Script pour promouvoir un utilisateur en administrateur
 * Usage: node scripts/promoteToAdmin.js <email>
 */
async function promoteToAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: node scripts/promoteToAdmin.js <email>');
    console.error('   Exemple: node scripts/promoteToAdmin.js user@example.com');
    process.exit(1);
  }

  try {
    console.log('\n👑 Promotion en administrateur...\n');

    // Trouver l'utilisateur par email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('✅ Utilisateur trouvé');
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   UID: ${userRecord.uid}\n`);

    // Mettre à jour dans Firestore
    await db.collection('users').doc(userRecord.uid).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Définir custom claims (pour sécurité supplémentaire)
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

    console.log('==================================================');
    console.log('🎉 UTILISATEUR PROMU EN ADMINISTRATEUR !');
    console.log('==================================================\n');
    console.log(`📧 ${email} a maintenant les privilèges admin`);
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR lors de la promotion:');
    
    if (error.code === 'auth/user-not-found') {
      console.error('   → Aucun utilisateur trouvé avec cet email');
    } else {
      console.error('   →', error.message);
    }
    
    console.error('\n');
    process.exit(1);
  }
}

promoteToAdmin();








