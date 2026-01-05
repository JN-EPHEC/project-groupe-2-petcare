import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase';

const functions = getFunctions(app);

// Supprimer un utilisateur
export const deleteUserCloud = async (userId: string): Promise<{ success: boolean; message: string }> => {
  const deleteUserFn = httpsCallable(functions, 'deleteUser');
  const result = await deleteUserFn({ userId });
  return result.data as { success: boolean; message: string };
};

// Suspendre un utilisateur
export const suspendUserCloud = async (userId: string): Promise<{ success: boolean; message: string }> => {
  const suspendUserFn = httpsCallable(functions, 'suspendUser');
  const result = await suspendUserFn({ userId });
  return result.data as { success: boolean; message: string };
};

// Activer un utilisateur
export const activateUserCloud = async (userId: string): Promise<{ success: boolean; message: string }> => {
  const activateUserFn = httpsCallable(functions, 'activateUser');
  const result = await activateUserFn({ userId });
  return result.data as { success: boolean; message: string };
};

// Promouvoir en admin
export const promoteToAdminCloud = async (userId: string): Promise<{ success: boolean; message: string }> => {
  const promoteToAdminFn = httpsCallable(functions, 'promoteToAdmin');
  const result = await promoteToAdminFn({ userId });
  return result.data as { success: boolean; message: string };
};

// Réinitialiser le mot de passe
export const resetUserPasswordCloud = async (userId: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const resetPasswordFn = httpsCallable(functions, 'resetUserPassword');
  const result = await resetPasswordFn({ userId, newPassword });
  return result.data as { success: boolean; message: string };
};






