import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Purchase, Product, Supplier, Location } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

type PurchaseForm = {
  supplier_id: string;
  product_id: string;
  location_id: string;
  quantity: string;
  unit_cost: string;
  notes: string;
};

export default function PurchasesScreen() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [suppliersModal, setSuppliersModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'purchases' | 'suppliers'>('purchases');

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PurchaseForm>({
    defaultValues: { supplier_id: '', product_id: '', location_id: '', quantity: '', unit_cost: '', notes: '' },
  });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [pRes, sRes, prodRes, locRes] = await Promise.all([
      supabase.from('purchases').select('*, supplier:suppliers(name), details:purchase_details(*, product:products(name, size, color), location:locations(name))').order('purchase_date', { ascending: false }),
      supabase.from('suppliers').select('*').eq('is_active', true).order('name'),
      supabase.from('products').select('id, name, model, size, color, cost').eq('is_active', true).order('name'),
      supabase.from('locations').select('*').eq('is_active', true),
    ]);
    setPurchases(pRes.data ?? []);
    setSuppliers(sRes.data ?? []);
    setProducts(prodRes.data ?? []);
    setLocations(locRes.data ?? []);
    setLoading(false);
    setRefreshing(false);
  }

  async function onSubmit(values: PurchaseForm) {
    if (!values.supplier_id) { Alert.alert('Error', 'Selecciona un proveedor.'); return; }
    if (!values.product_id) { Alert.alert('Error', 'Selecciona un producto.'); return; }
    if (!values.location_id) { Alert.alert('Error', 'Selecciona una ubicación.'); return; }
    const qty = parseInt(values.quantity);
    const cost = parseFloat(values.unit_cost);
    if (isNaN(qty) || qty <= 0) { Alert.alert('Error', 'Cantidad inválida.'); return; }
    if (isNaN(cost) || cost <= 0) { Alert.alert('Error', 'Costo inválido.'); return; }

    setSaving(true);
    const total = qty * cost;
    const { data: purchase, error: pError } = await supabase
      .from('purchases')
      .insert({ supplier_id: values.supplier_id, purchase_date: format(new Date(), 'yyyy-MM-dd'), total, notes: values.notes })
      .select()
      .single();

    if (pError || !purchase) { setSaving(false); Alert.alert('Error', 'No se pudo registrar la compra.'); return; }

    const { error: dError } = await supabase.from('purchase_details').insert({
      purchase_id: purchase.id,
      product_id: values.product_id,
      location_id: values.location_id,
      quantity: qty,
      unit_cost: cost,
      subtotal: total,
    });

    if (!dError) {
      // Update inventory
      const { data: inv } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('product_id', values.product_id)
        .eq('location_id', values.location_id)
        .single();

      if (inv) {
        await supabase.from('inventory').update({ quantity: inv.quantity + qty }).eq('id', inv.id);
      } else {
        await supabase.from('inventory').insert({ product_id: values.product_id, location_id: values.location_id, quantity: qty });
      }
    }

    setSaving(false);
    setModalVisible(false);
    reset();
    fetchAll();
  }

  const selectedProduct = products.find((p) => p.id === watch('product_id'));

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Compras</Text>
        <TouchableOpacity onPress={() => { reset(); setModalVisible(true); }} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'purchases' && styles.tabActive]} onPress={() => setTab('purchases')}>
          <Text style={[styles.tabText, tab === 'purchases' && styles.tabTextActive]}>Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'suppliers' && styles.tabActive]} onPress={() => setTab('suppliers')}>
          <Text style={[styles.tabText, tab === 'suppliers' && styles.tabTextActive]}>Proveedores</Text>
        </TouchableOpacity>
      </View>

      {tab === 'purchases' ? (
        <FlatList
          data={purchases}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} />}
          ListEmptyComponent={<Text style={styles.empty}>No hay compras registradas.</Text>}
          renderItem={({ item }) => (
            <Card style={styles.purchaseCard}>
              <View style={styles.purchaseHeader}>
                <View>
                  <Text style={styles.purchaseSupplier}>{(item as any).supplier?.name}</Text>
                  <Text style={styles.purchaseDate}>{format(new Date(item.purchase_date), 'dd/MM/yyyy')}</Text>
                </View>
                <Text style={styles.purchaseTotal}>S/ {item.total.toFixed(2)}</Text>
              </View>
              {(item.details ?? []).map((d: any) => (
                <View key={d.id} style={styles.detailRow}>
                  <Text style={styles.detailText}>
                    {d.product?.name} — {d.location?.name}
                  </Text>
                  <Text style={styles.detailQty}>{d.quantity} pares × S/ {d.unit_cost}</Text>
                </View>
              ))}
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
            </Card>
          )}
        />
      ) : (
        <SuppliersList suppliers={suppliers} onRefresh={() => { setRefreshing(true); fetchAll(); }} refreshing={refreshing} />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva compra</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={26} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>Proveedor</Text>
            <Controller
              control={control}
              name="supplier_id"
              render={({ field: { onChange, value } }) => (
                <View style={styles.selectList}>
                  {suppliers.map((s) => (
                    <TouchableOpacity key={s.id} style={[styles.selectItem, value === s.id && styles.selectItemActive]} onPress={() => onChange(s.id)}>
                      <Text style={[styles.selectText, value === s.id && styles.selectTextActive]}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />

            <Text style={styles.fieldLabel}>Producto</Text>
            <Controller
              control={control}
              name="product_id"
              render={({ field: { onChange, value } }) => (
                <View style={styles.selectList}>
                  {products.map((p) => (
                    <TouchableOpacity key={p.id} style={[styles.selectItem, value === p.id && styles.selectItemActive]} onPress={() => { onChange(p.id); setValue('unit_cost', p.cost.toString()); }}>
                      <Text style={[styles.selectText, value === p.id && styles.selectTextActive]}>{p.name} T.{p.size} — {p.color}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />

            <Text style={styles.fieldLabel}>Ubicación</Text>
            <Controller
              control={control}
              name="location_id"
              render={({ field: { onChange, value } }) => (
                <View style={styles.segmented}>
                  {locations.map((l) => (
                    <TouchableOpacity key={l.id} style={[styles.segment, value === l.id && styles.segmentActive]} onPress={() => onChange(l.id)}>
                      <Text style={[styles.segmentText, value === l.id && styles.segmentTextActive]}>{l.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Controller control={control} name="quantity" rules={{ required: 'Obligatorio' }} render={({ field: { onChange, value } }) => (
                  <Input label="Cantidad" placeholder="10" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.quantity?.message} />
                )} />
              </View>
              <View style={{ flex: 1 }}>
                <Controller control={control} name="unit_cost" rules={{ required: 'Obligatorio' }} render={({ field: { onChange, value } }) => (
                  <Input label="Costo unitario (S/)" placeholder="70.00" value={value} onChangeText={onChange} keyboardType="decimal-pad" error={errors.unit_cost?.message} />
                )} />
              </View>
            </View>

            {selectedProduct && watch('quantity') && watch('unit_cost') && (
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total de compra</Text>
                <Text style={styles.totalValue}>
                  S/ {(parseInt(watch('quantity') || '0') * parseFloat(watch('unit_cost') || '0')).toFixed(2)}
                </Text>
              </View>
            )}

            <Controller control={control} name="notes" render={({ field: { onChange, value } }) => (
              <Input label="Notas (opcional)" placeholder="Observaciones..." value={value} onChangeText={onChange} multiline numberOfLines={3} />
            )} />

            <Button title="Registrar compra" onPress={handleSubmit(onSubmit)} loading={saving} size="lg" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function SuppliersList({ suppliers, onRefresh, refreshing }: { suppliers: Supplier[]; onRefresh: () => void; refreshing: boolean }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { name: '', document: '', phone: '' } });

  async function onSubmit(values: any) {
    setSaving(true);
    await supabase.from('suppliers').insert({ ...values, is_active: true });
    setSaving(false);
    setModalVisible(false);
    reset();
    onRefresh();
  }

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: Spacing.md, paddingTop: Spacing.sm }}>
        <TouchableOpacity onPress={() => { reset(); setModalVisible(true); }} style={styles2.addSmall}>
          <Ionicons name="add" size={18} color={Colors.textInverse} />
          <Text style={styles2.addSmallText}>Nuevo proveedor</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={suppliers}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No hay proveedores.</Text>}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.purchaseSupplier}>{item.name}</Text>
            {item.document && <Text style={styles.purchaseDate}>RUC/DNI: {item.document}</Text>}
            {item.phone && <Text style={styles.purchaseDate}>Tel: {item.phone}</Text>}
          </Card>
        )}
      />
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nuevo proveedor</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={26} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Controller control={control} name="name" rules={{ required: 'Obligatorio' }} render={({ field: { onChange, value } }) => (
              <Input label="Nombre" placeholder="Distribuidora Lima SAC" value={value} onChangeText={onChange} error={errors.name?.message} />
            )} />
            <Controller control={control} name="document" render={({ field: { onChange, value } }) => (
              <Input label="RUC / DNI" placeholder="20xxxxxxxxx" value={value} onChangeText={onChange} keyboardType="numeric" />
            )} />
            <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
              <Input label="Teléfono" placeholder="999 999 999" value={value} onChangeText={onChange} keyboardType="phone-pad" />
            )} />
            <Button title="Guardar proveedor" onPress={handleSubmit(onSubmit)} loading={saving} size="lg" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles2 = StyleSheet.create({
  addSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  addSmallText: { color: Colors.textInverse, fontWeight: '600', fontSize: FontSize.sm },
});

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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: Colors.accent },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.accent },
  list: { padding: Spacing.md, gap: Spacing.sm },
  empty: { textAlign: 'center', color: Colors.textSecondary, padding: Spacing.xl },
  purchaseCard: { marginBottom: 0 },
  purchaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  purchaseSupplier: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  purchaseDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  purchaseTotal: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.accent },
  detailRow: { marginTop: Spacing.xs, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  detailText: { fontSize: FontSize.sm, color: Colors.text },
  detailQty: { fontSize: FontSize.xs, color: Colors.textSecondary },
  notes: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: Spacing.xs, fontStyle: 'italic' },
  modalSafe: { flex: 1, backgroundColor: Colors.surface },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  modalContent: { padding: Spacing.lg, gap: Spacing.md },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: -Spacing.xs },
  selectList: { gap: Spacing.xs },
  selectItem: { padding: Spacing.sm, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  selectItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  selectText: { fontSize: FontSize.sm, color: Colors.text },
  selectTextActive: { color: Colors.textInverse, fontWeight: '600' },
  segmented: { flexDirection: 'row', backgroundColor: Colors.borderLight, borderRadius: BorderRadius.md, padding: 3 },
  segment: { flex: 1, paddingVertical: Spacing.sm - 2, alignItems: 'center', borderRadius: BorderRadius.sm - 2 },
  segmentActive: { backgroundColor: Colors.primary },
  segmentText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.textInverse },
  row: { flexDirection: 'row', gap: Spacing.sm },
  totalBox: { backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center' },
  totalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  totalValue: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.primary },
});
