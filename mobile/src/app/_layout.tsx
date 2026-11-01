import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors, Fonts } from '@/constants/theme';
import { useSynchroRappels } from '@/lib/rappels';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.background,
    text: Colors.text,
    primary: Colors.emerald,
    border: Colors.border,
  },
};

export default function RootLayout() {
  useSynchroRappels();
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Amiri_400Regular,
    Amiri_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: Colors.emerald,
          headerTitleStyle: { fontFamily: Fonts.semibold },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sites" options={{ title: 'Sites' }} />
        <Stack.Screen name="tasbih/index" options={{ title: 'Compteur de tasbih' }} />
        <Stack.Screen name="tasbih/creer" options={{ title: 'Créer mon tasbih' }} />
        <Stack.Screen name="tasbih/historique" options={{ title: 'Historique' }} />
        <Stack.Screen name="livres" options={{ title: 'Livres et cours' }} />
        <Stack.Screen name="voyage" options={{ title: 'Voyage' }} />
        <Stack.Screen name="reglages/langue" options={{ title: 'Langue' }} />
        <Stack.Screen name="reglages/methode-priere" options={{ title: 'Méthode de prière' }} />
        <Stack.Screen name="reglages/notifications" options={{ title: 'Notifications' }} />
        <Stack.Screen name="reglages/confidentialite" options={{ title: 'Confidentialité' }} />
        <Stack.Screen name="reglages/a-propos" options={{ title: 'À propos' }} />
        <Stack.Screen name="reglages/admin" options={{ title: 'Espace administrateur' }} />
      </Stack>
    </ThemeProvider>
  );
}
