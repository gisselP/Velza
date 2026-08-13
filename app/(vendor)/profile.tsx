import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/theme';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0).toUpperCase() ?? 'V'}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.full_name}</Text>
          <Text style={styles.role}>Vendedor</Text>
        </View>

        <Card style={styles.infoCard}>
          <InfoRow icon="person-outline" label="Nombre completo" value={profile?.full_name ?? '-'} />
          <InfoRow icon="shield-checkmark-outline" label="Rol" value="Vendedor" />
        </Card>

        <Card style={styles.appCard}>
          <View style={styles.appInfo}>
            <View style={styles.appLogoBox}>
              <Ionicons name="footsteps" size={28} color={Colors.textInverse} />
            </View>
            <View>
              <Text style={styles.appName}>VELZA</Text>
              <Text style={styles.appVersion}>Versión 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.appDesc}>Sistema de ventas e inventario para calzado</Text>
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
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
  content: { padding: Spacing.lg, gap: Spacing.md },
  avatarBox: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: Colors.textInverse },
  name: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  role: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  infoCard: { gap: Spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
  infoValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  appCard: { gap: Spacing.sm },
  appInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  appLogoBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, letterSpacing: 2 },
  appVersion: { fontSize: FontSize.xs, color: Colors.textMuted },
  appDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: BorderRadius.md,
    height: 52,
  },
  logoutText: { color: Colors.danger, fontSize: FontSize.md, fontWeight: '700' },
});
