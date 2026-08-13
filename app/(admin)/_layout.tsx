import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="footsteps-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventario',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="archive-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          title: 'Compras',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Ventas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="suppliers" options={{ href: null }} />
    </Tabs>
  );
}
