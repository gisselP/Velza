import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Sale } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

export default function SalesScreen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  useEffect(() => { fetchSales(); }, []);

  async function fetchSales() {
    const { data } = await supabase
      .from('sales')
      .select('*, vendor:profiles(full_name), details:sale_details(*, product:products(name, size, color), location:locations(name))')
      .order('created_at', { ascending: false });
    setSales(data ?? []);
    setLoading(false);
    setRefreshing(false);
  }

  const filtered = sales.filter((s) => {
    const vendor = (s as any).vendor?.full_name?.toLowerCase() ?? '';
    const matchSearch = search === '' || vendor.includes(search.toLowerCase());
    const matchMethod = filterMethod === 'all' || s.payment_method === filterMethod;
    return matchSearch && matchMethod;
  });

  const totalFiltered = filtered.reduce((sum, s) => sum + s.total, 0);

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Ventas</Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerTotal}>S/ {totalFiltered.toFixed(2)}</Text>
          <Text style={styles.headerCount}>{filtered.length} ventas</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar vendedor..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.filters}>
          {['all', 'efectivo', 'yape', 'plin'].map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.filterBtn, filterMethod === m && styles.filterBtnActive]}
              onPress={() => setFilterMethod(m)}
            >
              <Text style={[styles.filterText, filterMethod === m && styles.filterTextActive]}>
                {m === 'all' ? 'Todos' : m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSales(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>No hay ventas registradas.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.saleCard}>
            <View style={styles.saleHeader}>
              <View>
                <Text style={styles.vendorName}>{(item as any).vendor?.full_name ?? 'Vendedor'}</Text>
                <Text style={styles.saleDate}>{format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textInverse },
  headerStats: { alignItems: 'flex-end' },
  headerTotal: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.accentLight ?? Colors.accent },
  headerCount: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)' },
  controls: { padding: Spacing.md, gap: Spacing.sm },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  filters: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  filterBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: Colors.textInverse },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.sm },
  empty: { textAlign: 'center', color: Colors.textSecondary, padding: Spacing.xl },
  saleCard: { marginBottom: 0 },
  saleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  vendorName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  saleDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
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
