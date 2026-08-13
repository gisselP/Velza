import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Colors, FontSize, Spacing } from '../constants/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(40)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(formOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, { toValue: 1.18, duration: 900, useNativeDriver: true }),
        Animated.timing(iconPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Correo inválido';
    if (!password.trim()) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    console.log('handleLogin called', { email, password });
    if (!validate()) {
      console.log('validation failed', errors);
      return;
    }
    console.log('validation passed, calling signIn...');
    setLoading(true);
    const { error } = await signIn(email.trim().toLowerCase(), password);
    console.log('signIn result:', { error });
    setLoading(false);
    if (error) {
      Alert.alert('Error de acceso', 'Correo o contraseña incorrectos. Verifica tus datos.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.logoBox, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <Animated.View style={[styles.logoIcon, { transform: [{ scale: iconPulse }] }]}>
              <Ionicons name="footsteps" size={40} color={Colors.textInverse} />
            </Animated.View>
            <Text style={styles.logoText}>VELZA</Text>
            <Text style={styles.tagline}>Sistema de Ventas e Inventario</Text>
          </Animated.View>

          <Animated.View style={[styles.form, { opacity: formOpacity, transform: [{ translateY: formSlide }] }]}>
            <Text style={styles.formTitle}>Iniciar sesión</Text>

            <Input
              label="Correo electrónico"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
              error={errors.email}
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              secureEntry
              error={errors.password}
            />

            <Button
              title="Ingresar"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.loginBtn}
            />
          </Animated.View>

          <Text style={styles.footer}>
            VELZA © 2025 — Todos los derechos reservados
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  logoBox: { alignItems: 'center', gap: Spacing.sm },
  logoIcon: {
    width: 88,
    height: 88,
    backgroundColor: Colors.accent,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.textInverse,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  formTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  loginBtn: { marginTop: Spacing.xs },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.4)',
  },
});
