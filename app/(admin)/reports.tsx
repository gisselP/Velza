import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays, startOfMonth } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { Badge } from '../../components/ui/Badge';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

type Period = '7d' | '30d' | 'month';

interface ReportData {
  totalSales: number;
  salesCount: number;
  byMethod: { method: string; total: number; count: number }[];
  byVendor: { vendor: string; total: number; count: number }[];
  outOfStock: any[];
  lowStock: any[];
  noSalesProducts: any[];
}

export default function ReportsScreen() {
  const [period, setPeriod] = useState<Period>('30d');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'sales' | 'inventory'>('sales');

  useEffect(() => { fetchReport(); }, [period]);

  async function fetchReport() {
    setLoading(true);
    const now = new Date();
    let fromDate: string;
    if (period === '7d') fromDate = format(subDays(now, 7), 'yyyy-MM-dd');
    else if (period === '30d') fromDate = format(subDays(now, 30), 'yyyy-MM-dd');
    else fromDate = format(startOfMonth(now), 'yyyy-MM-dd');

    const [salesRes, productsRes] = await Promise.all([
      supabase
        .from('sales')
        .select('id, total, payment_method, sale_date, vendor:profiles(full_name)')
        .gte('sale_date', fromDate),
      supabase
        .from('products')
        .select('id, name, size, color, model, inventory(quantity), sale_details(id, sale:sales(sale_date))')
        .eq('is_active', true),
    ]);

    const sales = salesRes.data ?? [];
    const products = productsRes.data ?? [];

    const totalSales = sales.reduce((s, r) => s + r.total, 0);
    const salesCount = sales.length;

    const methodMap: Record<string, { total: number; count: number }> = {};
    const vendorMap: Record<string, { total: number; count: number }> = {};
    sales.forEach((s) => {
      const m = s.payment_method;
      if (!methodMap[m]) methodMap[m] = { total: 0, count: 0 };
      methodMap[m].total += s.total;
      methodMap[m].count++;

      const v = (s as any).vendor?.full_name ?? 'Sin nombre';
      if (!vendorMap[v]) vendorMap[v] = { total: 0, count: 0 };
      vendorMap[v].total += s.total;
      vendorMap[v].count++;
    });

    const byMethod = Object.entries(methodMap).map(([method, d]) => ({ method, ...d })).sort((a, b) => b.total - a.total);
    const byVendor = Object.entries(vendorMap).map(([vendor, d]) => ({ vendor, ...d })).sort((a, b) => b.total - a.total);

    const noSalesThreshold = subDays(now, period === '7d' ? 7 : period === '30d' ? 30 : 30);
    const noSalesProducts = products.filter((p: any) => {
      const details = p.sale_details ?? [];
      if (details.length === 0) return true;
      const lastSale = details
        .map((d: any) => new Date(d.sale?.sale_date ?? 0))
        .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0];
      return lastSale < noSalesThreshold;
    });

    const outOfStock = products.filter((p: any) => {
      const total = (p.inventory ?? []).reduce((s: number, i: any) => s + i.quantity, 0);
      return total === 0;
    });

    const lowStock = products.filter((p: any) => {
      const total = (p.inventory ?? []).reduce((s: number, i: any) => s + i.quantity, 0);
      return total > 0 && total <= 3;
    });

    setData({ totalSales, salesCount, byMethod, byVendor, outOfStock, lowStock, noSalesProducts });
    setLoading(false);
    setRefreshing(false);
  }

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Reportes</Text>
      </View>

      <View style={styles.periodRow}>
        {(['7d', '30d', 'month'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p === '7d' ? '7 días' : p === '30d' ? '30 días' : 'Este mes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'sales' && styles.tabActive]} onPress={() => setTab('sales')}>
          <Text style={[styles.tabText, tab === 'sales' && styles.tabTextActive]}>Ventas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'inventory' && styles.tabActive]} onPress={() => setTab('inventory')}>
          <Text style={[styles.tabText, tab === 'inventory' && styles.tabTextActive]}>Inventario</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReport(); }} />}
      >
        {tab === 'sales' ? (
          <>
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>S/ {(data?.totalSales ?? 0).toFixed(2)}</Text>
                <Text style={styles.statLabel}>Total ventas</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{data?.salesCount ?? 0}</Text>
                <Text style={styles.statLabel}>Transacciones</Text>
              </Card>
            </View>

            <Text style={styles.sectionTitle}>Por método de pago</Text>
            {(data?.byMethod ?? []).map((m) => (
              <Card key={m.method} style={styles.rowCard}>
                <View style={styles.rowItem}>
                  <View>
                    <Text style={styles.rowName}>{m.method.charAt(0).toUpperCase() + m.method.slice(1)}</Text>
                    <Text style={styles.rowSub}>{m.count} venta{m.count !== 1 ? 's' : ''}</Text>
                  </View>
                  <Text style={styles.rowValue}>S/ {m.total.toFixed(2)}</Text>
                </View>
              </Card>
            ))}

            <Text style={styles.sectionTitle}>Por vendedor</Text>
            {(data?.byVendor ?? []).map((v) => (
              <Card key={v.vendor} style={styles.rowCard}>
                <View style={styles.rowItem}>
                  <View>
                    <Text style={styles.rowName}>{v.vendor}</Text>
                    <Text style={styles.rowSub}>{v.count} venta{v.count !== 1 ? 's' : ''}</Text>
                  </View>
                  <Text style={styles.rowValue}>S/ {v.total.toFixed(2)}</Text>
                </View>
              </Card>
            ))}

            {(data?.byMethod ?? []).length === 0 && (
              <Text style={styles.empty}>Sin ventas en este período.</Text>
            )}
          </>
        ) : (
          <>
            <SectionList
              title="Productos agotados"
              items={data?.outOfStock ?? []}
              emptyText="No hay productos agotados."
              badgeVariant="danger"
              badgeLabel="Agotado"
            />
            <SectionList
              title="Stock bajo (≤ 3 pares)"
              items={data?.lowStock ?? []}
              emptyText="Stock en buen nivel."
              badgeVariant="warning"
              badgeLabel="Stock bajo"
            />
            <SectionList
              title="Sin ventas recientes"
              items={data?.noSalesProducts ?? []}
              emptyText="Todos los productos tienen ventas recientes."
              badgeVariant="neutral"
              badgeLabel="Sin ventas"
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionList({ title, items, emptyText, badgeVariant, badgeLabel }: any) {
  return (
    <>
      <Text style={styles.sectionTitle}>
        {title} ({items.length})
      </Text>
      {items.length === 0 ? (
        <Card><Text style={styles.empty}>{emptyText}</Text></Card>
      ) : (
        items.map((p: any) => {
          const total = (p.inventory ?? []).reduce((s: number, i: any) => s + i.quantity, 0);
          return (
            <Card key={p.id} style={styles.rowCard}>
              <View style={styles.rowItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.rowSub}>T.{p.size} — {p.color}</Text>
                </View>
                <Badge label={total > 0 ? `${total} pares` : badgeLabel} variant={total > 0 ? badgeVariant : 'danger'} />
              </View>
            </Card>
          );
        })
      )}
    </>
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
  periodRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: Spacing.sm - 2,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  periodText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  periodTextActive: { color: Colors.textInverse },
  tabRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: Colors.accent },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.accent },
  content: { padding: Spacing.md, gap: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1 },
  statValue: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text, marginTop: Spacing.sm },
  rowCard: { marginBottom: 0 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  rowSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  rowValue: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.accent },
  empty: { textAlign: 'center', color: Colors.textSecondary, padding: Spacing.md, fontSize: FontSize.sm },
});
