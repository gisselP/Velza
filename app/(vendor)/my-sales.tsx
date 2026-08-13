import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Sale } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Colors, FontSize, Spacing } from '../../constants/theme';

export default function MySalesScreen() {
  const { profile } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totals, setTotals] = useState({ day: 0, month: 0, count: 0 });

  useEffect(() => { fetchSales(); }, []);

  async function fetchSales() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const monthStart = format(new Date(), 'yyyy-MM-01');

    const [salesRes, dayRes, monthRes] = await Promise.all([
      supabase
        .from('sales')
        .select('*, details:sale_details(*, product:products(name, size, color), location:locations(name))')
        .eq('vendor_id', profile?.user_id)
        .order('created_at', { ascending: false }),
      supabase.from('sales').select('total').eq('vendor_id', profile?.user_id).gte('sale_date', today),
      supabase.from('sales').select('total').eq('vendor_id', profile?.user_id).gte('sale_date', monthStart),
    ]);

    setSales(salesRes.data ?? []);
    setTotals({
      day: (dayRes.data ?? []).reduce((s, r) => s + r.total, 0),
      month: (monthRes.data ?? []).reduce((s, r) => s + r.total, 0),
      count: dayRes.data?.length ?? 0,
    });
    setLoading(false);
    setRefreshing(false);
  }

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis ventas</Text>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>S/ {totals.day.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Hoy</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>S/ {totals.month.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Este mes</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totals.count}</Text>
          <Text style={styles.statLabel}>Ventas hoy</Text>
        </View>
      </View>

      <FlatList
        data={sales}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSales(); }} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.empty}>No tienes ventas registradas aún.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.saleCard}>
            <View style={styles.saleHeader}>
              <View>
                <Text style={styles.saleDate}>{format(new Date(item.sale_date), 'dd/MM/yyyy')}</Text>
                <Text style={styles.saleTime}>{format(new Date(item.created_at), 'HH:mm')}</Text>
              </View>
              <View style={styles.saleRight}>
                <Text style={styles.saleTotal}>S/ {item.total.toFixed(2)}</Text>
                <Badge
                  label={item.payment_method.toUpperCase()}
                  variant={item.payment_method === 'efectivo' ? 'success' : item.payment_method === 'yape' ? 'info' : 'warning'}
                />
              </View>
            </View>
            {(item.details ?? []).map((d: any) => (
              <View key={d.id} style={styles.detailRow}>
                <Text style={styles.detailProduct} numberOfLines={1}>
                  {d.product?.name} T.{d.product?.size} — {d.product?.color}
                </Text>
                <Text style={styles.detailInfo}>
                  {d.quantity} × S/ {d.unit_price.toFixed(2)} | {d.location?.name}
                </Text>
              </View>
            ))}
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textInverse },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  divider: { width: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.sm },
  list: { padding: Spacing.md, gap: Spacing.sm },
  emptyBox: { padding: Spacing.xxl, alignItems: 'center' },
  empty: { textAlign: 'center', color: Colors.textSecondary, fontSize: FontSize.md },
  saleCard: { marginBottom: 0 },
  saleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  saleDate: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  saleTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  saleRight: { alignItems: 'flex-end', gap: 4 },
  saleTotal: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.accent },
  detailRow: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailProduct: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  detailInfo: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
});
