/**
 * Script pour générer les assets d'images manquants
 * Usage: node scripts/generateAssets.js
 */

const Jimp = require('jimp-compact');
const path = require('path');

async function generateAssets() {
  try {
    console.log('🎨 Génération des assets...\n');

    const logoPath = path.join(__dirname, '..', 'logo.jpeg');
    const assetsDir = path.join(__dirname, '..', 'assets');

    // Charger le logo
    console.log('📷 Chargement du logo...');
    const logo = await Jimp.read(logoPath);
    console.log('✅ Logo chargé\n');

    // Générer icon.png (1024x1024)
    console.log('🔨 Génération de icon.png (1024x1024)...');
    await logo
      .clone()
      .resize(1024, 1024)
      .writeAsync(path.join(assetsDir, 'icon.png'));
    console.log('✅ icon.png créé\n');

    // Générer adaptive-icon.png (1024x1024)
    console.log('🔨 Génération de adaptive-icon.png (1024x1024)...');
    await logo
      .clone()
      .resize(1024, 1024)
      .writeAsync(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✅ adaptive-icon.png créé\n');

    // Générer splash.png (2048x2048 avec background blanc)
    console.log('🔨 Génération de splash.png (2048x2048)...');
    const splash = await new Jimp(2048, 2048, '#FFFFFF');
    const logoForSplash = logo.clone().resize(1024, 1024);
    
    // Centrer le logo dans le splash
    const x = (2048 - 1024) / 2;
    const y = (2048 - 1024) / 2;
    splash.composite(logoForSplash, x, y);
    
    await splash.writeAsync(path.join(assetsDir, 'splash.png'));
    console.log('✅ splash.png créé\n');

    // Générer favicon.png (48x48)
    console.log('🔨 Génération de favicon.png (48x48)...');
    await logo
      .clone()
      .resize(48, 48)
      .writeAsync(path.join(assetsDir, 'favicon.png'));
    console.log('✅ favicon.png créé\n');

    console.log('🎉 Tous les assets ont été générés avec succès !');
    console.log('\nFichiers créés :');
    console.log('  ✓ assets/icon.png (1024x1024)');
    console.log('  ✓ assets/adaptive-icon.png (1024x1024)');
    console.log('  ✓ assets/splash.png (2048x2048)');
    console.log('  ✓ assets/favicon.png (48x48)');
    console.log('\n💡 Vous pouvez maintenant redémarrer votre app Expo.\n');

  } catch (error) {
    console.error('❌ Erreur lors de la génération des assets:', error);
    process.exit(1);
  }
}

generateAssets();






