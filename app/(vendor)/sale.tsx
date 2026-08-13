import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Product, Location, CartItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

type PaymentMethod = 'efectivo' | 'yape' | 'plin';

export default function SaleScreen() {
  const { profile } = useAuth();
  const [step, setStep] = useState<'search' | 'cart' | 'confirm'>('search');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [saving, setSaving] = useState(false);
  const [productModal, setProductModal] = useState<Product | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [customPrice, setCustomPrice] = useState('');
  const [searching, setSearching] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    supabase.from('locations').select('*').eq('is_active', true).then(({ data }) => {
      setLocations(data ?? []);
      if (data && data.length > 0) setSelectedLocationId(data[0].id);
      setLoadingLocations(false);
    });
  }, []);

  async function doSearch() {
    if (!query.trim()) return;
    setSearching(true);
    const q = query.trim();
    const { data } = await supabase
      .from('products')
      .select('*, inventory(id, quantity, location_id, location:locations(id, name))')
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,code.ilike.%${q}%,model.ilike.%${q}%,color.ilike.%${q}%,size.ilike.%${q}%`);

    const withStock = (data ?? []).map((p: any) => ({
      ...p,
      total_stock: (p.inventory ?? []).reduce((s: number, i: any) => s + i.quantity, 0),
    }));
    setSearchResults(withStock);
    setSearching(false);
  }

  function openProductModal(product: Product) {
    setProductModal(product);
    setQuantity('1');
    setCustomPrice(product.sale_price.toString());
    if (locations.length > 0) setSelectedLocationId(locations[0].id);
  }

  function addToCart() {
    if (!productModal) return;
    const qty = parseInt(quantity);
    const price = parseFloat(customPrice);

    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Ingresa una cantidad válida.');
      return;
    }
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Ingresa un precio válido.');
      return;
    }
    if (price < productModal.min_price) {
      Alert.alert(
        'Precio mínimo no permitido',
        `El precio ingresado (S/ ${price.toFixed(2)}) está por debajo del precio mínimo permitido (S/ ${productModal.min_price.toFixed(2)}).\n\nOperación bloqueada.`,
        [{ text: 'Entendido' }]
      );
      return;
    }

    const selectedLocation = locations.find((l) => l.id === selectedLocationId);
    const inventoryItem = (productModal.inventory ?? []).find((i: any) => i.location_id === selectedLocationId);
    const availableStock = inventoryItem?.quantity ?? 0;

    if (qty > availableStock) {
      Alert.alert('Stock insuficiente', `Solo hay ${availableStock} pares disponibles en ${selectedLocation?.name}.`);
      return;
    }

    const existingIndex = cart.findIndex(
      (c) => c.product.id === productModal.id && c.location_id === selectedLocationId
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + qty;
      if (newQty > availableStock) {
        Alert.alert('Stock insuficiente', `No puedes superar ${availableStock} pares de esta ubicación.`);
        return;
      }
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        unit_price: price,
      };
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          product: productModal,
          quantity: qty,
          location_id: selectedLocationId,
          location_name: selectedLocation?.name ?? '',
          unit_price: price,
        },
      ]);
    }
    setProductModal(null);
    setQuery('');
    setSearchResults([]);
    setStep('cart');
  }

  function removeFromCart(index: number) {
    setCart(cart.filter((_, i) => i !== index));
  }

  const total = cart.reduce((s, c) => s + c.quantity * c.unit_price, 0);

  async function confirmSale() {
    if (cart.length === 0) return;
    setSaving(true);

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        vendor_id: profile?.user_id,
        sale_date: format(new Date(), 'yyyy-MM-dd'),
        total,
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (saleError || !sale) {
      setSaving(false);
      Alert.alert('Error', 'No se pudo registrar la venta.');
      return;
    }

    const details = cart.map((c) => ({
      sale_id: sale.id,
      product_id: c.product.id,
      location_id: c.location_id,
      quantity: c.quantity,
      unit_price: c.unit_price,
      subtotal: c.quantity * c.unit_price,
    }));

    const { error: detailsError } = await supabase.from('sale_details').insert(details);
    if (detailsError) {
      setSaving(false);
      Alert.alert('Error', 'No se pudieron guardar los detalles.');
      return;
    }

    // Update inventory
    for (const item of cart) {
      const { data: inv } = await supabase
        .from('inventory')
        .select('id, quantity')
        .eq('product_id', item.product.id)
        .eq('location_id', item.location_id)
        .single();

      if (inv) {
        await supabase
          .from('inventory')
          .update({ quantity: Math.max(0, inv.quantity - item.quantity) })
          .eq('id', inv.id);
      }
    }

    setSaving(false);
    Alert.alert(
      'Venta registrada',
      `Venta por S/ ${total.toFixed(2)} registrada exitosamente.`,
      [
        {
          text: 'Nueva venta',
          onPress: () => {
            setCart([]);
            setStep('search');
            setQuery('');
            setSearchResults([]);
          },
        },
      ]
    );
  }

  if (loadingLocations) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Nueva venta</Text>
        {cart.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.stepRow}>
        {['search', 'cart', 'confirm'].map((s, idx) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, step === s && styles.stepDotActive, (step === 'cart' && s === 'search' || step === 'confirm') && styles.stepDotDone]}>
              <Text style={styles.stepDotText}>{idx + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, step === s && styles.stepLabelActive]}>
              {s === 'search' ? 'Producto' : s === 'cart' ? 'Carrito' : 'Confirmar'}
            </Text>
          </View>
        ))}
      </View>

      {step === 'search' && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar producto..."
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={doSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={doSearch} style={styles.searchGoBtn}>
              <Text style={styles.searchGoBtnText}>{searching ? '...' : 'Buscar'}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={searchResults}
            keyExtractor={(p) => p.id}
            contentContainerStyle={styles.resultsList}
            ListEmptyComponent={
              query.length > 0 && !searching ? (
                <Text style={styles.empty}>Sin resultados para "{query}".</Text>
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="search" size={40} color={Colors.border} />
                  <Text style={styles.placeholderText}>Busca el producto que deseas vender</Text>
                </View>
              )
            }
            renderItem={({ item }) => {
              const total = item.total_stock ?? 0;
              return (
                <TouchableOpacity onPress={() => openProductModal(item)} activeOpacity={0.8}>
                  <Card style={styles.resultCard}>
                    <View style={styles.resultRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultName}>{item.name}</Text>
                        <Text style={styles.resultSub}>T.{item.size} | {item.color} | {item.gender === 'dama' ? 'Dama' : 'Caballero'}</Text>
                      </View>
                      <View style={styles.resultRight}>
                        <Text style={styles.resultPrice}>S/ {item.sale_price.toFixed(2)}</Text>
                        <Badge
                          label={`${total} pares`}
                          variant={total === 0 ? 'danger' : total <= 3 ? 'warning' : 'success'}
                        />
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            }}
          />
          {cart.length > 0 && (
            <View style={styles.continueBar}>
              <TouchableOpacity style={styles.continueBtn} onPress={() => setStep('cart')}>
                <Text style={styles.continueBtnText}>Ver carrito ({cart.length})</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textInverse} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {step === 'cart' && (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cart}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.cartList}
            ListEmptyComponent={
              <View style={styles.placeholder}>
                <Ionicons name="cart-outline" size={40} color={Colors.border} />
                <Text style={styles.placeholderText}>El carrito está vacío</Text>
                <TouchableOpacity style={styles.goSearchBtn} onPress={() => setStep('search')}>
                  <Text style={styles.goSearchText}>Agregar producto</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item, index }) => (
              <Card style={styles.cartItem}>
                <View style={styles.cartItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartItemName}>{item.product.name}</Text>
                    <Text style={styles.cartItemSub}>T.{item.product.size} | {item.location_name}</Text>
                    <Text style={styles.cartItemPrice}>
                      {item.quantity} × S/ {item.unit_price.toFixed(2)} = S/ {(item.quantity * item.unit_price).toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(index)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </Card>
            )}
            ListFooterComponent={
              cart.length > 0 ? (
                <Card style={styles.totalCard}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>S/ {total.toFixed(2)}</Text>
                  </View>
                </Card>
              ) : null
            }
          />
          <View style={styles.cartActions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep('search')}>
              <Ionicons name="add" size={18} color={Colors.primary} />
              <Text style={styles.secondaryBtnText}>Agregar más</Text>
            </TouchableOpacity>
            {cart.length > 0 && (
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('confirm')}>
                <Text style={styles.primaryBtnText}>Continuar</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textInverse} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {step === 'confirm' && (
        <ScrollView contentContainerStyle={styles.confirmContent}>
          <Card>
            <Text style={styles.sectionTitle}>Resumen</Text>
            {cart.map((item, i) => (
              <View key={i} style={styles.summaryRow}>
                <Text style={styles.summaryItem} numberOfLines={1}>{item.product.name} T.{item.product.size}</Text>
                <Text style={styles.summaryValue}>{item.quantity} × S/ {item.unit_price.toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotal}>TOTAL</Text>
              <Text style={[styles.summaryValue, styles.summaryTotal]}>S/ {total.toFixed(2)}</Text>
            </View>
          </Card>

          <Card>
            <Text style={styles.sectionTitle}>Método de pago</Text>
            <View style={styles.paymentMethods}>
              {(['efectivo', 'yape', 'plin'] as PaymentMethod[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.paymentBtn, paymentMethod === m && styles.paymentBtnActive]}
                  onPress={() => setPaymentMethod(m)}
                >
                  <Ionicons
                    name={m === 'efectivo' ? 'cash-outline' : m === 'yape' ? 'phone-portrait-outline' : 'wallet-outline'}
                    size={22}
                    color={paymentMethod === m ? Colors.textInverse : Colors.primary}
                  />
                  <Text style={[styles.paymentBtnText, paymentMethod === m && styles.paymentBtnTextActive]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Button
            title={`Confirmar venta — S/ ${total.toFixed(2)}`}
            onPress={confirmSale}
            loading={saving}
            size="lg"
            variant="secondary"
          />
          <Button title="Volver" onPress={() => setStep('cart')} variant="ghost" />
        </ScrollView>
      )}

      <Modal visible={productModal !== null} animationType="slide" presentationStyle="pageSheet">
        {productModal && (
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{productModal.name}</Text>
              <TouchableOpacity onPress={() => setProductModal(null)}>
                <Ionicons name="close" size={26} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalSub}>T.{productModal.size} | {productModal.color} | {productModal.gender === 'dama' ? 'Dama' : 'Caballero'}</Text>

              <View style={styles.priceInfo}>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Precio</Text>
                  <Text style={styles.priceValue}>S/ {productModal.sale_price.toFixed(2)}</Text>
                </View>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Precio mínimo</Text>
                  <Text style={[styles.priceValue, { color: Colors.danger }]}>S/ {productModal.min_price.toFixed(2)}</Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Ubicación</Text>
              <View style={styles.segmented}>
                {locations.map((l) => {
                  const inv = (productModal.inventory ?? []).find((i: any) => i.location_id === l.id);
                  const qty = inv?.quantity ?? 0;
                  return (
                    <TouchableOpacity
                      key={l.id}
                      style={[styles.segment, selectedLocationId === l.id && styles.segmentActive, qty === 0 && styles.segmentDisabled]}
                      onPress={() => qty > 0 && setSelectedLocationId(l.id)}
                    >
                      <Text style={[styles.segmentText, selectedLocationId === l.id && styles.segmentTextActive]}>{l.name}</Text>
                      <Text style={[styles.segmentQty, selectedLocationId === l.id && styles.segmentQtyActive]}>{qty} pares</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Precio de venta (S/)</Text>
              <View style={styles.priceInputBox}>
                <Text style={styles.currencySign}>S/</Text>
                <TextInput
                  style={styles.priceInput}
                  value={customPrice}
                  onChangeText={setCustomPrice}
                  keyboardType="decimal-pad"
                  placeholder={productModal.sale_price.toString()}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              {parseFloat(customPrice) < productModal.min_price && customPrice.length > 0 && (
                <Text style={styles.priceError}>
                  Precio por debajo del mínimo (S/ {productModal.min_price.toFixed(2)})
                </Text>
              )}

              <Text style={styles.fieldLabel}>Cantidad</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity((prev) => Math.max(1, parseInt(prev || '1') - 1).toString())}
                >
                  <Ionicons name="remove" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TextInput
                  style={styles.qtyInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity((prev) => (parseInt(prev || '1') + 1).toString())}
                >
                  <Ionicons name="add" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {quantity && customPrice && (
                <View style={styles.subtotalBox}>
                  <Text style={styles.subtotalLabel}>Subtotal</Text>
                  <Text style={styles.subtotalValue}>
                    S/ {(parseInt(quantity || '0') * parseFloat(customPrice || '0')).toFixed(2)}
                  </Text>
                </View>
              )}

              <Button title="Agregar al carrito" onPress={addToCart} size="lg" variant="secondary" />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
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
  cartBadge: {
    backgroundColor: Colors.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: Colors.textInverse, fontWeight: '700', fontSize: FontSize.sm },
  stepRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: Colors.accent },
  stepDotDone: { backgroundColor: Colors.success },
  stepDotText: { color: Colors.textInverse, fontSize: FontSize.sm, fontWeight: '700' },
  stepLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  stepLabelActive: { color: Colors.accent },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingLeft: Spacing.md,
    overflow: 'hidden',
  },
  searchInput: { flex: 1, height: 50, fontSize: FontSize.md, color: Colors.text, paddingHorizontal: Spacing.sm },
  searchGoBtn: { backgroundColor: Colors.primary, height: 50, paddingHorizontal: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  searchGoBtnText: { color: Colors.textInverse, fontWeight: '700', fontSize: FontSize.sm },
  resultsList: { paddingHorizontal: Spacing.md, paddingBottom: 80, gap: Spacing.sm },
  resultCard: { marginBottom: 0 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  resultName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  resultSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  resultRight: { alignItems: 'flex-end', gap: 4 },
  resultPrice: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.accent },
  empty: { textAlign: 'center', color: Colors.textSecondary, padding: Spacing.xl },
  placeholder: { alignItems: 'center', padding: Spacing.xxl, gap: Spacing.md },
  placeholderText: { textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.md },
  continueBar: { padding: Spacing.md, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  continueBtn: { backgroundColor: Colors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: BorderRadius.md, gap: Spacing.sm },
  continueBtnText: { color: Colors.textInverse, fontWeight: '700', fontSize: FontSize.lg },
  cartList: { padding: Spacing.md, gap: Spacing.sm },
  cartItem: { marginBottom: 0 },
  cartItemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cartItemName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  cartItemSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  cartItemPrice: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '700', marginTop: 2 },
  removeBtn: { padding: Spacing.sm },
  totalCard: { marginTop: Spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.accent },
  cartActions: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 52, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.primary },
  secondaryBtnText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.md },
  primaryBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 52, borderRadius: BorderRadius.md, backgroundColor: Colors.accent },
  primaryBtnText: { color: Colors.textInverse, fontWeight: '700', fontSize: FontSize.md },
  confirmContent: { padding: Spacing.md, gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  summaryItem: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  summaryValue: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  summaryTotal: { fontWeight: '900', fontSize: FontSize.md, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  paymentMethods: { flexDirection: 'row', gap: Spacing.sm },
  paymentBtn: {
    flex: 1, alignItems: 'center', gap: 4, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
  },
  paymentBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  paymentBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  paymentBtnTextActive: { color: Colors.textInverse },
  goSearchBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  goSearchText: { color: Colors.textInverse, fontWeight: '700' },
  modalSafe: { flex: 1, backgroundColor: Colors.surface },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, flex: 1 },
  modalContent: { padding: Spacing.lg, gap: Spacing.md },
  modalSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  priceInfo: { flexDirection: 'row', gap: Spacing.sm },
  priceItem: { flex: 1, backgroundColor: Colors.borderLight, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center' },
  priceLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  priceValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  segmented: { flexDirection: 'row', gap: Spacing.sm },
  segment: { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.sm, alignItems: 'center' },
  segmentActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  segmentDisabled: { opacity: 0.4 },
  segmentText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.textInverse },
  segmentQty: { fontSize: FontSize.xs, color: Colors.textMuted },
  segmentQtyActive: { color: 'rgba(255,255,255,0.7)' },
  priceInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, height: 52, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  currencySign: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textSecondary },
  priceInput: { flex: 1, fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  priceError: { color: Colors.danger, fontSize: FontSize.xs, fontWeight: '600' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  qtyInput: { flex: 1, height: 52, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, fontSize: FontSize.xl, fontWeight: '800', color: Colors.text },
  subtotalBox: { backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.md, padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtotalLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  subtotalValue: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.primary },
});
