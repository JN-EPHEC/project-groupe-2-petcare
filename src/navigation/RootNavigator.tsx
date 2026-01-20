import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomTabBar } from '../components/CustomTabBar';

// Auth Screens
import { 
  SplashScreen, 
  LoginScreen, 
  SignupChoiceScreen, 
  SignupScreen, 
  VetSignupScreen, 
  EmailConfirmationScreen, 
  ForgotPasswordScreen, 
  EmailVerificationScreen,
  OnboardingWizardScreen,
  VetOnboardingScreen
} from '../screens/auth';

// Home Screens
import { HomeScreen, RemindersScreen, OfflineModeScreen, CalendarScreen } from '../screens/home';

// Profile Screens
import { 
  OwnerProfileScreen, 
  PetProfileScreen,
  NotificationsScreen,
  OwnerNotificationsScreen,
  EditProfileScreen,
  PreferencesScreen,
  AddPetScreen,
  UserProfileDetailScreen
} from '../screens/profile';

// Settings Screens
import { 
  CookieSettingsScreen, 
  PrivacyPolicyScreen, 
  CookiePolicyScreen,
  NotificationSettingsScreen
} from '../screens/settings';

// Notification Screens
import {
  ScheduledNotificationsScreen,
  CreateNotificationScreen,
  EditNotificationScreen
} from '../screens/notifications';

// Health Screens
import { 
  HealthRecordScreen, 
  DocumentsScreen, 
  VaccinationsScreen, 
  AddDocumentScreen,
  PetHealthRecordScreen,
  AddVaccinationScreen,
  EditVaccinationScreen,
  AddTreatmentScreen,
  EditTreatmentScreen,
  AddMedicalHistoryScreen,
  EditMedicalHistoryScreen
} from '../screens/health';

// Emergency Screens
import { EmergencyScreen, EmergencyModeScreen, MapScreen, VetDetailsScreen } from '../screens/emergency';

// Premium Screens
import { 
  PremiumScreen,
  PremiumSuccessScreen,
  PaymentProcessingScreen,
  BlogScreen, 
  BlogArticleScreen,
  WellnessTrackingScreen,
  AddWellnessEntryScreen,
  SharePetScreen,
  SharedPetProfileScreen,
  ManageSubscriptionScreen,
  WeightTrackingScreen
} from '../screens/premium';

// Vet Screens
import { 
  VetDashboardScreen,
  VetProfileScreen,
  EditVetProfileScreen,
  VetAppointmentsScreen,
  VetPatientsScreen,
  VetPatientDetailScreen,
  VetScheduleScreen,
  VetAssignmentRequestsScreen,
  VetNotificationsScreen,
  ManageAppointmentRequestScreen,
} from '../screens/vet';

// Appointment Screens
import {
  RequestAppointmentScreen,
  MyAppointmentsScreen,
  ManageAppointmentsScreen,
} from '../screens/appointments';

// Admin Screens
import {
  AdminDashboardScreen,
  AdminUsersScreen,
  AdminVetsScreen,
  AdminPetsScreen,
  AdminAnalyticsScreen,
  AdminProfileScreen,
} from '../screens/admin';
import { AdminBlogScreen } from '../screens/admin/AdminBlogScreen';

