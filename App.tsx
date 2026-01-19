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
    console.log("🔍 [App.tsx] useEffect - hasCheckedPayment:", hasCheckedPayment);
    
    if (hasCheckedPayment) {
      console.log("⏭️ [App.tsx] Paiement déjà vérifié, skip");
      return;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const stripePaymentSuccess = urlParams.get('stripe_payment_success');
      const stripePaymentCanceled = urlParams.get('stripe_payment_canceled');
      
      console.log("🔍 [App.tsx] URL actuelle:", window.location.href);
      console.log("🔍 [App.tsx] stripe_payment_success:", stripePaymentSuccess);
      console.log("🔍 [App.tsx] stripe_payment_canceled:", stripePaymentCanceled);
      
      if (stripePaymentSuccess === 'true') {
        const paymentAlreadyProcessed = localStorage.getItem('payment_processed_session');
        console.log("🔍 [App.tsx] payment_processed_session:", paymentAlreadyProcessed);
        
        if (!paymentAlreadyProcessed) {
          console.log("💳 [App.tsx] ✅ Détection NOUVEAU paiement Stripe");
          console.log("📍 [App.tsx] Navigation vers PaymentProcessing dans 100ms...");
          
          // Marquer ce paiement comme traité pour éviter les doubles traitements
          const sessionId = Date.now().toString();
          localStorage.setItem('payment_processed_session', sessionId);
          console.log("💾 [App.tsx] payment_processed_session sauvegardé:", sessionId);
          
          // Nettoyer l'URL APRÈS un délai pour que PaymentProcessing puisse monter
          setTimeout(() => {
            console.log("🧹 [App.tsx] Nettoyage de l'URL...");
            window.history.replaceState({}, '', window.location.pathname);
          }, 500);
          
          // Naviguer vers PaymentProcessing
          setTimeout(() => {
            console.log("🚀 [App.tsx] Tentative de navigation vers PaymentProcessing...");
            if (navigationRef.current) {
              console.log("✅ [App.tsx] navigationRef disponible, navigation en cours...");
              navigationRef.current.navigate('PaymentProcessing');
            } else {
              console.error("❌ [App.tsx] navigationRef.current est NULL!");
            }
          }, 100);
        } else {
          console.log("✅ [App.tsx] Paiement déjà traité - navigation normale");
          window.history.replaceState({}, '', window.location.pathname);
        }
      } else if (stripePaymentCanceled === 'true') {
        console.log("❌ [App.tsx] Paiement annulé par l'utilisateur");
        // Nettoyer l'URL
        window.history.replaceState({}, '', window.location.pathname);
        // Pas besoin de naviguer, l'utilisateur reste sur la page actuelle
      } else {
        console.log("ℹ️ [App.tsx] Pas de paramètre de paiement dans l'URL");
      }
    } else {
      console.log("ℹ️ [App.tsx] Pas sur web ou window/localStorage indisponible");
    }
    
    console.log("✅ [App.tsx] setHasCheckedPayment(true)");
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

