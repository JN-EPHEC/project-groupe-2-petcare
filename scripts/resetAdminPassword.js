/**
 * Script pour réinitialiser le mot de passe du compte admin
 * Usage: node scripts/resetAdminPassword.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Charger les credentials Firebase Admin SDK
const serviceAccount = require('../petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json');

// Initialiser Firebase Admin (vérifier s'il n'est pas déjà initialisé)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'petcare-2a317'
  });
}

const auth = admin.auth();

// Configuration
const ADMIN_EMAIL = 'soumia.ettouilpro@gmail.com';
const NEW_PASSWORD = 'admin123';

async function resetAdminPassword() {
  try {
    console.log('🔐 Réinitialisation du mot de passe admin...\n');

    // Trouver l'utilisateur par email
    const userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log('✅ Utilisateur trouvé');
    console.log('   Email:', userRecord.email);
    console.log('   UID:', userRecord.uid);

    // Mettre à jour le mot de passe
    await auth.updateUser(userRecord.uid, {
      password: NEW_PASSWORD,
    });

    console.log('\n' + '='.repeat(50));
    console.log('🎉 MOT DE PASSE RÉINITIALISÉ AVEC SUCCÈS !');
    console.log('='.repeat(50));
    console.log('\n📧 Vous pouvez maintenant vous connecter avec:');
    console.log('   Email: admin (ou soumia.ettouilpro@gmail.com)');
    console.log('   Mot de passe: admin123');
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 Le compte n\'existe pas encore.');
      console.log('   Exécutez d\'abord: node scripts/createAdminAccount.js');
    }
    
    process.exit(1);
  }
}

// Exécuter le script
resetAdminPassword();