// Import useAuth to check user role
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack Navigator
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="OfflineMode" component={OfflineModeScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="SharePet" component={SharePetScreen} />
      <Stack.Screen name="Blog" component={BlogScreen} />
      <Stack.Screen name="BlogArticle" component={BlogArticleScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="ScheduledNotifications" component={ScheduledNotificationsScreen} />
      <Stack.Screen name="CreateNotification" component={CreateNotificationScreen} />
      <Stack.Screen name="EditNotification" component={EditNotificationScreen} />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerProfile" component={OwnerProfileScreen} />
      <Stack.Screen name="UserProfileDetail" component={UserProfileDetailScreen} />
      <Stack.Screen name="PetProfile" component={PetProfileScreen} />
      <Stack.Screen name="HealthRecord" component={HealthRecordScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="AddDocument" component={AddDocumentScreen} />
      <Stack.Screen name="PetHealthRecord" component={PetHealthRecordScreen} />
      <Stack.Screen name="AddVaccination" component={AddVaccinationScreen} />
      <Stack.Screen name="EditVaccination" component={EditVaccinationScreen} />
      <Stack.Screen name="AddTreatment" component={AddTreatmentScreen} />
      <Stack.Screen name="EditTreatment" component={EditTreatmentScreen} />
      <Stack.Screen name="AddMedicalHistory" component={AddMedicalHistoryScreen} />
      <Stack.Screen name="EditMedicalHistory" component={EditMedicalHistoryScreen} />
      <Stack.Screen name="Notifications" component={OwnerNotificationsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="Vaccinations" component={VaccinationsScreen} />
      <Stack.Screen name="AddPet" component={AddPetScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
      <Stack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} />
      <Stack.Screen name="CookieSettings" component={CookieSettingsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="CookiePolicy" component={CookiePolicyScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="ScheduledNotifications" component={ScheduledNotificationsScreen} />
      <Stack.Screen name="CreateNotification" component={CreateNotificationScreen} />
      <Stack.Screen name="EditNotification" component={EditNotificationScreen} />
      <Stack.Screen name="PremiumSuccess" component={PremiumSuccessScreen} />
      <Stack.Screen name="Blog" component={BlogScreen} />
      <Stack.Screen name="BlogArticle" component={BlogArticleScreen} />
      <Stack.Screen name="WellnessTracking" component={WellnessTrackingScreen} />
      <Stack.Screen name="AddWellnessEntry" component={AddWellnessEntryScreen} />
      <Stack.Screen name="SharePet" component={SharePetScreen} />
      <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
      <Stack.Screen name="WeightTracking" component={WeightTrackingScreen} />
      <Stack.Screen name="RequestAppointment" component={RequestAppointmentScreen} />
      <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
    </Stack.Navigator>
  );
};

// Search/Emergency Stack Navigator
const SearchStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="Emergency" 
        component={EmergencyScreen}
        initialParams={{ isEmergencyMode: false }}
      />
      <Stack.Screen name="EmergencyMode" component={EmergencyModeScreen} />
      <Stack.Screen name="RequestAppointment" component={RequestAppointmentScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="VetDetails" component={VetDetailsScreen} />
    </Stack.Navigator>
  );
};

// Add Tab - Quick Actions Stack
const AddStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AddPetMain" component={AddPetScreen} />
    </Stack.Navigator>
  );
};

// ============ VET NAVIGATORS ============

// Vet Dashboard Stack
const VetDashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VetDashboard" component={VetDashboardScreen} />
      <Stack.Screen name="VetAppointments" component={VetAppointmentsScreen} />
      <Stack.Screen name="ManageAppointments" component={ManageAppointmentsScreen} />
      <Stack.Screen name="ManageAppointmentRequest" component={ManageAppointmentRequestScreen} />
      <Stack.Screen name="VetPatients" component={VetPatientsScreen} />
      <Stack.Screen name="VetPatientDetail" component={VetPatientDetailScreen} />
      <Stack.Screen name="AddVaccination" component={AddVaccinationScreen} />
      <Stack.Screen name="AddTreatment" component={AddTreatmentScreen} />
      <Stack.Screen name="AddMedicalHistory" component={AddMedicalHistoryScreen} />
      <Stack.Screen name="EditVaccination" component={EditVaccinationScreen} />
      <Stack.Screen name="EditTreatment" component={EditTreatmentScreen} />
      <Stack.Screen name="EditMedicalHistory" component={EditMedicalHistoryScreen} />
      <Stack.Screen name="VetSchedule" component={VetScheduleScreen} />
      <Stack.Screen name="VetAssignmentRequests" component={VetAssignmentRequestsScreen} />
      <Stack.Screen name="VetNotifications" component={VetNotificationsScreen} />
      <Stack.Screen name="VetProfile" component={VetProfileScreen} />
      <Stack.Screen name="EditVetProfile" component={EditVetProfileScreen} options={{ title: 'Modifier le profil' }} />
      <Stack.Screen name="CookieSettings" component={CookieSettingsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="CookiePolicy" component={CookiePolicyScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="ScheduledNotifications" component={ScheduledNotificationsScreen} />
      <Stack.Screen name="CreateNotification" component={CreateNotificationScreen} />
      <Stack.Screen name="EditNotification" component={EditNotificationScreen} />
    </Stack.Navigator>
  );
};

// Vet Appointments Stack (for tab)
const VetAppointmentsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VetAppointmentsList" component={VetAppointmentsScreen} />
    </Stack.Navigator>
  );
};

