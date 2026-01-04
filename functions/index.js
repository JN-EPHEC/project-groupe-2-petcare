const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialiser Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function pour supprimer un utilisateur
 * URL: https://YOUR-PROJECT.cloudfunctions.net/deleteUser
 */
exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Vérifier que l'appelant est un admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Seuls les administrateurs peuvent supprimer des utilisateurs'
    );
  }

  const { userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'userId est requis'
    );
  }

  try {
    // Supprimer de Firestore
    await db.collection('users').doc(userId).delete();
    
    // Supprimer de Firebase Auth
    await admin.auth().deleteUser(userId);

    return { 
      success: true, 
      message: `Utilisateur ${userId} supprimé avec succès` 
    };
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Erreur: ${error.message}`
    );
  }
});

/**
 * Cloud Function pour suspendre un utilisateur
 */
exports.suspendUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Seuls les administrateurs peuvent suspendre des utilisateurs'
    );
  }

  const { userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'userId est requis'
    );
  }

  try {
    // Désactiver dans Firebase Auth
    await admin.auth().updateUser(userId, { disabled: true });
    
    // Mettre à jour dans Firestore
    await db.collection('users').doc(userId).update({
      status: 'suspended',
      disabled: true,
      suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { 
      success: true, 
      message: 'Utilisateur suspendu avec succès' 
    };
  } catch (error) {
    console.error('Erreur lors de la suspension:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Erreur: ${error.message}`
    );
  }
});

/**
 * Cloud Function pour activer un utilisateur
 */
exports.activateUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Seuls les administrateurs peuvent activer des utilisateurs'
    );
  }

  const { userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'userId est requis'
    );
  }

  try {
    // Activer dans Firebase Auth
    await admin.auth().updateUser(userId, { disabled: false });
    
    // Mettre à jour dans Firestore
    await db.collection('users').doc(userId).update({
      status: 'active',
      disabled: false,
      reactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { 
      success: true, 
      message: 'Utilisateur activé avec succès' 
    };
  } catch (error) {
    console.error('Erreur lors de l\'activation:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Erreur: ${error.message}`
    );
  }
});

/**
 * Cloud Function pour promouvoir un utilisateur en admin
 */
exports.promoteToAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Seuls les administrateurs peuvent promouvoir des utilisateurs'
    );
  }

  const { userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'userId est requis'
    );
  }

  try {
    // Définir les custom claims
    await admin.auth().setCustomUserClaims(userId, { admin: true });
    
    // Mettre à jour dans Firestore
    await db.collection('users').doc(userId).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { 
      success: true, 
      message: 'Utilisateur promu administrateur avec succès' 
    };
  } catch (error) {
    console.error('Erreur lors de la promotion:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Erreur: ${error.message}`
    );
  }
});

/**
 * Cloud Function pour réinitialiser le mot de passe
 */
exports.resetUserPassword = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Seuls les administrateurs peuvent réinitialiser les mots de passe'
    );
  }

  const { userId, newPassword } = data;

  if (!userId || !newPassword) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'userId et newPassword sont requis'
    );
  }

  if (newPassword.length < 6) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Le mot de passe doit contenir au moins 6 caractères'
    );
  }

  try {
    await admin.auth().updateUser(userId, { password: newPassword });

    return { 
      success: true, 
      message: 'Mot de passe réinitialisé avec succès' 
    };
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Erreur: ${error.message}`
    );
  }
});





