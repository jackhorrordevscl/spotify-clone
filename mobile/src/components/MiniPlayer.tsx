import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { usePlayerStore } from "../store/playerStore";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { colors } from "../theme/colors";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function MiniPlayer() {
  const insets = useSafeAreaInsets(); //INSETS DEL SISTEMA  
  const {
    currentSong,
    isPlaying,
    currentTime,
    togglePlay,
    playNext,
    playPrev,
  } = usePlayerStore();
  const { seek } = useAudioPlayer();

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
    // ✅ ANDROID: Altura mínima de 70px para asegurar que se vea sobre la barra de navegación
    // La barra de navegación mide aprox. 24-30px, por lo que necesitamos espacio extra
    <View
      style={[styles.container, { bottom: 49 + (insets.bottom > 0 ? insets.bottom : 10) } ]}
    >
      {/* ── BARRA DE PROGRESO EXPANDIDA ── */}
      {expanded && (
        <View style={styles.progressExpanded}>
          <Text style={styles.progressTime}>{formatTime(currentTime)}</Text>

          {/* Zona tocable del track — mide su propio ancho con onLayout */}
          <TouchableOpacity
            style={styles.trackTouchable}
            activeOpacity={0.9}
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
        <View style={[
          styles.thinLineFill,
          { width: `${progress * 100}%` as any} // x 100
          ]} />
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
    // ✅ Cambios clave en el estilo:
    position: "absolute",
    left: 8,
    right: 8,
    backgroundColor: colors.bgSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    // Sombra para que se note que flota sobre el menú
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    overflow: "hidden",
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