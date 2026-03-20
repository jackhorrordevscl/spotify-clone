// mobile/src/components/SongCard.tsx
// Componente reutilizable usado en Home, Search y PlaylistScreen
// Tiene dos variantes de layout:
//   grid   → card cuadrada con cover grande (HomeScreen, SearchScreen)
//   list   → fila horizontal (PlaylistScreen)

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayerStore } from "../store/playerStore";
import { useLikedStore } from "../store/likedStore";
import type { Song } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Ancho de card en modo grid: 2 columnas con 16px padding y 12px gap
export const CARD_WIDTH = (SCREEN_WIDTH - 32 - 12) / 2;

const colors = {
  bgSecondary: "#0d1520",
  bgTertiary: "#162030",
  accent: "#00b4d8",
  textPrimary: "#f0f9ff",
  textSecondary: "#7eb8cc",
  textMuted: "#3d6478",
  border: "#1e3448",
};

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

interface Props {
  song: Song;
  queue: Song[];
  // variant controla el layout
  // 'grid' = card cuadrada (Home/Search), 'list' = fila (Playlist)
  variant?: "grid" | "list";
  // Índice visible en modo list (número de orden en la playlist)
  index?: number;
}

export default function SongCard({
  song,
  queue,
  variant = "grid",
  index,
}: Props) {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const { isLiked, likeSong, unlikeSong } = useLikedStore();

  const isCurrentSong = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  const handlePress = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      // Pasa toda la queue para que playNext/playPrev funcionen
      playSong(song, queue);
    }
  };

  const handleLike = () => {
    liked ? unlikeSong(song.id) : likeSong(song.id);
  };

  // ─── VARIANTE LIST (PlaylistScreen) ──────────────────
  if (variant === "list") {
    return (
      <TouchableOpacity
        style={[styles.listRow, isCurrentSong && styles.listRowActive]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Número de orden o ícono de reproduciendo */}
        <View style={styles.listIndex}>
          {isCurrentSong && isPlaying ? (
            <Ionicons name="musical-note" size={14} color={colors.accent} />
          ) : (
            <Text style={styles.listIndexText}>{(index ?? 0) + 1}</Text>
          )}
        </View>

        {/* Cover pequeño */}
        <View style={styles.listCover}>
          {song.coverUrl ? (
            <Image
              source={{ uri: song.coverUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="musical-note" size={16} color={colors.accent} />
          )}
        </View>

        {/* Info */}
        <View style={styles.listInfo}>
          <Text
            style={[styles.listTitle, isCurrentSong && styles.activeText]}
            numberOfLines={1}
          >
            {song.title}
          </Text>
          <Text style={styles.listAuthor} numberOfLines={1}>
            {song.author.name}
          </Text>
        </View>

        {/* Duración */}
        <Text style={styles.listDuration}>{formatDuration(song.duration)}</Text>

        {/* Botón like */}
        <TouchableOpacity
          onPress={handleLike}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={16}
            color={liked ? colors.accent : colors.textMuted}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // ─── VARIANTE GRID (Home / Search) ───────────────────
  return (
    <TouchableOpacity
      style={[styles.gridCard, isCurrentSong && styles.gridCardActive]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      {/* Cover */}
      <View style={styles.gridCover}>
        {song.coverUrl ? (
          <Image
            source={{ uri: song.coverUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.gridCoverPlaceholder}>
            <Text style={{ fontSize: 28 }}>♪</Text>
          </View>
        )}

        {/* Overlay con play/pause — siempre visible en mobile */}
        <View style={styles.gridOverlay}>
          <View style={styles.gridPlayBtn}>
            <Ionicons
              name={isCurrentSong && isPlaying ? "pause" : "play"}
              size={16}
              color="#080d12"
              style={{ marginLeft: isCurrentSong && isPlaying ? 0 : 2 }}
            />
          </View>
        </View>
      </View>

      {/* Info */}
      <View style={styles.gridInfo}>
        <View style={styles.gridTitleRow}>
          <Text
            style={[styles.gridTitle, isCurrentSong && styles.activeText]}
            numberOfLines={1}
          >
            {song.title}
          </Text>
          <TouchableOpacity
            onPress={handleLike}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={14}
              color={liked ? colors.accent : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.gridAuthor} numberOfLines={1}>
          {song.author.name}
        </Text>
        <Text style={styles.gridDuration}>{formatDuration(song.duration)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── GRID ──
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.bgSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    padding: 10,
    gap: 8,
  },
  gridCardActive: {
    backgroundColor: colors.bgTertiary,
    borderColor: colors.accent,
  },
  gridCover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 9,
    overflow: "hidden",
    backgroundColor: colors.bgTertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  gridCoverPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,13,18,0.42)",
    justifyContent: "center",
    alignItems: "center",
  },
  gridPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  gridInfo: { gap: 2 },
  gridTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 4,
  },
  gridTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  gridAuthor: { fontSize: 11, color: colors.textSecondary },
  gridDuration: { fontSize: 10, color: colors.textMuted },

  // ── LIST ──
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  listRowActive: {
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  listIndex: {
    width: 20,
    alignItems: "center",
  },
  listIndexText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  listCover: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.bgTertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  listInfo: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  listAuthor: { fontSize: 11, color: colors.textSecondary },
  listDuration: { fontSize: 11, color: colors.textMuted, flexShrink: 0 },
  activeText: { color: colors.accent },
});
