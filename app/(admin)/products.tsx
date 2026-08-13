import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

type ProductForm = {
  code: string;
  name: string;
  model: string;
  size: string;
  color: string;
  gender: 'dama' | 'caballero' | 'unisex';
  sale_price: string;
  min_price: string;
  cost: string;
};

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>({
    defaultValues: {
      code: '', name: '', model: '', size: '', color: '',
      gender: 'dama', sale_price: '', min_price: '', cost: '',
    },
  });

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*, inventory(id, quantity, location_id, location:locations(name))')
      .order('name');

    const withStock = (data ?? []).map((p: any) => ({
      ...p,
      total_stock: (p.inventory ?? []).reduce((s: number, i: any) => s + i.quantity, 0),
    }));
    setProducts(withStock);
    setLoading(false);
    setRefreshing(false);
  }

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      p.color.toLowerCase().includes(q) ||
      p.size.toLowerCase().includes(q)
    );
  });

  function openNew() {
    setEditing(null);
    reset({ code: '', name: '', model: '', size: '', color: '', gender: 'dama', sale_price: '', min_price: '', cost: '' });
    setModalVisible(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    reset({
      code: product.code,
      name: product.name,
      model: product.model,
      size: product.size,
      color: product.color,
      gender: product.gender,
      sale_price: product.sale_price.toString(),
      min_price: product.min_price.toString(),
      cost: product.cost.toString(),
    });
    setModalVisible(true);
  }

  async function onSubmit(values: ProductForm) {
    const salePrice = parseFloat(values.sale_price);
    const minPrice = parseFloat(values.min_price);
    const cost = parseFloat(values.cost);

    if (isNaN(salePrice) || isNaN(minPrice) || isNaN(cost)) {
      Alert.alert('Error', 'Los precios deben ser valores numéricos.');
      return;
    }
    if (minPrice > salePrice) {
      Alert.alert('Error', 'El precio mínimo no puede ser mayor al precio de venta.');
      return;
    }

    setSaving(true);
    const payload = {
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      model: values.model.trim(),
      size: values.size.trim(),
      color: values.color.trim(),
      gender: values.gender,
      sale_price: salePrice,
      min_price: minPrice,
      cost,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from('products').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('products').insert({ ...payload, is_active: true }));
    }
    setSaving(false);

    if (error) {
      Alert.alert('Error', 'No se pudo guardar el producto.');
      return;
    }
    setModalVisible(false);
    fetchProducts();
  }

  async function toggleActive(product: Product) {
    const action = product.is_active ? 'desactivar' : 'activar';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} producto`,
      `¿Deseas ${action} "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: product.is_active ? 'destructive' : 'default',
          onPress: async () => {
            await supabase
              .from('products')
              .update({ is_active: !product.is_active })
              .eq('id', product.id);
            fetchProducts();
          },
        },
      ]
    );
  }

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Productos</Text>
        <TouchableOpacity onPress={openNew} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, código, color, talla..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No se encontraron productos.</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productSub}>
                  {item.model} — T.{item.size} — {item.color}
                </Text>
                <Text style={styles.productCode}>Cód: {item.code}</Text>
              </View>
              <View style={styles.productActions}>
                <Badge
                  label={item.is_active ? 'Activo' : 'Inactivo'}
                  variant={item.is_active ? 'success' : 'neutral'}
                />
                <View style={styles.actionBtns}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                    <Ionicons name="pencil-outline" size={18} color={Colors.info} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleActive(item)} style={styles.iconBtn}>
                    <Ionicons
                      name={item.is_active ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={item.is_active ? Colors.danger : Colors.success}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.priceRow}>
              <PricePill label="Venta" value={item.sale_price} color={Colors.accent} />
              <PricePill label="Mínimo" value={item.min_price} color={Colors.warning} />
              <PricePill label="Costo" value={item.cost} color={Colors.textSecondary} />
              <View style={styles.stockPill}>
                <Text style={styles.stockNum}>{item.total_stock ?? 0}</Text>
                <Text style={styles.stockLbl}>pares</Text>
              </View>
            </View>
          </Card>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editing ? 'Editar producto' : 'Nuevo producto'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={26} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Controller
              control={control}
              name="code"
              rules={{ required: 'Campo obligatorio' }}
              render={({ field: { onChange, value } }) => (
                <Input label="Código" placeholder="OXF-NEG-40" value={value} onChangeText={onChange} error={errors.code?.message} autoCapitalize="characters" />
              )}
            />
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Campo obligatorio' }}
              render={({ field: { onChange, value } }) => (
                <Input label="Nombre" placeholder="Oxford Negro T40" value={value} onChangeText={onChange} error={errors.name?.message} />
              )}
            />
            <Controller
              control={control}
              name="model"
              rules={{ required: 'Campo obligatorio' }}
              render={({ field: { onChange, value } }) => (
                <Input label="Modelo" placeholder="Oxford" value={value} onChangeText={onChange} error={errors.model?.message} />
              )}
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="size"
                  rules={{ required: 'Obligatorio' }}
                  render={({ field: { onChange, value } }) => (
                    <Input label="Talla" placeholder="40" value={value} onChangeText={onChange} error={errors.size?.message} keyboardType="numeric" />
                  )}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="color"
                  rules={{ required: 'Obligatorio' }}
                  render={({ field: { onChange, value } }) => (
                    <Input label="Color" placeholder="Negro" value={value} onChangeText={onChange} error={errors.color?.message} />
                  )}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Género</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View style={styles.segmented}>
                  {(['dama', 'caballero', 'unisex'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.segment, value === g && styles.segmentActive]}
                      onPress={() => onChange(g)}
                    >
                      <Text style={[styles.segmentText, value === g && styles.segmentTextActive]}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="sale_price"
                  rules={{ required: 'Obligatorio' }}
                  render={({ field: { onChange, value } }) => (
                    <Input label="Precio venta (S/)" placeholder="120.00" value={value} onChangeText={onChange} keyboardType="decimal-pad" error={errors.sale_price?.message} />
                  )}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="min_price"
                  rules={{ required: 'Obligatorio' }}
                  render={({ field: { onChange, value } }) => (
                    <Input label="Precio mínimo (S/)" placeholder="100.00" value={value} onChangeText={onChange} keyboardType="decimal-pad" error={errors.min_price?.message} />
                  )}
                />
              </View>
            </View>
            <Controller
              control={control}
              name="cost"
              rules={{ required: 'Campo obligatorio' }}
              render={({ field: { onChange, value } }) => (
                <Input label="Costo (S/)" placeholder="70.00" value={value} onChangeText={onChange} keyboardType="decimal-pad" error={errors.cost?.message} />
              )}
            />
            <Button title={editing ? 'Guardar cambios' : 'Crear producto'} onPress={handleSubmit(onSubmit)} loading={saving} size="lg" style={{ marginTop: Spacing.sm }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function PricePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillValue, { color }]}>S/ {value.toFixed(0)}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textInverse },
  addBtn: {
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    marginBottom: 0,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  list: { padding: Spacing.md, gap: Spacing.sm },
  empty: { textAlign: 'center', color: Colors.textSecondary, padding: Spacing.xl },
  productCard: { marginBottom: 0 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  productInfo: { flex: 1 },
  productName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  productSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  productCode: { fontSize: FontSize.xs, color: Colors.textMuted },
  productActions: { alignItems: 'flex-end', gap: Spacing.xs },
  actionBtns: { flexDirection: 'row', gap: Spacing.sm },
  iconBtn: { padding: 4 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  pill: { alignItems: 'center' },
  pillValue: { fontSize: FontSize.sm, fontWeight: '700' },
  pillLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  stockPill: { marginLeft: 'auto', alignItems: 'center', backgroundColor: Colors.borderLight, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.sm },
  stockNum: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.primary },
  stockLbl: { fontSize: FontSize.xs, color: Colors.textSecondary },
  row: { flexDirection: 'row', gap: Spacing.sm },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  segmented: { flexDirection: 'row', backgroundColor: Colors.borderLight, borderRadius: BorderRadius.md, padding: 3 },
  segment: { flex: 1, paddingVertical: Spacing.sm - 2, alignItems: 'center', borderRadius: BorderRadius.sm - 2 },
  segmentActive: { backgroundColor: Colors.primary },
  segmentText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.textInverse },
  modalSafe: { flex: 1, backgroundColor: Colors.surface },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  modalContent: { padding: Spacing.lg, gap: Spacing.md },
});
