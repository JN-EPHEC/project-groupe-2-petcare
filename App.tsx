import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import './src/i18n/config';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

// Import CSS pour le fix du scroll sur web
if (Platform.OS === 'web') {
  require('./web-styles.css');
}

export default function App() {
  const navigationRef = React.useRef<any>(null);
  const [hasCheckedPayment, setHasCheckedPayment] = React.useState(false);

  // Vérifier si on revient d'un paiement Stripe
  React.useEffect(() => {
    if (hasCheckedPayment) return;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const stripePaymentSuccess = urlParams.get('stripe_payment_success');
      
      if (stripePaymentSuccess === 'true') {
        const paymentAlreadyProcessed = localStorage.getItem('payment_processed_session');
        
        if (!paymentAlreadyProcessed) {
          console.log("💳 Détection NOUVEAU paiement Stripe - navigation vers PaymentProcessing");
          
          // Marquer ce paiement comme traité
          const sessionId = Date.now().toString();
          localStorage.setItem('payment_processed_session', sessionId);
          
          // Nettoyer l'URL
          window.history.replaceState({}, '', window.location.pathname);
          
          // Naviguer vers PaymentProcessing
          setTimeout(() => {
            if (navigationRef.current) {
              navigationRef.current.navigate('PaymentProcessing');
            }
          }, 100);
        } else {
          console.log("✅ Paiement déjà traité - navigation normale");
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }
    
    setHasCheckedPayment(true);
  }, [hasCheckedPayment]);

  return (
    <LanguageProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </LanguageProvider>
  );
}

