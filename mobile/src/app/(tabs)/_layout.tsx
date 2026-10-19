import { Tabs } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { palette, fonts } from '@/theme/tokens';

function TabIcon({ name, color }: { name: SymbolViewProps['name']; color: string }) {
  return <SymbolView name={name} tintColor={color} size={26} resizeMode="scaleAspectFit" />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.navy,
        tabBarInactiveTintColor: palette.ink3,
        tabBarLabelStyle: { fontFamily: fonts.sans, fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: palette.line,
          backgroundColor: palette.bg1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="venues"
        options={{
          title: 'Venues',
          tabBarIcon: ({ color }) => <TabIcon name="building.2" color={color} />,
        }}
      />
      <Tabs.Screen
        name="gifts"
        options={{
          title: 'Gifts',
          tabBarIcon: ({ color }) => <TabIcon name="gift" color={color} />,
        }}
      />
      <Tabs.Screen
        name="guest"
        options={{
          title: 'Guest',
          tabBarIcon: ({ color }) => <TabIcon name="qrcode" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <TabIcon name="ellipsis.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
