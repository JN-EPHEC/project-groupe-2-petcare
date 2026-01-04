const admin = require('firebase-admin');
const serviceAccount = require('../petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

/**
 * Script pour définir les custom claims admin
 * Usage: node scripts/setAdminClaims.js
 */
async function setAdminClaims() {
  const ADMIN_EMAIL = 'soumia.ettouilpro@gmail.com';

  try {
    console.log('\n👑 Configuration des custom claims admin...\n');

    // Trouver l'utilisateur par email
    const userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
    console.log('✅ Utilisateur trouvé');
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   UID: ${userRecord.uid}\n`);

    // Définir les custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { 
      admin: true,
      role: 'admin'
    });

    console.log('==================================================');
    console.log('🎉 CUSTOM CLAIMS DÉFINIS AVEC SUCCÈS !');
    console.log('==================================================\n');
    console.log(`✅ ${ADMIN_EMAIL} a maintenant :`);
    console.log('   • custom claim "admin": true');
    console.log('   • custom claim "role": "admin"');
    console.log('\n==================================================');
    console.log('Les Cloud Functions peuvent maintenant vérifier');
    console.log('les droits admin de cet utilisateur.');
    console.log('==================================================\n');

    // Vérifier les claims
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('📋 Custom claims actuels:');
    console.log(JSON.stringify(updatedUser.customClaims, null, 2));
    console.log('');

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

setAdminClaims();





