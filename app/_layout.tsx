import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../hooks/useAuth';

function RootLayoutNav() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';
    const inAdminGroup = segments[0] === '(admin)';
    const inVendorGroup = segments[0] === '(vendor)';

    if (!session && !inAuthGroup) {
      router.replace('/login');
    } else if (session && profile) {
      if (profile.role === 'admin' && !inAdminGroup) {
        router.replace('/(admin)');
      } else if (profile.role === 'vendor' && !inVendorGroup) {
        router.replace('/(vendor)');
      }
    }
  }, [session, profile, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(vendor)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" />
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
