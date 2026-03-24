// mobile/src/screens/HomeScreen.tsx
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import { useLikedStore } from "../store/likedStore";
import api from "../api/api";
import SongCard, { useCardWidth } from "../components/SongCard";
import type { Song } from "../types";
import { colors } from "../theme/colors";

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
  const { width } = useWindowDimensions();

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
  }, [fetchSongs, fetchLiked]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSongs();
  };

  const renderSong = ({ item }: { item: Song }) => (
    <SongCard song={item} queue={songs} variant="grid" />
  );

  // El Header ahora tiene su propio fondo que llega hasta arriba
  const TopHeader = () => (
    <View style={styles.headerBackground}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Bienvenido, {user?.name} 👋</Text>
          <Text style={styles.subtitle}>¿Qué quieres escuchar hoy?</Text>
        </View>
      </SafeAreaView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 1. Header persistente con fondo que toca el borde superior del sistema */}
      <TopHeader />

      {isLoading ? (
        <View style={styles.flex1}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Todas las canciones</Text>
          </View>
          <View style={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SongCardSkeleton key={i} />
            ))}
          </View>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSongs}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderSong}
          keyExtractor={(item) => item.id}
          numColumns={2}
          key={width}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={() => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Todas las canciones</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>♪</Text>
              <Text style={styles.emptyText}>
                No hay canciones disponibles aún
              </Text>
            </View>
          }
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  flex1: {
    flex: 1,
  },
  // ESTO ES LO QUE BUSCABAS: El fondo claro que sube hasta la Status Bar
  headerBackground: {
    backgroundColor: colors.bgSecondary, // Color del logo/header
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 4,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 130, // Espacio para el MiniPlayer
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
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
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
