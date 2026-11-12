import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, BookOpen, CirclePlus, ClipboardList } from 'lucide-react-native';
import { NombreGate } from '@/components';
import { colors, fonts } from '@/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);
  return (
    <>
      <NombreGate />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.rosa,
          tabBarInactiveTintColor: colors.tintaSuave,
          tabBarStyle: {
            backgroundColor: colors.blanco,
            borderTopColor: colors.borde,
            height: 64 + bottom,
            paddingBottom: bottom,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Avisos', tabBarIcon: ({ color }) => <Bell color={color} size={24} strokeWidth={2} /> }}
        />
        <Tabs.Screen
          name="talleres"
          options={{ title: 'Talleres', tabBarIcon: ({ color }) => <BookOpen color={color} size={24} strokeWidth={2} /> }}
        />
        <Tabs.Screen
          name="inscribirme"
          options={{ title: 'Inscribirme', tabBarIcon: ({ color }) => <CirclePlus color={color} size={24} strokeWidth={2} /> }}
        />
        <Tabs.Screen
          name="mis-inscripciones"
          options={{
            title: 'Mis inscripciones',
            tabBarLabel: 'Inscripciones',
            tabBarAccessibilityLabel: 'Mis inscripciones',
            tabBarIcon: ({ color }) => <ClipboardList color={color} size={24} strokeWidth={2} />,
          }}
        />
      </Tabs>
    </>
  );
}
