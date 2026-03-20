// mobile/src/navigation/AppNavigator.tsx
// Define toda la estructura de navegación de la app
// Equivale a las <Routes> de React Router en el frontend
//
// Estructura:
//   AuthStack  → Login, Register  (si no hay token)
//   MainStack  → Tab Navigator con Home, Search, Library
//                + PlaylistScreen encima del tab (modal-style)

import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../store/authStore";

// Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import LibraryScreen from "../screens/LibraryScreen";
import PlaylistScreen from "../screens/PlaylistScreen";

// Paleta Arctic
const colors = {
  bgPrimary: "#080d12",
  bgSecondary: "#0d1520",
  accent: "#00b4d8",
  textMuted: "#3d6478",
  border: "#1e3448",
};

// ─── TIPOS DE RUTAS ──────────────────────────────────────
// Permite que TypeScript valide los parámetros de navegación
// undefined = la ruta no recibe params
// { id: string } = la ruta requiere ese param

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  Playlist: { id: string; title: string };
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
};

// ─── NAVIGATORS ──────────────────────────────────────────
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ─── TAB NAVIGATOR ───────────────────────────────────────
// Las 3 tabs principales: Home, Search, Library
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Sin header nativo — cada screen maneja su propio título
        headerShown: false,

        // Estilo de la barra de tabs (paleta Arctic)
        tabBarStyle: {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          // Altura extra para el home indicator de iPhone
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },

        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 2,
        },

        // Ícono de cada tab según la ruta activa/inactiva
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else {
            iconName = focused ? "library" : "library-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Inicio" }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarLabel: "Buscar" }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ tabBarLabel: "Biblioteca" }}
      />
    </Tab.Navigator>
  );
}

// ─── AUTH STACK ──────────────────────────────────────────
// Login y Register — sin header, sin gestos de retroceso en Login
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// ─── MAIN STACK ──────────────────────────────────────────
// Tabs + PlaylistScreen encima (push desde Library)
function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {/* Tabs es la pantalla raíz del stack principal */}
      <MainStack.Screen name="Tabs" component={TabNavigator} />

      {/* PlaylistScreen se abre encima de las tabs con animación de push */}
      <MainStack.Screen
        name="Playlist"
        component={PlaylistScreen}
        options={{
          // Animación de slide desde la derecha (nativa en iOS/Android)
          animation: "slide_from_right",
        }}
      />
    </MainStack.Navigator>
  );
}

// ─── ROOT NAVIGATOR ──────────────────────────────────────
// Decide si mostrar Auth o Main según el estado del token
export default function AppNavigator() {
  const { token, loadUser, isLoading } = useAuthStore();

  // Al montar la app, intentar restaurar la sesión guardada
  useEffect(() => {
    loadUser();
  }, []);

  // Mientras loadUser verifica el token, mostrar un spinner
  // Evita el flash de la pantalla de Login antes de redirigir a Main
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgPrimary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    // NavigationContainer es el contexto raíz — debe envolver todo
    <NavigationContainer>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
