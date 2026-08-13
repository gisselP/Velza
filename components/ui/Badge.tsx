import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/theme';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  success: { backgroundColor: '#d4edda' },
  danger: { backgroundColor: '#f8d7da' },
  warning: { backgroundColor: '#fff3cd' },
  info: { backgroundColor: '#cce5ff' },
  neutral: { backgroundColor: Colors.borderLight },

  text: { fontSize: FontSize.xs, fontWeight: '600' },
  text_success: { color: '#155724' },
  text_danger: { color: '#721c24' },
  text_warning: { color: '#856404' },
  text_info: { color: '#004085' },
  text_neutral: { color: Colors.textSecondary },
});
