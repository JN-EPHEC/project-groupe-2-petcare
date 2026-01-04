/**
 * Script pour créer un compte administrateur dans Firebase
 * Usage: node scripts/createAdminAccount.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Charger les credentials Firebase Admin SDK
const serviceAccount = require('../petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'petcare-2a317'
});

const auth = admin.auth();
const db = admin.firestore();

// Configuration du compte admin
const ADMIN_CONFIG = {
  email: 'soumia.ettouilpro@gmail.com',
  password: 'admin123',
  firstName: 'Soumia',
  lastName: 'Ettouil',
  phone: '+32 2 000 0000',
  location: 'Belgique'
};

async function createAdminAccount() {
  try {
    console.log('🚀 Création du compte administrateur...\n');

    // 1. Vérifier si l'utilisateur existe déjà
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(ADMIN_CONFIG.email);
      console.log('ℹ️  Un utilisateur avec cet email existe déjà:', ADMIN_CONFIG.email);
      console.log('   UID:', userRecord.uid);
      
      // Demander confirmation pour continuer
      console.log('\n⚠️  Mise à jour de l\'utilisateur existant...\n');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // L'utilisateur n'existe pas, on peut le créer
        console.log('✅ Email disponible, création du compte...\n');
        
        userRecord = await auth.createUser({
          email: ADMIN_CONFIG.email,
          password: ADMIN_CONFIG.password,
          displayName: `${ADMIN_CONFIG.firstName} ${ADMIN_CONFIG.lastName}`,
          emailVerified: true, // Vérifier l'email automatiquement pour l'admin
        });
        
        console.log('✅ Compte Firebase Auth créé');
        console.log('   UID:', userRecord.uid);
        console.log('   Email:', userRecord.email);
      } else {
        throw error;
      }
    }

    // 2. Créer/Mettre à jour le document Firestore
    const userDocData = {
      email: ADMIN_CONFIG.email,
      firstName: ADMIN_CONFIG.firstName,
      lastName: ADMIN_CONFIG.lastName,
      role: 'admin',
      phone: ADMIN_CONFIG.phone,
      location: ADMIN_CONFIG.location,
      avatarUrl: `https://ui-avatars.com/api/?name=${ADMIN_CONFIG.firstName}+${ADMIN_CONFIG.lastName}&background=FF6B00&color=fff`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(userRecord.uid).set(userDocData, { merge: true });
    
    console.log('\n✅ Document Firestore créé/mis à jour');
    console.log('   Collection: users');
    console.log('   Document ID:', userRecord.uid);
    console.log('   Rôle: admin');

    // 3. Afficher les informations de connexion
    console.log('\n' + '='.repeat(50));
    console.log('🎉 COMPTE ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !');
    console.log('='.repeat(50));
    console.log('\n📧 Informations de connexion:');
    console.log('   Email:', ADMIN_CONFIG.email);
    console.log('   Mot de passe:', ADMIN_CONFIG.password);
    console.log('   Rôle: Administrateur');
    console.log('\n🔑 UID Firebase:', userRecord.uid);
    console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion!');
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de la création du compte admin:', error);
    process.exit(1);
  }
}

// Exécuter le script
createAdminAccount();

