import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { I18nProvider } from '@/lib/i18n';
import { GiftsProvider } from '@/lib/gifts-store';
import { palette } from '@/theme/tokens';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.bg }}>
      <SafeAreaProvider>
        <I18nProvider>
          <GiftsProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: palette.bg },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="venue/[id]" />
              <Stack.Screen name="gift/create" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="gift/[code]" />
              <Stack.Screen name="login" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="signup" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="host-signup" options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="host" />
              <Stack.Screen name="contact" />
              <Stack.Screen name="privacy" />
              <Stack.Screen name="terms" />
            </Stack>
          </GiftsProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
