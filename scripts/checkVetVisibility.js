const admin = require('firebase-admin');

// Initialiser Firebase Admin
const serviceAccount = require('../petcare-2a317-firebase-adminsdk-fbsvc-89806992ca.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'petcare-2a317'
  });
}

const db = admin.firestore();

async function checkVetVisibility() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║       🩺 VÉRIFICATION DE LA VISIBILITÉ DES VÉTÉRINAIRES 🔍       ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Récupérer tous les utilisateurs avec role "vet"
    console.log('📋 Récupération de tous les vétérinaires...\n');
    const vetsSnapshot = await db.collection('users')
      .where('role', '==', 'vet')
      .get();

    if (vetsSnapshot.empty) {
      console.log('❌ AUCUN VÉTÉRINAIRE TROUVÉ dans la base de données !');
      console.log('   → Créez un compte vétérinaire via l\'app\n');
      return;
    }

    console.log(`✅ ${vetsSnapshot.size} vétérinaire(s) trouvé(s) dans la base\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let visibleCount = 0;
    let invisibleCount = 0;

    // 2. Vérifier chaque vétérinaire
    vetsSnapshot.forEach((doc, index) => {
      const vet = doc.data();
      const isVisible = vet.approved === true;

      if (isVisible) visibleCount++;
      else invisibleCount++;

      console.log(`🩺 VÉTÉRINAIRE #${index + 1}:`);
      console.log('   ├─ ID:', doc.id);
      console.log(`   ├─ Nom: ${vet.firstName || 'N/A'} ${vet.lastName || 'N/A'}`);
      console.log(`   ├─ Email: ${vet.email || 'N/A'}`);
      console.log(`   ├─ Role: ${vet.role || 'N/A'}`);
      console.log(`   ├─ Approved: ${vet.approved === true ? '✅ true' : '❌ false ou manquant'}`);
      
      // Champs optionnels mais recommandés
      console.log(`   ├─ Specialty: ${vet.specialty || '⚠️  NON RENSEIGNÉ'}`);
      console.log(`   ├─ Clinic Name: ${vet.clinicName || '⚠️  NON RENSEIGNÉ'}`);
      console.log(`   ├─ Location: ${vet.location || '⚠️  NON RENSEIGNÉ'}`);
      console.log(`   ├─ Phone: ${vet.phone || '⚠️  NON RENSEIGNÉ'}`);
      console.log(`   ├─ Avatar URL: ${vet.avatarUrl ? '✅ Oui' : '⚠️  Non'}`);
      console.log(`   ├─ Rating: ${vet.rating || 'N/A'}`);
      console.log(`   ├─ Premium Partner: ${vet.isPremiumPartner ? '✅ Oui' : 'Non'}`);
      
      // VERDICT
      if (isVisible) {
        console.log(`   └─ 🎉 VISIBLE dans la liste des vétérinaires pour les propriétaires`);
      } else {
        console.log(`   └─ ❌ PAS VISIBLE (approved = false ou manquant)`);
        console.log(`      → Mettez "approved: true" dans Firestore pour le rendre visible`);
      }
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 RÉSUMÉ:\n');
    console.log(`   ✅ Vétérinaires VISIBLES: ${visibleCount}`);
    console.log(`   ❌ Vétérinaires INVISIBLES: ${invisibleCount}`);
    console.log(`   📋 TOTAL: ${vetsSnapshot.size}\n`);

    // 3. Tester la requête exacte utilisée par l'app
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔍 TEST DE LA REQUÊTE APP (role="vet" ET approved=true):\n');
    
    const appQuerySnapshot = await db.collection('users')
      .where('role', '==', 'vet')
      .where('approved', '==', true)
      .get();

    if (appQuerySnapshot.empty) {
      console.log('❌ AUCUN VÉTÉRINAIRE ne sera affiché dans l\'app !');
      console.log('   → Vérifiez que "approved: true" est bien défini pour au moins un vétérinaire\n');
    } else {
      console.log(`✅ ${appQuerySnapshot.size} vétérinaire(s) seront affichés dans l'app\n`);
      
      appQuerySnapshot.forEach((doc, index) => {
        const vet = doc.data();
        console.log(`   ${index + 1}. Dr. ${vet.firstName} ${vet.lastName}`);
        console.log(`      📍 ${vet.location || 'Lieu non renseigné'}`);
        console.log(`      🏥 ${vet.specialty || 'Spécialité non renseignée'}`);
        console.log(`      📞 ${vet.phone || 'Téléphone non renseigné'}`);
        console.log('');
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 POUR RENDRE UN VÉTÉRINAIRE VISIBLE:\n');
    console.log('   1. Allez dans Firebase Console → Firestore Database');
    console.log('   2. Collection "users" → Trouvez le document du vétérinaire');
    console.log('   3. Vérifiez/Ajoutez: role = "vet"');
    console.log('   4. Vérifiez/Ajoutez: approved = true (boolean)');
    console.log('   5. Recommandé: specialty, clinicName, location, phone');
    console.log('   6. Rechargez l\'app (Ctrl+R)\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }

  process.exit(0);
}

checkVetVisibility();




