const admin = require('firebase-admin');
const serviceAccount = require('../petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

/**
 * Script pour réinitialiser le mot de passe d'un utilisateur
 * Usage: node scripts/resetUserPassword.js <email> <newPassword>
 */
async function resetUserPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('❌ Usage: node scripts/resetUserPassword.js <email> <newPassword>');
    console.error('   Exemple: node scripts/resetUserPassword.js user@example.com newPassword123');
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error('❌ Le mot de passe doit contenir au moins 6 caractères');
    process.exit(1);
  }

  try {
    console.log('\n🔐 Réinitialisation du mot de passe...\n');

    // Trouver l'utilisateur par email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('✅ Utilisateur trouvé');
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   UID: ${userRecord.uid}\n`);

    // Mettre à jour le mot de passe
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });

    console.log('==================================================');
    console.log('🎉 MOT DE PASSE RÉINITIALISÉ AVEC SUCCÈS !');
    console.log('==================================================\n');
    console.log(`📧 L'utilisateur peut maintenant se connecter avec:`);
    console.log(`   Email: ${email}`);
    console.log(`   Nouveau mot de passe: ${newPassword}`);
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR lors de la réinitialisation du mot de passe:');
    
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

resetUserPassword();






