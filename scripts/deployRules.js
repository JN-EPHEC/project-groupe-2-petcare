const admin = require('firebase-admin');
const fs = require('fs');

// Charger le service account
const serviceAccount = require('../petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json');

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'petcare-2a317'
});

console.log('🔥 Déploiement des règles Firestore...\n');

async function deployRules() {
  try {
    // Lire le fichier de règles
    const rulesContent = fs.readFileSync('./firestore.rules', 'utf8');
    
    console.log('📄 Règles Firestore lues avec succès');
    console.log('✅ Les règles sont prêtes à être déployées\n');
    
    console.log('⚠️  IMPORTANT:');
    console.log('Les règles de sécurité Firestore doivent être déployées manuellement via la console Firebase.');
    console.log('\n📋 Étapes:');
    console.log('1. Va sur: https://console.firebase.google.com/project/petcare-2a317/firestore/rules');
    console.log('2. Copie le contenu du fichier firestore.rules');
    console.log('3. Colle-le dans l\'éditeur de règles');
    console.log('4. Clique sur "Publier"\n');
    
    console.log('✅ Alternative: Les règles sont déjà configurées dans le fichier firestore.rules');
    console.log('   Tu peux les déployer plus tard si nécessaire.\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

deployRules();

