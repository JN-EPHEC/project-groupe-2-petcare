# PetCare+ Mobile App

A React Native mobile application for pet care management, built with Expo and TypeScript.

## 🎭 Demo Accounts Available!

**You can now test the app with fully functional demo accounts - no Firebase needed!**

### Quick Start with Demo:
1. Run `npm start` and press `w`
2. Click "Pet owner" on Splash screen
3. Click "**Admin**" button on Login screen (auto-fills credentials)
4. Click "Sign in"
5. **You're in with full demo data!** 🎉

See **[DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md)** for all demo credentials and features.

## Features

- **Authentication**: Splash screen, Login, and Signup flows with working demo accounts
- **Home Dashboard**: Quick access to reminders, medical history, offline mode, and emergencies
- **Profile Management**: Manage owner and pet profiles with real data
- **Health Records**: Track vaccinations, treatments, surgeries, and medical history
- **Documents**: Store and manage pet-related documents
- **Emergency Services**: Find nearby veterinarians with contact information (clickable call buttons)

## Tech Stack

- **Expo** (React Native framework)
- **React Navigation** (Bottom tabs + Stack navigation)
- **TypeScript**
- **Demo Authentication System** (Working authentication with dummy data)
- **Firebase Placeholders** (Ready for Firebase integration)

## Color Scheme

- Navy: #3F3D7C
- Teal: #1BA9B5
- Light Blue: #B3E5E8

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

Dependencies are already installed! Just run:

```bash
npm start
```

### Running the App

#### Web (Recommended for development):
```bash
npm start
```
Then press `w` to open in web browser with mobile viewport.

#### Demo Login:
On the login screen, use the quick-fill buttons:
- **Admin** button → `admin@petcare.com` / `admin123`
- **Owner** button → `charles@example.com` / `demo123`
- **Vet** button → `vet@petcare.com` / `vet123`

#### iOS Simulator:
```bash
npm run ios
```

#### Android Emulator:
```bash
npm run android
```

## Project Structure

```
/src
  /screens
    /auth          - Splash, Login, Signup screens
    /home          - Home, Reminders screens
    /profile       - Owner and Pet profile screens
    /health        - Health records, Documents screens
    /emergency     - Emergency vet list screen
  /components      - Reusable components (Button, Input, CustomTabBar)
  /navigation      - Navigation configuration
  /services        - Firebase placeholder services
  /theme           - Colors, spacing, typography configuration
```

## Firebase Integration

The app includes Firebase placeholder functions in `/src/services/firebase.ts`. To integrate with Firebase:

1. Install Firebase SDK:
```bash
npm install firebase
```

2. Create a Firebase project at https://console.firebase.google.com

3. Add your Firebase configuration to `/src/services/firebase.ts`

4. Replace placeholder functions with actual Firebase SDK calls:
   - `firebaseAuth.signIn()` → Firebase Authentication
   - `firebaseAuth.signUp()` → Firebase Authentication
   - `firebaseFirestore.getUserProfile()` → Firestore queries
   - `firebaseStorage.uploadDocument()` → Firebase Storage

## Navigation Flow

```
Splash Screen
  ↓
Login / Signup
  ↓
Main App (Bottom Tabs)
  ├── Home Tab
  │   ├── Home Screen
  │   └── Reminders Screen
  ├── Add Tab (Location Pin - Placeholder)
  ├── Search Tab
  │   └── Emergency/Vet Finder
  └── Profile Tab
      ├── Owner Profile
      ├── Pet Profile
      ├── Health Records
      └── Documents
```

## Customization

### Adding Images

Replace placeholder images with actual assets:
- Logo: `/logo.jpeg` (already present)
- Pet images: Add to `/assets/` folder
- User avatars: Add to `/assets/` folder

### Modifying Colors

Edit color scheme in `/src/theme/colors.ts`

### Adding New Screens

1. Create screen component in appropriate `/src/screens/` folder
2. Add to navigation in `/src/navigation/RootNavigator.tsx`

## Development Notes

- The app uses custom tab bar with a centered location pin button
- All forms include placeholder text matching the design mockups
- Firebase integration is ready but not yet connected
- Map integration for vet locations is prepared as a placeholder

## License

Private project for Soumiya's PetCare+

