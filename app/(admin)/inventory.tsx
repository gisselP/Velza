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
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

interface ProductWithStock {
  id: string;
  code: string;
  name: string;
  model: string;
  size: string;
  color: string;
  gender: string;
  is_active: boolean;
  total_stock: number;
  inventory: {
    id: string;
    quantity: number;
    location: { id: string; name: string };
  }[];
}

export default function InventoryScreen() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  useEffect(() => { fetchInventory(); }, []);

  async function fetchInventory() {
    const { data } = await supabase
      .from('products')
      .select('id, code, name, model, size, color, gender, is_active, inventory(id, quantity, location:locations(id, name))')
      .eq('is_active', true)
      .order('name');

    const withStock = (data ?? []).map((p: any) => ({
      ...p,
      total_stock: (p.inventory ?? []).reduce((s: number, i: any) => s + i.quantity, 0),
    }));
    setProducts(withStock);
    setLoading(false);
    setRefreshing(false);
  }

  const filtered = products
    .filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.size.toLowerCase().includes(q);
      const matchFilter =
        filter === 'all' ||
        (filter === 'out' && p.total_stock === 0) ||
        (filter === 'low' && p.total_stock > 0 && p.total_stock <= 3);
      return matchSearch && matchFilter;
    });

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventario</Text>
        <Text style={styles.subtitle}>{filtered.length} productos</Text>
      </View>

      <View style={styles.controls}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.filters}>
          {(['all', 'low', 'out'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Todos' : f === 'low' ? 'Stock bajo' : 'Agotado'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchInventory(); }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No se encontraron productos.</Text>
        }
        renderItem={({ item }) => {
          const stockVariant =
            item.total_stock === 0 ? 'danger' : item.total_stock <= 3 ? 'warning' : 'success';
          return (
            <Card style={styles.productCard}>
              <View style={styles.productTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productSub}>
                    {item.model} — T.{item.size} — {item.color}
                  </Text>
                  <Text style={styles.productCode}>Cód: {item.code}</Text>
                </View>
                <View style={styles.totalBox}>
                  <Text style={[styles.totalNum, { color: item.total_stock === 0 ? Colors.danger : item.total_stock <= 3 ? Colors.warning : Colors.success }]}>
                    {item.total_stock}
                  </Text>
                  <Text style={styles.totalLbl}>total</Text>
                </View>
              </View>
              <View style={styles.stockRow}>
                {item.inventory.map((inv) => (
                  <View key={inv.id} style={styles.locationBox}>
                    <Ionicons
                      name={inv.location.name.toLowerCase().includes('local') ? 'storefront-outline' : 'cube-outline'}
                      size={14}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.locationName}>{inv.location.name}</Text>
                    <Text style={styles.locationQty}>{inv.quantity} pares</Text>
                  </View>
                ))}
                <Badge
                  label={item.total_stock === 0 ? 'Agotado' : item.total_stock <= 3 ? 'Stock bajo' : 'Disponible'}
                  variant={stockVariant}
                />
              </View>
            </Card>
          );
        }}
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
  subtitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)' },
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
  filters: { flexDirection: 'row', gap: Spacing.sm },
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
  productCard: { marginBottom: 0 },
  productTop: { flexDirection: 'row', alignItems: 'flex-start' },
  productName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  productSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  productCode: { fontSize: FontSize.xs, color: Colors.textMuted },
  totalBox: { alignItems: 'center', paddingLeft: Spacing.sm },
  totalNum: { fontSize: FontSize.xxl, fontWeight: '900' },
  totalLbl: { fontSize: FontSize.xs, color: Colors.textMuted },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  locationName: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.text },
  locationQty: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