// Vet Patients Stack (for tab)
const VetPatientsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VetPatientsList" component={VetPatientsScreen} />
      <Stack.Screen name="VetPatientDetail" component={VetPatientDetailScreen} />
      <Stack.Screen name="AddVaccination" component={AddVaccinationScreen} />
      <Stack.Screen name="AddTreatment" component={AddTreatmentScreen} />
      <Stack.Screen name="AddMedicalHistory" component={AddMedicalHistoryScreen} />
      <Stack.Screen name="EditVaccination" component={EditVaccinationScreen} />
      <Stack.Screen name="EditTreatment" component={EditTreatmentScreen} />
      <Stack.Screen name="EditMedicalHistory" component={EditMedicalHistoryScreen} />
    </Stack.Navigator>
  );
};

// Vet Profile Stack (for tab)
const VetProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VetProfileMain" component={VetProfileScreen} />
      <Stack.Screen name="EditVetProfile" component={EditVetProfileScreen} options={{ title: 'Modifier le profil' }} />
      <Stack.Screen name="ManageAppointments" component={ManageAppointmentsScreen} />
      <Stack.Screen name="VetSchedule" component={VetScheduleScreen} />
      <Stack.Screen name="VetNotifications" component={VetNotificationsScreen} />
      <Stack.Screen name="CookieSettings" component={CookieSettingsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="CookiePolicy" component={CookiePolicyScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="ScheduledNotifications" component={ScheduledNotificationsScreen} />
      <Stack.Screen name="CreateNotification" component={CreateNotificationScreen} />
      <Stack.Screen name="EditNotification" component={EditNotificationScreen} />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator for VET
const VetTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={VetDashboardStack} />
      <Tab.Screen name="AddTab" component={VetAppointmentsStack} />
      <Tab.Screen name="SearchTab" component={VetPatientsStack} />
      <Tab.Screen name="ProfileTab" component={VetProfileStack} />
    </Tab.Navigator>
  );
};

// ============ ADMIN NAVIGATORS ============

// Admin Dashboard Stack
const AdminDashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminVets" component={AdminVetsScreen} />
      <Stack.Screen name="AdminPets" component={AdminPetsScreen} />
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
      <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
      <Stack.Screen name="AdminBlog" component={AdminBlogScreen} />
    </Stack.Navigator>
  );
};

// Admin Users Stack (for tab)
const AdminUsersStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminUsersList" component={AdminUsersScreen} />
    </Stack.Navigator>
  );
};

// Admin Vets Stack (for tab)
const AdminVetsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminVetsList" component={AdminVetsScreen} />
    </Stack.Navigator>
  );
};

// Admin Profile Stack (for tab)
const AdminProfileStackTab = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminProfileMain" component={AdminProfileScreen} />
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
    </Stack.Navigator>
  );
};

// Bottom Tab Navigator for ADMIN
const AdminTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={AdminDashboardStack} />
      <Tab.Screen name="AddTab" component={AdminUsersStack} />
      <Tab.Screen name="SearchTab" component={AdminVetsStack} />
      <Tab.Screen name="ProfileTab" component={AdminProfileStackTab} />
    </Tab.Navigator>
  );
};

// Bottom Tab Navigator for OWNER
const OwnerTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="AddTab" component={AddStack} />
      <Tab.Screen name="SearchTab" component={SearchStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
};

// Main Tabs Router - decides which tabs to show based on user role
const MainTabs = () => {
  const { user } = useAuth();
  
  // If user is an admin, show admin interface
  if (user?.role === 'admin') {
    return <AdminTabs />;
  }
  
  // If user is a vet, show vet interface
  if (user?.role === 'vet') {
    return <VetTabs />;
  }
  
  // Otherwise, show owner interface
  return <OwnerTabs />;
};

// Root Navigator
const RootNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignupChoice" component={SignupChoiceScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="VetSignup" component={VetSignupScreen} />
      <Stack.Screen name="OnboardingWizard" component={OnboardingWizardScreen} />
      <Stack.Screen name="VetOnboarding" component={VetOnboardingScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="EmailConfirmation" component={EmailConfirmationScreen} />
      <Stack.Screen name="SharedPetProfile" component={SharedPetProfileScreen} />
      <Stack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} />
      <Stack.Screen name="PremiumSuccess" component={PremiumSuccessScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="CookiePolicy" component={CookiePolicyScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
};

export default RootNavigator;

