// mobile/src/components/MiniPlayer.tsx
import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  LayoutChangeEvent,
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
  const { seek } = useAudioPlayer();
  const insets = useSafeAreaInsets();

  const [expanded, setExpanded] = useState(false);
  // Ancho real del track medido con onLayout — necesario para calcular el seek
  const trackWidthRef = useRef(1);

  if (!currentSong) return null;

  const progress =
    currentSong.duration > 0
      ? Math.min(currentTime / currentSong.duration, 1)
      : 0;

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) trackWidthRef.current = w;
  };

  const handleSeek = (e: any) => {
    // locationX es la coordenada X del toque dentro del componente
    const { locationX } = e.nativeEvent;
    const pct = Math.max(0, Math.min(1, locationX / trackWidthRef.current));
    seek(pct * currentSong.duration);
  };

  return (
    // paddingBottom evita que el home indicator tape el contenido (iPhone)
    // Math.max asegura al menos 8px incluso en Android
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      {/* ── BARRA DE PROGRESO EXPANDIDA ── */}
      {expanded && (
        <View style={styles.progressExpanded}>
          <Text style={styles.progressTime}>{formatTime(currentTime)}</Text>

          {/* Zona tocable del track — mide su propio ancho con onLayout */}
          <TouchableOpacity
            style={styles.trackTouchable}
            activeOpacity={1}
            onPress={handleSeek}
            onLayout={handleTrackLayout}
          >
            <View style={styles.trackBg}>
              {/* CORRECCIÓN: usar width en % en lugar de flex para la barra */}
              <View style={{ width: `${progress}%` as `${number}%` }} />
            </View>
          </TouchableOpacity>

          <Text style={styles.progressTime}>
            {formatTime(currentSong.duration)}
          </Text>
        </View>
      )}

      {/* ── LÍNEA DELGADA SIEMPRE VISIBLE ── */}
      <View style={styles.thinLine}>
        <View style={{ width: `${progress}%` as `${number}%` }} />
      </View>

      {/* ── FILA PRINCIPAL ── */}
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

        {/* Info — toca para expandir la barra de progreso */}
        <TouchableOpacity
          style={styles.info}
          onPress={() => setExpanded((v) => !v)}
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
          <TouchableOpacity
            onPress={playPrev}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="play-skip-back"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={18}
              color="#080d12"
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={playNext}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
  },

  // Línea fina de progreso
  thinLine: {
    height: 2,
    backgroundColor: colors.bgTertiary,
  },
  thinLineFill: {
    height: 2,
    backgroundColor: colors.accent,
  },

  // Fila principal
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 12,
  },

  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.bgTertiary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  info: {
    flex: 1,
    gap: 2,
    minWidth: 0, // Necesario para que numberOfLines funcione correctamente
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
    gap: 12,
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
  progressExpanded: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },

  progressTime: {
    fontSize: 10,
    color: colors.textMuted,
    width: 34,
    textAlign: "center",
  },

  // Zona tocable — paddingVertical amplía el área de toque sin cambiar el visual
  trackTouchable: {
    flex: 1,
    paddingVertical: 10,
  },

  trackBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bgTertiary,
    overflow: "hidden",
  },

  trackFill: {
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
});
