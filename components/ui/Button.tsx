import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? Colors.primary : Colors.textInverse}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.accent },
  danger: { backgroundColor: Colors.danger },
  ghost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
  success: { backgroundColor: Colors.success },
  disabled: { opacity: 0.5 },

  size_sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm - 2, minHeight: 36 },
  size_md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, minHeight: 48 },
  size_lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, minHeight: 56 },

  text: { fontWeight: '600', color: Colors.textInverse },
  text_ghost: { color: Colors.primary },
  text_primary: { color: Colors.textInverse },
  text_secondary: { color: Colors.textInverse },
  text_danger: { color: Colors.textInverse },
  text_success: { color: Colors.textInverse },

  textSize_sm: { fontSize: FontSize.sm },
  textSize_md: { fontSize: FontSize.md },
  textSize_lg: { fontSize: FontSize.lg },
});
