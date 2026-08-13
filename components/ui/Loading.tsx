import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { Colors, FontSize } from '../../constants/theme';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ text = 'Cargando...', fullScreen = false }: LoadingProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
});
