import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { FunnelDisplay_700Bold, FunnelDisplay_800ExtraBold } from '@expo-google-fonts/funnel-display';
import { FunnelSans_400Regular, FunnelSans_500Medium, FunnelSans_700Bold } from '@expo-google-fonts/funnel-sans';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import { queryClient } from '@/api/queryClient';
import { SesionProvider, useSesion } from '@/auth';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    [fonts.displayBold]: FunnelDisplay_700Bold,
    [fonts.displayExtraBold]: FunnelDisplay_800ExtraBold,
    [fonts.sansRegular]: FunnelSans_400Regular,
    [fonts.sansMedium]: FunnelSans_500Medium,
    [fonts.sansBold]: FunnelSans_700Bold,
    [fonts.caveatBold]: Caveat_700Bold,
  });

  const listo = loaded || !!error;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <SesionProvider>
            <Navegacion listo={listo} />
          </SesionProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Navegacion({ listo }: { listo: boolean }) {
  const { sesion, cargando } = useSesion();
  const visible = listo && !cargando;

  useEffect(() => {
    if (visible) SplashScreen.hideAsync().catch(() => {});
  }, [visible]);

  if (!visible) return null;

  const conSesion = !!sesion;
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.marfil },
        headerStyle: { backgroundColor: colors.marfil },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.displayBold },
        headerTintColor: colors.tinta,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Protected guard={!conSesion}>
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
      </Stack.Protected>
      <Stack.Protected guard={conSesion}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="taller/[id]" options={{ title: 'Taller' }} />
        <Stack.Screen name="perfil" options={{ title: 'Mi cuenta', presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Screen name="estado" options={{ title: 'Estado del servidor' }} />
    </Stack>
  );
}
