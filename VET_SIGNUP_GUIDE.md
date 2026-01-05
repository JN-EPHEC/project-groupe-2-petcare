# Veterinary Signup Guide

## Overview

The PetCare+ app now has a **dedicated veterinary signup flow** that's separate from the pet owner registration. Veterinarians can register themselves, and their accounts require admin approval before they can access the platform.

---

## What Was Implemented

### 1. **New Firebase Authentication Function: `signUpVet`**

Location: `src/services/firebaseAuth.ts`

This function creates veterinary accounts with the following features:
- **Role**: Automatically set to `'vet'`
- **Approval Status**: Set to `false` (requires admin approval)
- **Additional Fields**: Specialty, clinic name, clinic address, experience, license number
- **Display Name**: Prefixed with "Dr." automatically
- **Email Verification**: Sends verification email just like owner signup

```typescript
await signUpVet({
  firstName: 'John',
  lastName: 'Smith',
  email: 'dr.smith@vetclinic.com',
  phone: '+32 123 456 789',
  location: 'Brussels',
  specialty: 'General Medicine',
  clinicName: 'PetCare Clinic Brussels',
  clinicAddress: '123 Main Street, Brussels',
  experience: '5',
  licenseNumber: 'VET-12345', // Optional
  password: 'securePassword123',
});
```

---

### 2. **VetSignupScreen**

Location: `src/screens/auth/VetSignupScreen.tsx`

A dedicated signup screen for veterinarians with:

#### Form Sections:
1. **Personal Information**
   - First Name
   - Last Name
   - Email (professional)
   - Phone
   - Location/City

2. **Professional Information**
   - Specialty (e.g., General Medicine, Surgery, Dermatology)
   - Clinic Name
   - Clinic Address
   - Years of Experience
   - License Number (optional)

3. **Security**
   - Password (with strength indicator)
   - Confirm Password

#### Features:
- ✅ Real-time validation for all fields
- ✅ Password strength indicator
- ✅ Professional UI with medical icon
- ✅ Info box explaining admin approval requirement
- ✅ Error handling with Firebase error messages
- ✅ Back button to return to owner signup
- ✅ Link to login screen

---

### 3. **Updated Owner SignupScreen**

Location: `src/screens/auth/SignupScreen.tsx`

Added a prominent section to navigate to veterinary signup:

```
┌─────────────────────────────────────┐
│  [Owner Signup Form]                │
│                                     │
│  ─────────── OU ───────────         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  🩺  Vous êtes vétérinaire ?  │ │
│  │  Inscrivez-vous en tant que   │ │
│  │  professionnel            →   │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### 4. **Updated AuthContext**

Location: `src/context/AuthContext.tsx`

Added `signUpVet` function to the context:

```typescript
const { signUpVet } = useAuth();

