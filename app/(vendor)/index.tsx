import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Colors, FontSize, Spacing } from '../../constants/theme';

export default function VendorHomeScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const statsAnim = useRef(new Animated.Value(0)).current;
  const sellPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(statsAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(sellPulse, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
          Animated.timing(sellPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [loading]);

  async function fetchData() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const [todayRes, recentRes] = await Promise.all([
      supabase
        .from('sales')
        .select('total')
        .eq('vendor_id', profile?.user_id)
        .gte('sale_date', today),
      supabase
        .from('sales')
        .select('*, details:sale_details(*, product:products(name, size, color), location:locations(name))')
        .eq('vendor_id', profile?.user_id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    setTodayTotal((todayRes.data ?? []).reduce((s, r) => s + r.total, 0));
    setTodayCount(todayRes.data?.length ?? 0);
    setRecentSales(recentRes.data ?? []);
    setLoading(false);
    setRefreshing(false);
  }

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {profile?.full_name?.split(' ')[0]}</Text>
          <Text style={styles.date}>
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </Text>
        </View>
        <View style={styles.logoBox}>
          <Text style={styles.logo}>V</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <Animated.View style={[styles.statsRow, { opacity: statsAnim, transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.success + '20' }]}>
              <Ionicons name="trending-up" size={22} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>S/ {todayTotal.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Mis ventas hoy</Text>
          </Card>
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.info + '20' }]}>
              <Ionicons name="receipt-outline" size={22} color={Colors.info} />
            </View>
            <Text style={styles.statValue}>{todayCount}</Text>
            <Text style={styles.statLabel}>Transacciones</Text>
          </Card>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: sellPulse }] }}>
        <TouchableOpacity onPress={() => router.push('/(vendor)/sale')} activeOpacity={0.9}>
          <Card style={styles.sellBtn}>
            <Ionicons name="add-circle" size={28} color={Colors.textInverse} />
            <Text style={styles.sellBtnText}>Registrar nueva venta</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textInverse} />
          </Card>
        </TouchableOpacity>
        </Animated.View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(vendor)/search')}>
            <Ionicons name="search-outline" size={24} color={Colors.primary} />
            <Text style={styles.quickText}>Buscar producto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/(vendor)/my-sales')}>
            <Ionicons name="list-outline" size={24} color={Colors.primary} />
            <Text style={styles.quickText}>Ver mis ventas</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Ventas recientes</Text>
        {recentSales.length === 0 ? (
          <Card>
            <Text style={styles.empty}>No tienes ventas registradas hoy.</Text>
          </Card>
        ) : (
          recentSales.map((sale) => (
            <Card key={sale.id} style={styles.saleCard}>
              <View style={styles.saleRow}>
                <View>
                  <Text style={styles.saleTime}>{format(new Date(sale.created_at), 'HH:mm')}</Text>
                  <Text style={styles.saleDate}>{format(new Date(sale.sale_date), 'dd/MM/yyyy')}</Text>
                </View>
                <View style={styles.saleCenter}>
                  {(sale.details ?? []).slice(0, 1).map((d: any) => (
                    <Text key={d.id} style={styles.saleProduct} numberOfLines={1}>
                      {d.product?.name}
                    </Text>
                  ))}
                  {sale.details?.length > 1 && (
                    <Text style={styles.moreItems}>+{sale.details.length - 1} más</Text>
                  )}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textInverse },
  date: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginTop: 2, textTransform: 'capitalize' },
  logoBox: {
    width: 44,
    height: 44,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { fontSize: 22, fontWeight: '900', color: Colors.textInverse },
  content: { padding: Spacing.md, gap: Spacing.md },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, gap: Spacing.xs },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  sellBtn: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  sellBtnText: { flex: 1, fontSize: FontSize.lg, fontWeight: '700', color: Colors.textInverse },
  quickActions: { flexDirection: 'row', gap: Spacing.sm },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  saleCard: { marginBottom: 0 },
  saleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  saleTime: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  saleDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  saleCenter: { flex: 1 },
  saleProduct: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  moreItems: { fontSize: FontSize.xs, color: Colors.textSecondary },
  saleRight: { alignItems: 'flex-end', gap: 4 },
  saleTotal: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.accent },
  empty: { textAlign: 'center', color: Colors.textSecondary, padding: Spacing.md, fontSize: FontSize.sm },
});
