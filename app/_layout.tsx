import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../src/store/auth';

export default function Root() {
  const { user, ready, init } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => init(), []);

  useEffect(() => {
    if (!ready) return;
    const noLogin = segments[0] === 'login';
    if (!user && !noLogin) router.replace('/login');
    else if (user && noLogin) router.replace('/(tabs)');
  }, [user, ready, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
