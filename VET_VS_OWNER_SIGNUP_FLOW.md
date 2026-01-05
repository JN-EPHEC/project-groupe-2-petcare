# Vet vs Owner Signup Flow Comparison

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOGIN SCREEN                                 │
│                                                                      │
│  [Login]  [Sign Up] ←──────────────────────────────────────────┐   │
└─────────────────────────────────────────────────────────────────┼───┘
                                                                   │
                                                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    OWNER SIGNUP SCREEN                               │
│                                                                      │
│  Personal Info: First Name, Last Name, Email, Phone, Location       │
│  Security: Password, Confirm Password                                │
│                                                                      │
│  [Create Account as Pet Owner] ──────────┐                          │
│                                           │                          │
│  ─────────────── OR ──────────────        │                          │
│                                           │                          │
│  ┌─────────────────────────────────┐     │                          │
│  │  🩺  Vous êtes vétérinaire ?   │     │                          │
│  │  Click here for vet signup  →  │─────┼────────────┐             │
│  └─────────────────────────────────┘     │            │             │
└──────────────────────────────────────────┼────────────┼─────────────┘
                                           │            │
                    ┌──────────────────────┘            │
                    ▼                                   ▼
    ┌───────────────────────────────┐   ┌───────────────────────────────┐
    │   EMAIL VERIFICATION          │   │    VET SIGNUP SCREEN          │
    │                               │   │                               │
    │   Role: owner                 │   │  Personal Info:               │
    │   Approved: N/A (auto)        │   │   - First Name, Last Name     │
    │                               │   │   - Email, Phone, Location    │
    │   ✅ Can login immediately    │   │                               │
    │      after verification       │   │  Professional Info:           │
    │                               │   │   - Specialty                 │
    │                               │   │   - Clinic Name               │
    │                               │   │   - Clinic Address            │
    │                               │   │   - Experience                │
    │                               │   │   - License Number (opt)      │
    │                               │   │                               │
    │                               │   │  Security: Password, Confirm  │
    │                               │   │                               │
    │                               │   │  [Create Vet Account]         │
    └───────────────┬───────────────┘   └───────────────┬───────────────┘
                    │                                   │
                    │                                   ▼
                    │                   ┌───────────────────────────────┐
                    │                   │   EMAIL VERIFICATION          │
                    │                   │                               │
                    │                   │   Role: vet                   │
                    │                   │   Approved: false             │
                    │                   │                               │
                    │                   │   ⏳ PENDING ADMIN APPROVAL   │
                    │                   │                               │
                    │                   │   ❌ Cannot login yet         │
                    │                   └───────────────┬───────────────┘
                    │                                   │
                    │                                   ▼
                    │                   ┌───────────────────────────────┐
                    │                   │   ADMIN APPROVAL              │
                    │                   │                               │
                    │                   │   Admin sees pending vet      │
                    │                   │   in AdminVetsScreen          │
                    │                   │                               │
                    │                   │   [Approve] or [Reject]       │
                    │                   └───────────────┬───────────────┘
                    │                                   │
                    │                                   │ (If approved)
                    │                                   │
                    │                                   ▼
                    │                   ┌───────────────────────────────┐
                    │                   │   APPROVED VET                │
                    │                   │                               │
                    │                   │   Approved: true              │
                    │                   │                               │
                    │                   │   ✅ Can now login            │
                    │                   └───────────────┬───────────────┘
                    │                                   │
                    └───────────────┬───────────────────┘
                                    ▼
                    ┌───────────────────────────────┐
                    │       LOGIN                   │
                    │                               │
                    │   Enter email & password      │
                    └───────────────┬───────────────┘
                                    ▼
                ┌───────────────────┴────────────────────┐
                │                                         │
                ▼                                         ▼
    ┌──────────────────────┐              ┌──────────────────────┐
    │  OWNER DASHBOARD     │              │  VET DASHBOARD       │
    │                      │              │                      │
    │  - Home              │              │  - Appointments      │
    │  - Pets              │              │  - Patients          │
    │  - Appointments      │              │  - Schedule          │
    │  - Health Records    │              │  - Profile           │
    │  - Profile           │              │                      │
    └──────────────────────┘              └──────────────────────┘
