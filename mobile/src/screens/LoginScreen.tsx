// mobile/src/screens/LoginScreen.tsx
// Pantalla de login — equivalente a frontend/src/pages/LoginPage.tsx
// Diferencias clave vs web:
//   - View/Text/TextInput/TouchableOpacity en lugar de div/p/input/button
//   - StyleSheet en lugar de Tailwind/CSS
//   - KeyboardAvoidingView para que el teclado no tape los inputs
//   - No hay React Router — la navegación es por props de React Navigation

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

// Tipos de navegación — NativeStackNavigationProp viene de @react-navigation/native-stack
// 'Login' y 'Main' son las rutas definidas en AppNavigator.tsx
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { useAuthStore } from "../store/authStore";

// Tipo del stack de rutas para que TypeScript sepa a dónde podemos navegar
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};
type LoginNavProp = NativeStackNavigationProp<RootStackParamList, "Login">;

// Paleta Arctic — mismos valores que index.css del frontend
const colors = {
  bgPrimary: "#080d12",
  bgSecondary: "#0d1520",
  bgTertiary: "#162030",
  accent: "#00b4d8",
  textPrimary: "#f0f9ff",
  textSecondary: "#7eb8cc",
  textMuted: "#3d6478",
  border: "#1e3448",
  error: "#f87171",
};

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Foco activo para cambiar el color del borde del input (igual que onFocus en web)
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(
    null,
  );

  const handleLogin = async () => {
    // Validación básica antes de llamar a la API
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      await login(email.trim(), password);
      // Si el login es exitoso, el authStore actualiza el token
      // AppNavigator detecta el cambio y redirige a Main automáticamente
    } catch {
      Alert.alert("Error", "Email o contraseña incorrectos");
    }
  };

  return (
    // KeyboardAvoidingView sube el contenido cuando aparece el teclado virtual
    // behavior='padding' funciona bien en Android; en iOS se usa 'padding' también
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Centrar verticalmente el card */}
      <View style={styles.inner}>
        {/* ===== LOGO ===== */}
        <View style={styles.logoContainer}>
          {/* Círculo con la letra A — igual que en el frontend */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>A</Text>
          </View>
          <Text style={styles.title}>Iniciar sesión</Text>
        </View>

        {/* ===== CARD ===== */}
        <View style={styles.card}>
          {/* ===== INPUT EMAIL ===== */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                // Cambia el borde cuando está enfocado — igual que onFocus en web
                focusedInput === "email" && styles.inputFocused,
              ]}
              placeholder="tu@email.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              // keyboardType muestra el teclado optimizado para email
              keyboardType="email-address"
              // autoCapitalize evita que RN capitalice la primera letra
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* ===== INPUT CONTRASEÑA ===== */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "password" && styles.inputFocused,
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              // secureTextEntry oculta el texto — equivalente a type="password"
              secureTextEntry
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* ===== BOTÓN LOGIN ===== */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            // Deshabilitar mientras carga para evitar doble submit
            disabled={isLoading}
            // activeOpacity da feedback visual al presionar (equivalente a hover)
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#080d12" size="small" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* ===== LINK A REGISTRO ===== */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.footerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },

  // flex: 1 + justifyContent: 'center' centra verticalmente
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // paddingHorizontal da margen lateral en pantallas pequeñas
    paddingHorizontal: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 28,
    gap: 10,
  },

  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26, // la mitad del width/height = círculo perfecto
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },

  logoLetter: {
    color: "#080d12",
    fontSize: 22,
    fontWeight: "700",
  },

  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },

  // El card ocupa el ancho completo con un máximo de 400px
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.bgSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    gap: 16, // gap entre hijos directos — equivalente a flex flex-col gap-4
  },

  fieldGroup: {
    gap: 6,
  },

  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },

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

  // Se aplica junto con input cuando el campo está enfocado
  inputFocused: {
    borderColor: colors.accent,
  },

  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#080d12",
    fontSize: 14,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  footerText: {
    color: colors.textMuted,
    fontSize: 12,
  },

  footerLink: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "500",
  },
});
