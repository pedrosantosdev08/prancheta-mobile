import { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../src/theme';

const icone = (n: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={n} color={color as string} size={size} />;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: C.acc }}>
      <Tabs.Screen name="index" options={{ title: 'Treinos', tabBarIcon: icone('clipboard-outline') }} />
      <Tabs.Screen name="exercicios" options={{ title: 'Exercícios', tabBarIcon: icone('library-outline') }} />
      <Tabs.Screen name="prancheta" options={{ title: 'Prancheta', tabBarIcon: icone('compass-outline') }} />
      <Tabs.Screen name="elenco" options={{ title: 'Elenco', tabBarIcon: icone('people-outline') }} />
    </Tabs>
  );
}
