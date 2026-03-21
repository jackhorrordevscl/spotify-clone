// mobile/src/components/SongCard.tsx
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions, // ← Se actualiza en rotación. Dimensions.get() NO lo hace
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayerStore } from "../store/playerStore";
import { useLikedStore } from "../store/likedStore";
import type { Song } from "../types";

// CORRECCIÓN: exportamos una función en vez de una constante fija
// Así cada componente calcula el ancho según el tamaño actual de pantalla
export function useCardWidth() {
  const { width } = useWindowDimensions();
  // 16px padding izquierdo + 16px padding derecho + 12px gap entre columnas
  return (width - 32 - 12) / 2;
}

// Compatibilidad hacia atrás con SearchScreen que importa CARD_WIDTH
// TODO: actualizar SearchScreen para usar useCardWidth()
export const CARD_WIDTH = 0;

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
  variant?: "grid" | "list";
  index?: number;
}

export default function SongCard({
  song,
  queue,
  variant = "grid",
  index,
}: Props) {
  // useWindowDimensions se llama aquí para que el componente se re-renderice
  // cuando el usuario rota la pantalla
  const cardWidth = useCardWidth();

  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const { isLiked, likeSong, unlikeSong } = useLikedStore();

  const isCurrentSong = currentSong?.id === song.id;
  const liked = isLiked(song.id);

  const handlePress = () => {
    if (isCurrentSong) togglePlay();
    else playSong(song, queue);
  };

  const handleLike = () => {
    liked ? unlikeSong(song.id) : likeSong(song.id);
  };

  // ─── VARIANTE LIST ────────────────────────────────────
  if (variant === "list") {
    return (
      <TouchableOpacity
        style={[styles.listRow, isCurrentSong && styles.listRowActive]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.listIndex}>
          {isCurrentSong && isPlaying ? (
            <Ionicons name="musical-note" size={14} color={colors.accent} />
          ) : (
            <Text style={styles.listIndexText}>{(index ?? 0) + 1}</Text>
          )}
        </View>

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

        <Text style={styles.listDuration}>{formatDuration(song.duration)}</Text>

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

  // ─── VARIANTE GRID ────────────────────────────────────
  return (
    <TouchableOpacity
      // CORRECCIÓN: width viene de useWindowDimensions, no de Dimensions.get()
      style={[
        styles.gridCard,
        { width: cardWidth },
        isCurrentSong && styles.gridCardActive,
      ]}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <View style={styles.gridCover}>
        {song.coverUrl ? (
          <Image
            source={{ uri: song.coverUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.gridCoverPlaceholder}>
            <Text style={{ fontSize: 28, color: colors.accent }}>♪</Text>
          </View>
        )}

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
    flex: 1,
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
  listIndex: { width: 20, alignItems: "center" },
  listIndexText: { fontSize: 12, color: colors.textMuted },
  listCover: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.bgTertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  listInfo: { flex: 1, gap: 2, minWidth: 0 },
  listTitle: { fontSize: 13, fontWeight: "500", color: colors.textPrimary },
  listAuthor: { fontSize: 11, color: colors.textSecondary },
  listDuration: { fontSize: 11, color: colors.textMuted, flexShrink: 0 },
  activeText: { color: colors.accent },
});
