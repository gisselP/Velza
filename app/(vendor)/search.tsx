import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  async function doSearch() {
    if (!query.trim()) return;
    setSearching(true);
    const q = query.trim().toLowerCase();
    const { data } = await supabase
      .from('products')
      .select('*, inventory(id, quantity, location:locations(id, name))')
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,code.ilike.%${q}%,model.ilike.%${q}%,color.ilike.%${q}%,size.ilike.%${q}%`);

    const withStock = (data ?? []).map((p: any) => ({
      ...p,
      total_stock: (p.inventory ?? []).reduce((s: number, i: any) => s + i.quantity, 0),
    }));
    setResults(withStock);
    setSearched(true);
    setSearching(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar producto</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Nombre, código, modelo, talla, color..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={doSearch}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.searchBtn} onPress={doSearch} disabled={searching}>
        <Text style={styles.searchBtnText}>
          {searching ? 'Buscando...' : 'Buscar'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          searched ? (
            <Text style={styles.empty}>No se encontraron productos para "{query}".</Text>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="footsteps-outline" size={48} color={Colors.border} />
              <Text style={styles.placeholderText}>Busca un producto por nombre, talla, color o código</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const totalStock = item.total_stock ?? 0;
          return (
            <Card style={styles.productCard}>
              <View style={styles.productTop}>
                <View style={styles.iconBox}>
                  <Ionicons name="footsteps-outline" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productSub}>
                    {item.model} | T.{item.size} | {item.color} | {item.gender === 'dama' ? 'Dama' : 'Caballero'}
                  </Text>
                  <Text style={styles.productCode}>Cód: {item.code}</Text>
                </View>
                <Text style={styles.price}>S/ {item.sale_price.toFixed(2)}</Text>
              </View>

              <View style={styles.stockSection}>
                <Badge
                  label={totalStock === 0 ? 'Agotado' : totalStock <= 3 ? 'Stock bajo' : 'Disponible'}
                  variant={totalStock === 0 ? 'danger' : totalStock <= 3 ? 'warning' : 'success'}
                />
                <Text style={styles.totalStock}>Total: {totalStock} pares</Text>
              </View>

              <View style={styles.locations}>
                {(item.inventory ?? []).map((inv: any) => (
                  <View key={inv.id} style={styles.locationRow}>
                    <Ionicons
                      name={inv.location.name.toLowerCase().includes('local') ? 'storefront-outline' : 'cube-outline'}
                      size={14}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.locationName}>{inv.location.name}:</Text>
                    <Text style={[styles.locationQty, { color: inv.quantity === 0 ? Colors.danger : inv.quantity <= 2 ? Colors.warning : Colors.success }]}>
                      {inv.quantity} pares
                    </Text>
                  </View>
                ))}
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
  },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textInverse },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
    height: 52,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  searchBtn: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { color: Colors.textInverse, fontSize: FontSize.md, fontWeight: '700' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  empty: { textAlign: 'center', color: Colors.textSecondary, padding: Spacing.xl },
  placeholder: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.md },
  placeholderText: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.md },
  productCard: { marginBottom: 0 },
  productTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: Colors.borderLight,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  productSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  productCode: { fontSize: FontSize.xs, color: Colors.textMuted },
  price: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.accent },
  stockSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalStock: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  locations: { marginTop: Spacing.xs, gap: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationName: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '600' },
  locationQty: { fontSize: FontSize.sm, fontWeight: '700' },
});
