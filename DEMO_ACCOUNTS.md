# 🎭 Demo Accounts - PetCare+

The app now includes a **fully functional demo authentication system** with dummy data. You can test the entire app without connecting to Firebase!

---

## 🔑 Demo Login Credentials

### 1. Admin Account (Pet Owner)
**Best for full feature testing**

- **Email**: `admin@petcare.com`
- **Password**: `admin123`
- **Role**: Pet Owner
- **Pet**: kitty (7 years old cat, 6kg)
- **Data Includes**:
  - ✅ 3 Health records (vaccines, treatments, vermifuge)
  - ✅ 4 Documents (PDFs)
  - ✅ Past and upcoming reminders
  - ✅ Full profile information

### 2. Pet Owner Account
**Alternative pet owner with different data**

- **Email**: `charles@example.com`
- **Password**: `demo123`
- **Role**: Pet Owner
- **Pet**: Max (3 years old dog, 28kg)
- **Data Includes**:
  - ✅ 2 Health records (vaccine, surgery)
  - ✅ Full profile information

### 3. Veterinarian Account
**For vet role testing (future features)**

- **Email**: `vet@petcare.com`
- **Password**: `vet123`
- **Role**: Veterinarian
- **Data**: Dr. Christine Hartono profile

---

## 🚀 How to Use Demo Accounts

### Method 1: Quick Fill Buttons (Easiest)

1. Start the app and navigate to **Login Screen**
2. You'll see three buttons below the form:
   - 🔵 **Admin** - Fills admin credentials
   - 🔵 **Owner** - Fills charles@example.com credentials
   - 🔵 **Vet** - Fills vet credentials
3. Click any button to auto-fill the email and password
4. Click "Sign in"

### Method 2: Manual Entry

1. Navigate to **Login Screen**
2. Enter one of the email/password combinations above
3. Click "Sign in"

### Method 3: Sign Up

You can also create a new account:
1. Click "Sign up" on Login Screen
2. Fill in the registration form
3. Your account will be saved to the demo database
4. You'll be logged in automatically

---

## 📊 What's Included in Demo Data

### For Admin Account (admin@petcare.com):

#### Pet Profile - kitty 🐱
- Male, 7 years old, 6kg
- Location: wavre
- Species: European Shorthair

#### Health Records
1. **Vaccine** - Rabies Vaccine (2025-06-08)
   - Veterinarian: Dr. Christine
2. **Treatment** - Antibiotics for ear infection (2025-03-15)
   - 10-day course completed
3. **Vermifuge** - Deworming Treatment (2025-08-10)
   - Regular schedule

#### Documents
- PDF 1 - Vaccination Certificate
- PDF 2 - Medical History
- PDF 3 - Insurance Card
- PDF 4 - Pedigree Certificate

#### Reminders
- **Past**: Vaccine (June 2025), Vermifuge (August 2025)
- **Upcoming**: Vaccine (June 2026), Vermifuge (August 2026)

### For Owner Account (charles@example.com):

#### Pet Profile - Max 🐕
- Male, 3 years old, 28kg
- Location: Bruxelles
- Species: Golden Retriever

#### Health Records
1. **Vaccine** - DHPP Vaccine (2025-07-20)
2. **Surgery** - Neutering (2024-11-05)

### Veterinarians Database
All accounts can see these vets in the Emergency section:
1. **drh. Ariyo Hartono** - Veterinary Dentist (Bierges, 1.8 KM)
2. **drh. Christine** - General Veterinary (Limal, 2.1 KM)
3. **drh. Ariyo Hartono** - Veterinary Dentist (Bierges, 1.8 KM)
4. **drh. Christine** - General Veterinary (Wavre, 2.1 KM)

---

## ✨ Features Working with Demo Data

### ✅ Authentication
- Login with demo accounts
- Signup creates new accounts
- Logout functionality
- Password validation
- Error handling

### ✅ Personalization
- User's name appears on Home screen
- Dynamic greeting (Good Morning/Afternoon/Evening)
- Pet information loads automatically
- Profile shows correct user data

### ✅ Health Records
- View all health records for current pet
- Organized by category (Vaccines, Treatments, Surgeries, etc.)
- Shows veterinarian names
- Displays dates and descriptions

### ✅ Documents
- List of documents for current pet
- Shows upload dates
- Displays document names

### ✅ Reminders
- Past and upcoming reminders
- Organized by month
- Linked to current pet

