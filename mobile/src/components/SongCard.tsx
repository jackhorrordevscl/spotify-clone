// mobile/src/components/SongCard.tsx
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayerStore } from "../store/playerStore";
import type { Song } from "../types";
import { colors } from "../theme/colors";

export function useCardWidth() {
  const { width } = useWindowDimensions();
  return (width - 44) / 2; // (Pantalla - paddings laterales - gap central) / 2
}

interface Props {
  song: Song;
  queue: Song[];
}

export default function SongCard({ song, queue }: Props) {
  const cardWidth = useCardWidth();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();

  const isCurrent = currentSong?.id === song.id;

  const handlePress = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.container, { width: cardWidth, height: 230 }]}
    >
      <View style={styles.coverContainer}>
        {song.coverUrl ? (
          <Image source={{ uri: song.coverUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.placeholder]}>
            <Ionicons name="musical-note" size={40} color={colors.accent} />
          </View>
        )}

        {isCurrent && (
          <View style={styles.activeOverlay}>
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={48}
              color={colors.accent}
            />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text
          numberOfLines={1}
          style={[styles.title, isCurrent && { color: colors.accent }]}
        >
          {song.title}
        </Text>
        <Text numberOfLines={1} style={styles.author}>
          {song.author?.name || "Artista desconocido"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 14,
    padding: 10,
    gap: 8,
    // Aseguramos que la sombra no cause tirones de GPU
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  coverContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: colors.bgTertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  author: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
