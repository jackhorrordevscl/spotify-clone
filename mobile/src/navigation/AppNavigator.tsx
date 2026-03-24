// mobile/src/navigation/AppNavigator.tsx
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "../store/authStore";
import { usePlaylistStore } from "../store/playlistStore";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import LibraryScreen from "../screens/LibraryScreen";
import PlaylistScreen from "../screens/PlaylistScreen";
import MiniPlayer from "../components/MiniPlayer";
import { colors } from "../theme/colors";

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

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ─── BOTÓN DE USUARIO EN EL HEADER ───────────────────────
// Se renderiza como headerRight en todas las tabs
function UserMenuButton() {
  const { user, logout } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", `¿Deseas salir de tu cuenta, ${user?.name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          setVisible(false);
          await logout();
        },
      },
    ]);
  };

  return (
    <>
      {/* Avatar circular — el botón hamburguesa */}
      <TouchableOpacity
        style={menuStyles.trigger}
        onPress={() => setVisible(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={menuStyles.avatar}>
          <Text style={menuStyles.avatarLetter}>
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Modal del menú de usuario */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        {/* Tocar fuera cierra el menú */}
        <TouchableOpacity
          style={menuStyles.backdrop}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          {/* Posicionado debajo del header */}
          <View style={[menuStyles.menu, { top: insets.top + 56, right: 12 }]}>
            {/* Info del usuario */}
            <View style={menuStyles.userRow}>
              <View style={menuStyles.menuAvatar}>
                <Text style={menuStyles.menuAvatarLetter}>
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={menuStyles.userName} numberOfLines={1}>
                  {user?.name}
                </Text>
                <Text style={menuStyles.userEmail} numberOfLines={1}>
                  {user?.email}
                </Text>
              </View>
            </View>

            <View style={menuStyles.divider} />

            {/* Cerrar sesión */}
            <TouchableOpacity
              style={menuStyles.menuItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={18} color="#f87171" />
              <Text style={menuStyles.menuItemDanger}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const menuStyles = StyleSheet.create({
  trigger: {
    marginRight: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menu: {
    position: "absolute",
    width: 230,
    backgroundColor: colors.bgSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  menuAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bgTertiary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  menuAvatarLetter: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "700",
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  menuItemDanger: {
    color: "#f87171",
    fontSize: 14,
    fontWeight: "500",
  },
});

// ─── TAB NAVIGATOR ────────────────────────────────────────
function TabNavigator() {
  // ✅ Obtener insets del Safe Area Context para Android
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.bgSecondary,
        },
        headerTitle: "Arctic",
        headerTitleStyle: {
          color: colors.accent,
          fontSize: 20,
          fontWeight: "700",
        },
        headerRight: () => <UserMenuButton />,
        headerShadowVisible: false,

        // ✅ CORRECCIÓN ANDROID: Tab bar respeta el navigation bar del sistema
        // Usando insets.bottom para agregar espacio y posicionar correctamente
        tabBarStyle: {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 4,
          paddingBottom: insets.bottom + 4, // ✅ Safe area bottom + padding
          height: 56 + insets.bottom, // ✅ Altura ajustada con inset
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 2,
          marginBottom: 4, // ✅ Espaciar texto del ícono
        },
        tabBarIcon: ({ focused, color }) => {
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

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  const { fetchPlaylists } = usePlaylistStore();

  // Cargar playlists al entrar a la app autenticada
  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        <MainStack.Screen name="Tabs" component={TabNavigator} />
        <MainStack.Screen
          name="Playlist"
          component={PlaylistScreen}
          options={{ animation: "slide_from_right" }}
        />
      </MainStack.Navigator>
      {/* ✅ CORRECCIÓN: MiniPlayer montado UNA SOLA VEZ a nivel global */}
      {/* Esto evita múltiples instancias de useAudioPlayer que reproducen audio doblemente */}
      <MiniPlayer />
    </View>
  );
}

export default function AppNavigator() {
  const { token, loadUser, isLoading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

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
    <NavigationContainer>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
