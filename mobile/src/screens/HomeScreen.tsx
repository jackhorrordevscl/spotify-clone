// mobile/src/screens/HomeScreen.tsx
// Pantalla principal — equivalente a frontend/src/pages/HomePage.tsx
// Diferencias clave vs web:
//   - FlatList en lugar de grid CSS (maneja virtualización y scroll nativo)
//   - numColumns={2} para el grid de 2 columnas
//   - Modal de RN en lugar del UploadSongModal (subir desde mobile es diferente)
//   - Image de RN en lugar de <img>
//   - No hay hover — se usa TouchableOpacity con activeOpacity

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl, // Para el pull-to-refresh (deslizar hacia abajo para recargar)
  Dimensions, // Para calcular el ancho de cada card dinámicamente
} from "react-native";

import { Ionicons } from "@expo/vector-icons"; // Íconos equivalentes a lucide-react

import { useAuthStore } from "../store/authStore";
import { usePlayerStore } from "../store/playerStore";
import { useLikedStore } from "../store/likedStore";
import api from "../api/api";
import type { Song } from "../types";

// Obtenemos el ancho de la pantalla para calcular el tamaño de las cards
// Así funcionan igual en cualquier tamaño de pantalla
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 2 columnas, con 16px de padding a cada lado y 12px de gap entre columnas
const CARD_WIDTH = (SCREEN_WIDTH - 32 - 12) / 2;

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

