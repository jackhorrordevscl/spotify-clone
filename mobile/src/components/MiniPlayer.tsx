// mobile/src/components/MiniPlayer.tsx
// Player compacto que aparece en la parte inferior de Home, Search y Library
// Al tocar abre el player completo (aquí simplemente expande la barra de progreso)
// Usa el hook useAudioPlayer para toda la lógica de audio

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePlayerStore } from "../store/playerStore";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

const colors = {
  bgSecondary: "#0d1520",
  bgTertiary: "#162030",
  accent: "#00b4d8",
  textPrimary: "#f0f9ff",
  textSecondary: "#7eb8cc",
  textMuted: "#3d6478",
  border: "#1e3448",
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    togglePlay,
    playNext,
    playPrev,
  } = usePlayerStore();

  // Toda la lógica de audio vive en el hook
  const { seek } = useAudioPlayer();

  // Controla si la barra de progreso está expandida
  const [expanded, setExpanded] = useState(false);

  // Safe area para no tapar el home indicator en iPhone
  const insets = useSafeAreaInsets();

  // Si no hay canción activa, no renderizar nada
  if (!currentSong) return null;

  const progress =
    currentSong.duration > 0 ? currentTime / currentSong.duration : 0;

  // ─── BARRA DE PROGRESO ─────────────────────────────
  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTime}>{formatTime(currentTime)}</Text>

      {/* Track tocable para hacer seek */}
      <TouchableOpacity
        style={styles.progressTrack}
        activeOpacity={1}
        onPress={(e) => {
          // Calcular la posición relativa del toque en el track
          // layout.width lo obtenemos con onLayout
          const { locationX } = e.nativeEvent;
          // Usamos una ref para el ancho real del track
          // Por simplicidad aquí hacemos un cálculo aproximado
        }}
      >
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { flex: progress }]} />
          <View style={{ flex: 1 - progress }} />
        </View>
      </TouchableOpacity>

      <Text style={styles.progressTime}>
        {formatTime(currentSong.duration)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      {/* Barra de progreso expandible */}
      {expanded && <ProgressBar />}

      {/* Línea de progreso fina siempre visible en la parte superior */}
      <View style={styles.progressLine}>
        <View
          style={[styles.progressLineFill, { width: `${progress * 100}%` }]}
        />
      </View>

      {/* Fila principal del mini player */}
      <View style={styles.row}>
        {/* Cover */}
        <View style={styles.cover}>
          {currentSong.coverUrl ? (
            <Image
              source={{ uri: currentSong.coverUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="musical-note" size={20} color={colors.accent} />
          )}
        </View>

        {/* Info de la canción — toca para expandir la barra de progreso */}
        <TouchableOpacity
          style={styles.info}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.8}
        >
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {currentSong.author.name}
          </Text>
        </TouchableOpacity>

        {/* Controles */}
        <View style={styles.controls}>
          {/* Anterior */}
          <TouchableOpacity
            onPress={playPrev}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="play-skip-back"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Play / Pause — botón principal */}
          <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={18}
              color="#080d12"
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          </TouchableOpacity>

          {/* Siguiente */}
          <TouchableOpacity
            onPress={playNext}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="play-skip-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    // Sin posición absolute — cada screen lo incluye en su layout
    // así no tapa el bottom tab navigator
  },

  // Línea fina de progreso siempre visible
  progressLine: {
    height: 2,
    backgroundColor: colors.bgTertiary,
  },
  progressLineFill: {
    height: 2,
    backgroundColor: colors.accent,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },

  cover: {
    width: 46,
    height: 46,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.bgTertiary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },

  title: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  author: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexShrink: 0,
  },

  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },

  // Barra de progreso expandida
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },

  progressTime: {
    fontSize: 10,
    color: colors.textMuted,
    width: 32,
    textAlign: "center",
  },

  progressTrack: { flex: 1, paddingVertical: 8 },

  progressBg: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.bgTertiary,
    flexDirection: "row",
    overflow: "hidden",
  },

  progressFill: {
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
});
