const { exec } = require('child_process');
const path = require('path');

console.log('📋 Déploiement des règles Firestore...\n');

const projectRoot = path.join(__dirname, '..');
const command = 'firebase deploy --only firestore:rules';

exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Erreur lors du déploiement:', error.message);
    if (stderr) {
      console.error('❌ Détails:', stderr);
    }
    process.exit(1);
  }

  if (stdout) {
    console.log(stdout);
  }

  console.log('\n✅ Règles Firestore déployées avec succès!');
  console.log('\n📝 Changements appliqués:');
  console.log('   • Lecture des profils users: TOUS les utilisateurs authentifiés');
  console.log('   • Les propriétaires peuvent maintenant voir les vétérinaires');
  console.log('   • La recherche de vétérinaires fonctionne pour tous');
});