// Formatea segundos a m:ss — misma función que en el frontend
const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// =============================================
// SongCard — componente interno de esta pantalla
// En web era un archivo separado, aquí lo mantenemos
// junto porque depende de CARD_WIDTH calculado arriba
// =============================================
function SongCard({ song, queue }: { song: Song; queue: Song[] }) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const { isLiked, likeSong, unlikeSong } = useLikedStore();

  const isCurrentSong = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  const handlePress = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        // Resalta la card si es la canción actual
        isCurrentSong && styles.cardActive,
      ]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      {/* ===== COVER ===== */}
      <View style={styles.coverContainer}>
        {song.coverUrl ? (
          // Image de RN requiere width y height explícitos (no como <img> en web)
          <Image
            source={{ uri: song.coverUrl }}
            style={styles.cover}
            // resizeMode='cover' equivale a object-fit: cover en CSS
            resizeMode="cover"
          />
        ) : (
          // Placeholder cuando no hay cover
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverPlaceholderIcon}>♪</Text>
          </View>
        )}

        {/* Overlay con botón play/pause — visible siempre en mobile
            (en web era solo al hacer hover, en mobile no hay hover) */}
        <View style={styles.coverOverlay}>
          <View style={styles.playButton}>
            <Ionicons
              name={isCurrentSong && isPlaying ? "pause" : "play"}
              size={18}
              color="#080d12"
              // El ícono play tiene un pequeño offset visual para verse centrado
              style={{ marginLeft: isCurrentSong && isPlaying ? 0 : 2 }}
            />
          </View>
        </View>
      </View>

      {/* ===== INFO ===== */}
      <View style={styles.cardInfo}>
        {/* Fila: título + botón like */}
        <View style={styles.cardTitleRow}>
          <Text
            style={[styles.cardTitle, isCurrentSong && styles.cardTitleActive]}
            numberOfLines={1} // Equivalente a truncate en Tailwind
          >
            {song.title}
          </Text>

          {/* Botón like — TouchableOpacity con stopPropagation implícito
              (en RN los toques no hacen bubbling como en web) */}
          <TouchableOpacity
            onPress={() => (liked ? unlikeSong(song.id) : likeSong(song.id))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            // hitSlop amplía el área tocable sin cambiar el tamaño visual
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={16}
              color={liked ? colors.accent : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardAuthor} numberOfLines={1}>
          {song.author.name}
        </Text>

        <Text style={styles.cardDuration}>{formatDuration(song.duration)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// =============================================
// SongCardSkeleton — placeholder de carga
// Equivale al div animate-pulse del frontend
// =============================================
function SongCardSkeleton() {
  return (
    <View style={styles.skeleton}>
      <View style={styles.skeletonCover} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
      </View>
    </View>
  );
}

// =============================================
// HomeScreen — componente principal
// =============================================
export default function HomeScreen() {
  const { user } = useAuthStore();
  const { fetchLiked } = useLikedStore();

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
    // Cargar liked songs al entrar a la pantalla
    // (en web se hacía en App.tsx al cambiar el token)
    fetchLiked();
  }, [fetchSongs, fetchLiked]);

  // Pull-to-refresh: deslizar hacia abajo recarga las canciones
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSongs();
  };

  // ===== RENDER DE CADA ITEM DEL GRID =====
  // FlatList requiere este formato — no se puede poner JSX directamente
  const renderSong = ({ item }: { item: Song }) => (
    <SongCard song={item} queue={songs} />
  );

  // keyExtractor le dice a FlatList cómo identificar cada item únicamente
  // Equivale al key={song.id} que usamos en el .map() del frontend
  const keyExtractor = (item: Song) => item.id;

  // ===== HEADER DEL FLATLIST =====
  // ListHeaderComponent se renderiza encima de todos los items del grid
  // Es la forma correcta de poner un header dentro de un FlatList
  const ListHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Bienvenido, {user?.name} 👋</Text>
        <Text style={styles.subtitle}>¿Qué quieres escuchar hoy?</Text>
      </View>

      <Text style={styles.sectionTitle}>Todas las canciones</Text>
    </View>
  );

  // ===== ESTADO VACÍO =====
  const ListEmpty = () => {
    if (isLoading) return null; // El skeleton se maneja aparte

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>♪</Text>
        <Text style={styles.emptyText}>No hay canciones disponibles aún</Text>
      </View>
    );
  };

  // ===== SKELETON MIENTRAS CARGA =====
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenido, {user?.name} 👋</Text>
            <Text style={styles.subtitle}>¿Qué quieres escuchar hoy?</Text>
          </View>
          <Text style={styles.sectionTitle}>Todas las canciones</Text>
        </View>

        {/* Grid de skeletons — 6 placeholders mientras carga */}
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SongCardSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  // ===== ERROR =====
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSongs}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ===== RENDER PRINCIPAL =====
  return (
    <View style={styles.container}>
      {/* FlatList maneja el scroll y la virtualización del grid
          Es obligatorio usar FlatList (o ScrollView) para listas largas en RN
          — nunca mapear elementos dentro de un ScrollView sin virtualizarlos */}
      <FlatList
        data={songs}
        renderItem={renderSong}
        keyExtractor={keyExtractor}
        // Grid de 2 columnas
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        // Header con el saludo y título de sección
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        // Pull-to-refresh nativo
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            // tintColor es el color del spinner de refresh (iOS)
            tintColor={colors.accent}
            colors={[colors.accent]} // Android
          />
        }
        contentContainerStyle={styles.listContent}
        // showsVerticalScrollIndicator oculta la barra de scroll
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },

  // contentContainerStyle afecta al contenido dentro del scroll (no al FlatList en sí)
  listContent: {
    padding: 16,
    paddingBottom: 100, // Espacio para que el Player no tape la última card
    gap: 20,
  },

  header: {
    gap: 20,
    marginBottom: 4,
  },

  greeting: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },

  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
  },

  // Espacio entre columnas del grid
  columnWrapper: {
    gap: 12,
  },

  // ===== CARD =====
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden", // Para que el cover respete el borderRadius de la card
    padding: 10,
    gap: 10,
  },

  cardActive: {
    backgroundColor: colors.bgTertiary,
    borderColor: colors.accent,
  },

  coverContainer: {
    width: "100%",
    // aspectRatio: 1 hace que el alto sea igual al ancho (cuadrado)
    // Equivale a aspect-ratio: 1/1 en CSS
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.bgTertiary,
  },

  cover: {
    width: "100%",
    height: "100%",
  },

  coverPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  coverPlaceholderIcon: {
    fontSize: 32,
    color: colors.accent,
  },

  // Overlay semitransparente sobre el cover con el botón play
  coverOverlay: {
    // StyleSheet.absoluteFillObject es equivalente a position: absolute; inset: 0
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 13, 18, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },

  cardInfo: {
    gap: 3,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 4,
  },

  cardTitle: {
    flex: 1, // Ocupa el espacio disponible dejando lugar al ícono de like
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },

  cardTitleActive: {
    color: colors.accent,
  },

  cardAuthor: {
    color: colors.textSecondary,
    fontSize: 11,
  },

  cardDuration: {
    color: colors.textMuted,
    fontSize: 11,
  },

  // ===== SKELETON =====
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },

  skeleton: {
    width: CARD_WIDTH,
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    padding: 10,
    gap: 10,
  },

  skeletonCover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: colors.bgTertiary,
  },

  skeletonInfo: {
    gap: 6,
  },

  skeletonLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bgTertiary,
    width: "75%",
  },

  skeletonLineShort: {
    width: "50%",
  },

  // ===== EMPTY STATE =====
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },

  emptyIcon: {
    fontSize: 40,
    color: colors.textMuted,
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  // ===== ERROR =====
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  errorText: {
    color: colors.error,
    fontSize: 14,
  },

  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.bgTertiary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  retryText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
});