await signUpVet({
  // ... vet data
});
```

---

### 5. **Updated Navigation**

Location: `src/navigation/RootNavigator.tsx`

Added the VetSignup route:

```typescript
<Stack.Screen name="VetSignup" component={VetSignupScreen} />
```

---

## User Flow

### For Veterinarians:

1. **Navigate to Signup**
   - User opens the app and clicks "Sign Up"

2. **Choose Veterinary Signup**
   - On the owner signup screen, tap "Vous êtes vétérinaire ?" box
   - Navigate to VetSignupScreen

3. **Fill Out Registration Form**
   - Enter personal information
   - Enter professional details (clinic, specialty, etc.)
   - Create password

4. **Submit Registration**
   - Account is created with `role: 'vet'` and `approved: false`
   - Email verification is sent
   - Redirected to EmailVerification screen with custom message

5. **Wait for Approval**
   - Vet receives confirmation that their account is pending approval
   - Admin must approve the account before vet can log in

6. **Admin Approval**
   - Admin sees the pending vet in AdminVetsScreen
   - Admin approves the vet account
   - `approved` field is set to `true`

7. **Login**
   - Vet can now login and access the vet dashboard

---

## Database Structure

### User Document for Veterinarian:

```javascript
{
  id: "auto-generated-uid",
  email: "dr.smith@example.com",
  firstName: "John",
  lastName: "Smith",
  role: "vet", // ← Automatically set
  phone: "+32 123 456 789",
  location: "Brussels",
  specialty: "General Medicine",
  clinicName: "PetCare Clinic Brussels",
  clinicAddress: "123 Main Street, Brussels",
  experience: "5",
  licenseNumber: "VET-12345",
  approved: false, // ← Requires admin approval
  rating: 0,
  avatarUrl: "https://ui-avatars.com/api/...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Key Differences: Owner vs Vet Signup

| Feature | Owner Signup | Vet Signup |
|---------|-------------|------------|
| **Function** | `signUp()` | `signUpVet()` |
| **Role** | `'owner'` | `'vet'` |
| **Approval Required** | ❌ No | ✅ Yes |
| **Additional Fields** | None | Specialty, Clinic Info, Experience, License |
| **Display Name** | "FirstName LastName" | "Dr. FirstName LastName" |
| **Can Login Immediately** | ✅ Yes (after email verification) | ❌ No (needs admin approval) |

---

## Testing

### Test Veterinary Signup:

1. **Start the app**
   ```bash
   npm start
   ```

2. **Navigate to Signup**
   - Tap "Sign Up" on login screen

3. **Choose Vet Signup**
   - Tap "Vous êtes vétérinaire ?" box

4. **Fill out form with test data:**
   - First Name: `Test`
   - Last Name: `Veterinarian`
   - Email: `test.vet@example.com`
   - Phone: `+32 123 456 789`
   - Location: `Brussels`
   - Specialty: `General Medicine`
   - Clinic Name: `Test Vet Clinic`
   - Clinic Address: `123 Test Street`
   - Experience: `5`
   - License: `VET-TEST-001`
   - Password: `TestPass123!`

5. **Submit and verify:**
   - Check Firestore for new user with `role: 'vet'` and `approved: false`
   - Verify email verification email was sent
   - Try logging in (should fail or show "pending approval" message)

6. **Approve the vet (as admin):**
   - Login as admin (admin@petcare.com / admin123)
   - Go to Admin → Vets
   - Find pending vet and approve

7. **Login as vet:**
   - Now the vet can login successfully
   - Should see VetDashboardScreen

---

## Admin Approval Process

The admin approval system already exists in the codebase:

### Functions (in `src/services/firestoreService.ts`):
- `getPendingVets()` - Get all vets with `approved: false`
- `approveVet(vetId)` - Set `approved: true`
- `rejectVet(vetId, reason)` - Reject with reason

### Screen:
- `AdminVetsScreen` - Shows all vets with approve/reject actions

---

## Security Notes

🔒 **Important Security Considerations:**

1. **Approval Required**: Vets cannot access the platform until an admin approves them
2. **Email Verification**: Vets must verify their email address
3. **Professional Information**: Required fields ensure only legitimate vets can register
4. **License Number**: Optional but recommended for verification
5. **Admin Control**: Admins can approve/reject vet registrations

---

## Future Enhancements

Consider adding:
- [ ] Document upload for license verification
- [ ] Professional certification upload
- [ ] Automatic email to admins when new vet registers
- [ ] Notification to vet when approved/rejected
- [ ] Multi-step registration wizard
- [ ] Clinic photo upload
- [ ] Operating hours selection

---

## Troubleshooting

### Issue: "Vet can't login after signup"
**Solution**: This is expected! Vet accounts need admin approval first.

### Issue: "VetSignup screen not found"
**Solution**: Make sure navigation is properly updated and app is restarted.

### Issue: "signUpVet is not a function"
**Solution**: Ensure AuthContext is properly updated and exported.

### Issue: "Firestore permission denied"
**Solution**: Check firestore.rules to ensure users can create their own documents.

---

## Summary

✅ Veterinarians can now register themselves through a dedicated signup flow
✅ Vet accounts are created with `role: 'vet'` and `approved: false`
✅ Admin approval is required before vets can access the platform
✅ All vet-specific information (clinic, specialty, etc.) is captured during registration
✅ The system is secure and prevents unauthorized access

---

**Need Help?**
Check the following files for reference:
- `src/services/firebaseAuth.ts` - Auth functions
- `src/screens/auth/VetSignupScreen.tsx` - Vet signup UI
- `src/context/AuthContext.tsx` - Auth context
- `src/navigation/RootNavigator.tsx` - Navigation setup







