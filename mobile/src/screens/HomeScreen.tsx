// mobile/src/screens/HomeScreen.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import api from "../api/api";
import SongCard, { useCardWidth } from "../components/SongCard";
import type { Song } from "../types";
import { colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

// Componente local para el Skeleton con altura fija
function SongCardSkeleton() {
  const cardWidth = useCardWidth();
  return (
    <View style={[styles.cardBase, { width: cardWidth, height: 230 }]}>
      <View style={styles.skeletonCover} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: "50%" }]} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Datos ficticios para mostrar 6 skeletons durante la carga
  const skeletonData = useMemo(
    () => Array.from({ length: 6 }).map((_, i) => ({ id: `sk-${i}` })),
    [],
  );

  const fetchSongs = useCallback(async () => {
    try {
      const { data } = await api.get("/songs");
      setSongs(data);
    } catch (e) {
      console.error("Error fetching songs:", e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hola, {user?.name || "Usuario"}</Text>
        <Text style={styles.subtitle}>¿Qué quieres escuchar hoy?</Text>
      </View>
      <Text style={styles.sectionTitle}>Canciones para ti</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={isLoading ? skeletonData : songs}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          isLoading ? (
            <SongCardSkeleton />
          ) : (
            <SongCard song={item as Song} queue={songs} />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              fetchSongs();
            }}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="musical-notes-outline"
                size={48}
                color={colors.textMuted}
              />
              <Text style={styles.emptyText}>No hay canciones disponibles</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  listContent: { paddingBottom: 120 },
  header: { padding: 16, gap: 16 },
  greeting: { color: colors.textPrimary, fontSize: 24, fontWeight: "bold" },
  subtitle: { color: colors.textSecondary, fontSize: 14 },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cardBase: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 14,
    padding: 10,
    gap: 8,
  },
  skeletonCover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: colors.bgTertiary,
  },
  skeletonInfo: { gap: 8, marginTop: 4 },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.bgTertiary,
    width: "80%",
  },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: colors.textMuted, marginTop: 8 },
});
