// mobile/src/screens/RegisterScreen.tsx

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";
import type { AuthStackParamList } from "../navigation/AppNavigator";
import { colors } from "../theme/colors";

type RegisterNavProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Register"
>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavProp>();
  const { register, isLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      await register(name.trim(), email.trim(), password);
      // AppNavigator redirige automáticamente al detectar token
    } catch {
      Alert.alert(
        "Error",
        "No se pudo crear la cuenta. El email puede estar en uso.",
      );
    }
  };

  const inputStyle = (field: string) => [
    styles.input,
    focused === field && styles.inputFocused,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>A</Text>
          </View>
          <Text style={styles.title}>Crear cuenta</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={inputStyle("name")}
              placeholder="Tu nombre"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={inputStyle("email")}
              placeholder="tu@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={inputStyle("password")}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#080d12" size="small" />
            ) : (
              <Text style={styles.buttonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoContainer: { alignItems: "center", marginBottom: 28, gap: 10 },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  logoLetter: { color: "#080d12", fontSize: 22, fontWeight: "700" },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: "700" },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.bgSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    gap: 16,
  },
  fieldGroup: { gap: 6 },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: "500" },
  input: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: colors.textPrimary,
    fontSize: 14,
  },
  inputFocused: { borderColor: colors.accent },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#080d12", fontSize: 14, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: colors.textMuted, fontSize: 12 },
  footerLink: { color: colors.accent, fontSize: 12, fontWeight: "500" },
});
