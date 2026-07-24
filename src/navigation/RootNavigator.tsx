import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { PaymentWebViewScreen } from '../screens/PaymentWebViewScreen';
import { InvoiceWebViewScreen } from '../screens/InvoiceWebViewScreen';
import { TabNavigator } from './TabNavigator';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MIN_SPLASH_MS = 2200;

export function RootNavigator() {
  const { initializing, isAuthenticated } = useAuth();
  const [minSplashDone, setMinSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinSplashDone(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  if (initializing || !minSplashDone) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen
            name="PaymentWebView"
            component={PaymentWebViewScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="InvoiceWebView"
            component={InvoiceWebViewScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="PaymentWebView"
            component={PaymentWebViewScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
