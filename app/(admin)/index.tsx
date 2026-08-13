import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Colors, FontSize, Spacing } from '../../constants/theme';
import { Sale, Product } from '../../types';

interface DashboardData {
  todaySales: number;
  monthSales: number;
  todayCount: number;
  lowStockProducts: Product[];
  recentSales: Sale[];
}

export default function DashboardScreen() {
  const { profile, signOut } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const card1 = useRef(new Animated.Value(0)).current;
  const card2 = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!loading) {
      Animated.stagger(150, [
        Animated.spring(card1, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.spring(card2, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(listAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  async function fetchData() {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const monthStart = format(new Date(), 'yyyy-MM-01');

      const [todayRes, monthRes, lowStockRes, recentRes] = await Promise.all([
        supabase
          .from('sales')
          .select('total')
          .gte('sale_date', today),
        supabase
          .from('sales')
          .select('total')
          .gte('sale_date', monthStart),
        supabase
          .from('products')
          .select('*, inventory(quantity, location:locations(name))')
          .eq('is_active', true)
          .limit(50),
        supabase
          .from('sales')
          .select('*, vendor:profiles(full_name), details:sale_details(*, product:products(name, size, color))')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const todaySales = (todayRes.data ?? []).reduce((s, r) => s + r.total, 0);
      const monthSales = (monthRes.data ?? []).reduce((s, r) => s + r.total, 0);
      const todayCount = todayRes.data?.length ?? 0;

      const lowStock = (lowStockRes.data ?? []).filter((p: any) => {
        const total = (p.inventory ?? []).reduce((s: number, i: any) => s + i.quantity, 0);
        return total <= 3;
      });

      setData({
        todaySales,
        monthSales,
        todayCount,
        lowStockProducts: lowStock,
        recentSales: recentRes.data ?? [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    fetchData();
  }

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {profile?.full_name?.split(' ')[0]}</Text>
          <Text style={styles.date}>
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.statsGrid}>
          <Animated.View style={{ flex: 1, opacity: card1, transform: [{ translateY: card1.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
            <StatCard
              label="Ventas hoy"
              value={`S/ ${(data?.todaySales ?? 0).toFixed(2)}`}
              icon="trending-up"
              color={Colors.success}
              sub={`${data?.todayCount ?? 0} venta${data?.todayCount !== 1 ? 's' : ''}`}
            />
          </Animated.View>
          <Animated.View style={{ flex: 1, opacity: card2, transform: [{ translateY: card2.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
            <StatCard
              label="Ventas del mes"
              value={`S/ ${(data?.monthSales ?? 0).toFixed(2)}`}
              icon="calendar"
              color={Colors.info}
            />
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: listAnim, transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
        {(data?.lowStockProducts?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="warning-outline" size={16} color={Colors.warning} />
              {'  '}Stock bajo ({data!.lowStockProducts.length})
            </Text>
            {data!.lowStockProducts.slice(0, 5).map((p: any) => {
              const total = (p.inventory ?? []).reduce((s: number, i: any) => s + i.quantity, 0);
              return (
                <Card key={p.id} style={styles.alertCard}>
                  <View style={styles.alertRow}>
                    <Text style={styles.alertName} numberOfLines={1}>
                      {p.name} T.{p.size}
                    </Text>
                    <Badge
                      label={total === 0 ? 'Agotado' : `${total} pares`}
                      variant={total === 0 ? 'danger' : 'warning'}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ventas recientes</Text>
          {(data?.recentSales?.length ?? 0) === 0 ? (
            <Card>
              <Text style={styles.empty}>No hay ventas registradas aún.</Text>
            </Card>
          ) : (
            data!.recentSales.map((sale) => (
              <Card key={sale.id} style={styles.saleCard}>
                <View style={styles.saleRow}>
                  <View>
                    <Text style={styles.saleName}>
                      {(sale as any).vendor?.full_name ?? 'Vendedor'}
                    </Text>
                    <Text style={styles.saleDate}>
                      {format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}
                    </Text>
                  </View>
                  <View style={styles.saleRight}>
                    <Text style={styles.saleTotal}>S/ {sale.total.toFixed(2)}</Text>
                    <Badge
                      label={sale.payment_method}
                      variant={sale.payment_method === 'efectivo' ? 'success' : 'info'}
                    />
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  sub?: string;
}) {
  return (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textInverse },
  date: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginTop: 2, textTransform: 'capitalize' },
  logoutBtn: { padding: Spacing.sm },
  content: { padding: Spacing.md, gap: Spacing.md },
  statsGrid: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, gap: Spacing.xs },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  statSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  alertCard: { marginBottom: 0 },
  alertRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, flex: 1 },
  saleCard: { marginBottom: 0 },
  saleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saleName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  saleDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  saleRight: { alignItems: 'flex-end', gap: 4 },
  saleTotal: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.accent },
  empty: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', padding: Spacing.md },
});