```

---

## Key Differences Table

| Aspect | Owner Signup | Vet Signup |
|--------|-------------|------------|
| **Entry Point** | Signup button | "Vous êtes vétérinaire?" on owner signup |
| **Screen** | `SignupScreen.tsx` | `VetSignupScreen.tsx` |
| **Function** | `signUp()` | `signUpVet()` |
| **Fields Required** | 5 fields | 10 fields |
| **Role in DB** | `'owner'` | `'vet'` |
| **Approval Status** | N/A (automatic) | `approved: false` |
| **Display Name** | "FirstName LastName" | "Dr. FirstName LastName" |
| **Email Verification** | ✅ Required | ✅ Required |
| **Admin Approval** | ❌ Not needed | ✅ Required |
| **Can Login After Signup** | ✅ Yes (after email verification) | ❌ No (needs admin approval first) |
| **Dashboard** | OwnerTabs | VetTabs |
| **Avatar Color** | Blue | Navy/Professional |

---

## Code Structure

```
src/
├── services/
│   └── firebaseAuth.ts
│       ├── signUp()           ← Owner signup
│       └── signUpVet()        ← Vet signup (NEW)
│
├── context/
│   └── AuthContext.tsx
│       ├── signUp()
│       └── signUpVet()        ← Added to context
│
├── screens/
│   └── auth/
│       ├── SignupScreen.tsx       ← Updated with vet signup link
│       ├── VetSignupScreen.tsx    ← NEW
│       └── index.ts               ← Exports VetSignupScreen
│
└── navigation/
    └── RootNavigator.tsx          ← Added VetSignup route
```

---

## Database Comparison

### Owner Document:
```json
{
  "id": "abc123",
  "email": "owner@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "owner",
  "phone": "+32 123 456 789",
  "location": "Brussels",
  "avatarUrl": "https://ui-avatars.com/api/..."
}
```

### Vet Document:
```json
{
  "id": "xyz789",
  "email": "dr.smith@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "vet",
  "phone": "+32 987 654 321",
  "location": "Brussels",
  "specialty": "General Medicine",
  "clinicName": "PetCare Clinic",
  "clinicAddress": "123 Main St, Brussels",
  "experience": "5",
  "licenseNumber": "VET-12345",
  "approved": false,
  "rating": 0,
  "avatarUrl": "https://ui-avatars.com/api/..."
}
```

---

## Authentication Flow Comparison

### Owner Flow:
```
1. Fill signup form (5 fields)
2. Submit → Firebase Auth creates user
3. Email verification sent
4. User document created with role: 'owner'
5. Redirect to EmailVerificationScreen
6. Verify email
7. ✅ Login → Owner Dashboard
```

### Vet Flow:
```
1. Navigate to owner signup
2. Click "Vous êtes vétérinaire?"
3. Fill vet signup form (10 fields)
4. Submit → Firebase Auth creates user
5. Email verification sent
6. User document created with role: 'vet', approved: false
7. Redirect to EmailVerificationScreen with pending message
8. Verify email
9. ⏳ Wait for admin approval
10. Admin approves in AdminVetsScreen
11. approved: true
12. ✅ Login → Vet Dashboard
```

---

## UI/UX Differences

### Owner Signup:
- Simple, clean form
- Focus on getting started quickly
- 5 essential fields
- Blue/teal color scheme
- Friendly, welcoming tone

### Vet Signup:
- Professional, detailed form
- Emphasis on credentials and verification
- 10 comprehensive fields
- Navy/medical color scheme
- Professional, trustworthy tone
- Info box about approval process
- Medical icon (🩺) throughout

---

## Security Comparison

| Security Feature | Owner | Vet |
|-----------------|-------|-----|
| Email Verification | ✅ | ✅ |
| Password Strength | ✅ | ✅ |
| Admin Approval | ❌ | ✅ |
| Professional Info Required | ❌ | ✅ |
| License Verification | ❌ | ⚠️ (optional) |
| Immediate Access | ✅ | ❌ |

---

## Testing Checklist

### Test Owner Signup:
- [ ] Fill form with valid data
- [ ] Submit successfully
- [ ] Receive verification email
- [ ] Verify email
- [ ] Login successfully
- [ ] See owner dashboard

### Test Vet Signup:
- [ ] Navigate from owner signup
- [ ] Fill form with valid vet data
- [ ] Submit successfully
- [ ] Receive verification email
- [ ] Try to login (should fail/pending)
- [ ] Login as admin
- [ ] Approve vet in AdminVetsScreen
- [ ] Logout and login as vet
- [ ] See vet dashboard

---

## Conclusion

The app now supports **two distinct signup flows**:

1. **Pet Owners** → Quick, simple registration with immediate access
2. **Veterinarians** → Detailed professional registration with admin approval

Both flows use Firebase Authentication and Firestore, but the vet flow includes additional professional information and a mandatory approval step to ensure platform quality and security.







