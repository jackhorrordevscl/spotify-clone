// mobile/src/screens/HomeScreen.tsx
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  useWindowDimensions, // Responsive al rotar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { useLikedStore } from "../store/likedStore";
import api from "../api/api";
import SongCard, { useCardWidth } from "../components/SongCard";
import MiniPlayer from "../components/MiniPlayer";
import type { Song } from "../types";

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

function SongCardSkeleton() {
  const cardWidth = useCardWidth();
  return (
    <View style={[styles.skeleton, { width: cardWidth }]}>
      <View style={styles.skeletonCover} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { fetchLiked } = useLikedStore();
  const { width } = useWindowDimensions(); // Para recalcular el grid al rotar

  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchSongs = useCallback(async () => {
    try {
      const { data } = await api.get("/songs");
      setSongs(data);
      setError("");
    } catch {
      setError("No se pudieron cargar las canciones");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
    fetchLiked();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSongs();
  };

  const renderSong = ({ item }: { item: Song }) => (
    <SongCard song={item} queue={songs} variant="grid" />
  );

  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.greeting}>Bienvenido, {user?.name} 👋</Text>
      <Text style={styles.subtitle}>¿Qué quieres escuchar hoy?</Text>
      <Text style={styles.sectionTitle}>Todas las canciones</Text>
    </View>
  );

  const ListEmpty = () =>
    isLoading ? null : (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>♪</Text>
        <Text style={styles.emptyText}>No hay canciones disponibles aún</Text>
      </View>
    );

  // CORRECCIÓN: estructura flex en vez de paddingBottom en el FlatList
  // container: flex:1 → ocupa todo el espacio disponible entre header y tab bar
  // MiniPlayer va FUERA del FlatList, después de él, así siempre es visible
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {isLoading ? (
        <>
          <View style={styles.header}>
            <Text style={styles.greeting}>Bienvenido, {user?.name} 👋</Text>
            <Text style={styles.subtitle}>¿Qué quieres escuchar hoy?</Text>
            <Text style={styles.sectionTitle}>Todas las canciones</Text>
          </View>
          <View style={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SongCardSkeleton key={i} />
            ))}
          </View>
        </>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSongs}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // FlatList ocupa todo el espacio restante gracias a flex: 1 del container
        <FlatList
          data={songs}
          renderItem={renderSong}
          keyExtractor={(item) => item.id}
          numColumns={2}
          // key={width} fuerza recrear el FlatList al cambiar orientación
          // sin esto numColumns no se recalcula correctamente
          key={width}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* MiniPlayer SIEMPRE al fondo, fuera del scroll */}
      <MiniPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 16,
    gap: 12,
  },
  header: {
    gap: 8,
    padding: 16,
    paddingBottom: 4,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 8,
  },
  columnWrapper: {
    gap: 12,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  skeleton: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 14,
    padding: 10,
    gap: 8,
  },
  skeletonCover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 9,
    backgroundColor: colors.bgTertiary,
  },
  skeletonInfo: { gap: 6 },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bgTertiary,
    width: "75%",
  },
  skeletonLineShort: { width: "50%" },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: { fontSize: 40, color: colors.textMuted },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorText: { color: colors.error, fontSize: 14 },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.bgTertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: { color: colors.textPrimary, fontSize: 14 },
});