### ✅ Emergency/Vet Finder
- List of nearby veterinarians
- Click call button to dial (on mobile)
- Shows specialties and distances

### ✅ Profile Management
- View and edit owner profile
- View pet profile with details
- Logout from settings (tap 🚪 icon)

---

## 🔄 Demo vs. Firebase

### Current Demo System:
- ✅ Works completely offline
- ✅ Data stored in memory (resets on app refresh)
- ✅ Perfect for testing and demos
- ✅ No setup required
- ✅ Multiple accounts ready to use

### Future Firebase Integration:
When you're ready to connect Firebase:
1. Keep the demo system for development
2. Add a toggle to switch between demo and Firebase
3. Use the same data structure
4. Migrate demo accounts to Firebase

---

## 🎯 Testing Scenarios

### Scenario 1: New Pet Owner Journey
1. Login as Admin
2. View pet profile (kitty)
3. Check health records
4. Review upcoming reminders
5. Find nearby vets in Emergency

### Scenario 2: Document Management
1. Login as Admin
2. Go to Profile → Mon animal → Mes documents
3. View all 4 PDFs with upload dates

### Scenario 3: Health Tracking
1. Login as Admin
2. Go to Profile → Mon animal → Mon carnet de santé
3. See complete medical history organized by category

### Scenario 4: Emergency Vet Search
1. Login as any account
2. Go to Search tab (magnifying glass) or Home → Emergencies
3. See list of nearby vets
4. Try calling a vet (on mobile devices)

### Scenario 5: Multi-Pet Testing
1. Login as Admin (has kitty 🐱)
2. Logout
3. Login as charles@example.com (has Max 🐕)
4. Notice different pet data loads

---

## 🛠️ Technical Details

### Demo Service Location
`/src/services/demoAuth.ts`

### Auth Context
`/src/context/AuthContext.tsx`

### Data Structures
```typescript
DEMO_USERS       // 3 users (admin, owner, vet)
DEMO_PETS        // 2 pets (kitty, Max)
DEMO_HEALTH_RECORDS  // 5 health records
DEMO_DOCUMENTS   // 4 documents
DEMO_REMINDERS   // 4 reminders
DEMO_VETS        // 4 veterinarians
```

### Adding New Demo Data
To add more demo data, edit `/src/services/demoAuth.ts`:

```typescript
// Add a new user
DEMO_USERS.push({
  id: 'owner-3',
  email: 'newuser@example.com',
  password: 'demo123',
  role: 'owner',
  firstName: 'Jane',
  lastName: 'Smith',
  phone: '+32 2 xxx xxxx',
  location: 'Brussels',
  petId: 'pet-3',
});

// Add a new pet
DEMO_PETS.push({
  id: 'pet-3',
  name: 'Buddy',
  species: 'Chien',
  breed: 'Labrador',
  age: 5,
  weight: 30,
  gender: 'Male',
  location: 'Brussels',
  ownerId: 'owner-3',
  imageEmoji: '🐕',
});
```

---

## 💡 Tips

1. **Quick Login**: Use the demo buttons (Admin/Owner/Vet) for fastest testing
2. **Different Data**: Switch between accounts to see different pets and data
3. **Logout**: Tap the 🚪 icon on Profile screen → Settings
4. **Phone Calls**: Vet call buttons work on real devices
5. **Persistence**: Demo data resets when you reload the app (by design)

---

## 📱 Demo Flow Example

```
1. Open app → Splash Screen
2. Click "Pet owner" button
3. On Login Screen, click "Admin" button
4. Click "Sign in"
5. See Home with "Hi John, Good Morning!"
6. Click "Reminders" → See kitty's reminders
7. Go to Profile tab → Click "Mon animal"
8. See kitty's profile (7 ans, 6kg)
9. Click "Mon carnet de santé"
10. See 3 health records with details
11. Go back → Click "Mes documents"
12. See 4 PDF documents
13. Go to Search tab
14. See 4 nearby vets
15. Click call button to test
```

---

## 🎉 Ready to Demo!

You now have **3 fully functional demo accounts** with complete data. No Firebase setup required!

**Quick Start**: 
1. `npm start`
2. Press `w` for web
3. Click "Pet owner" on Splash
4. Click "Admin" button on Login
5. Click "Sign in"
6. **You're in!** 🎉

Enjoy testing PetCare+ with realistic demo data!

