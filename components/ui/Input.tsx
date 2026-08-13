import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secureEntry?: boolean;
}

export function Input({ label, error, icon, secureEntry, style, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        {icon && (
          <Ionicons name={icon} size={20} color={Colors.textSecondary} style={styles.icon} />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secureEntry && !showPassword}
          {...props}
        />
        {secureEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 50,
    paddingHorizontal: Spacing.md,
  },
  inputError: { borderColor: Colors.danger },
  icon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  eyeIcon: { padding: Spacing.xs },
  errorText: { fontSize: FontSize.xs, color: Colors.danger },
});
