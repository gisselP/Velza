import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Colors, FontSize, Spacing } from '../constants/theme';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  showStock?: boolean;
}

export function ProductCard({ product, onPress, showStock = true }: ProductCardProps) {
  const totalStock = product.total_stock ?? 0;
  const stockVariant = totalStock === 0 ? 'danger' : totalStock <= 3 ? 'warning' : 'success';
  const stockLabel = totalStock === 0 ? 'Agotado' : totalStock <= 3 ? 'Stock bajo' : 'En stock';

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name="footsteps-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.subtitle}>
              {product.model} — T.{product.size} — {product.color}
            </Text>
            <Text style={styles.code}>Cód: {product.code}</Text>
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.price}>S/ {product.sale_price.toFixed(2)}</Text>
            <Badge
              label={product.gender === 'dama' ? 'Dama' : product.gender === 'caballero' ? 'Caballero' : 'Unisex'}
              variant="info"
            />
          </View>
        </View>
        {showStock && (
          <View style={styles.stockRow}>
            <Badge label={stockLabel} variant={stockVariant} />
            <Text style={styles.stockText}>
              {totalStock} par{totalStock !== 1 ? 'es' : ''}
            </Text>
            {product.inventory?.map((inv) => (
              <Text key={inv.id} style={styles.locationText}>
                {inv.location?.name}: {inv.quantity}
              </Text>
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 1 },
  code: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  priceBox: { alignItems: 'flex-end', gap: 4 },
  price: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.accent },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    flexWrap: 'wrap',
  },
  stockText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  locationText: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
