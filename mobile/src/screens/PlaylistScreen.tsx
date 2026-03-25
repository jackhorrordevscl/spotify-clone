// mobile/src/screens/PlaylistScreen.tsx
// Equivalente a frontend/src/pages/PlaylistPage.tsx
// Se abre desde LibraryScreen con push navigation
// Recibe { id, title } como route params

import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import api from "../api/api";
import SongCard from "../components/SongCard";
import MiniPlayer from "../components/MiniPlayer";
import { usePlayerStore } from "../store/playerStore";
import { usePlaylistStore } from "../store/playlistStore";
import type { MainStackParamList } from "../navigation/AppNavigator";
import type { Playlist, PlaylistSong } from "../types";

type PlaylistRouteProp = RouteProp<MainStackParamList, "Playlist">;
type PlaylistNavProp = NativeStackNavigationProp<MainStackParamList>;

const colors = {
  bgPrimary: "#080d12",
  bgSecondary: "#0d1520",
  bgTertiary: "#162030",
  accent: "#00b4d8",
  textPrimary: "#f0f9ff",
  textSecondary: "#7eb8cc",
  textMuted: "#3d6478",
  border: "#1e3448",
};

export default function PlaylistScreen() {
  const navigation = useNavigation<PlaylistNavProp>();
  const route = useRoute<PlaylistRouteProp>();

  // Params recibidos desde LibraryScreen
  const { id } = route.params;

  const { playSong } = usePlayerStore();
  const { removeSongFromPlaylist } = usePlaylistStore();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/playlists/${id}`)
      .then(({ data }) => setPlaylist(data))
      .catch(() => navigation.goBack())
      .finally(() => setIsLoading(false));
  }, [id]);

  const handlePlayAll = () => {
    if (!playlist || playlist.songs.length === 0) return;
    const songs = playlist.songs.map((ps) => ps.song);
    playSong(songs[0], songs);
  };

  const handleRemoveSong = async (songId: string) => {
    await removeSongFromPlaylist(id, songId);
    // Actualizar el estado local para que la UI responda inmediatamente
    setPlaylist((prev) =>
      prev
        ? { ...prev, songs: prev.songs.filter((s) => s.songId !== songId) }
        : null,
    );
  };

  const songs = playlist?.songs.map((ps) => ps.song) ?? [];

  // ─── LOADING ───────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!playlist) return null;

  // ─── RENDER DE CADA CANCIÓN EN MODO LIST ───────────
  const renderSong = ({
    item,
    index,
  }: {
    item: PlaylistSong;
    index: number;
  }) => (
    <View style={styles.songRow}>
      <SongCard song={item.song} queue={songs} variant='list' index={index} />
      {/* Botón eliminar de la playlist — fuera del SongCard para no confundir */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemoveSong(item.song.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name="remove-circle-outline"
          size={18}
          color={colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={playlist.songs}
        renderItem={renderSong}
        keyExtractor={(item) => item.songId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            {/* ── BOTÓN VOLVER ── */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.backText}>Tu biblioteca</Text>
            </TouchableOpacity>

            {/* ── INFO DE LA PLAYLIST ── */}
            <View style={styles.playlistInfo}>
              {/* Cover */}
              <View style={styles.cover}>
                {playlist.coverUrl ? (
                  <Image
                    source={{ uri: playlist.coverUrl }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="musical-notes"
                    size={40}
                    color={colors.accent}
                  />
                )}
              </View>

              {/* Metadata */}
              <View style={styles.meta}>
                <Text style={styles.metaType}>PLAYLIST</Text>
                <Text style={styles.metaTitle} numberOfLines={2}>
                  {playlist.title}
                </Text>
                <Text style={styles.metaCount}>
                  {playlist.songs.length} canción
                  {playlist.songs.length !== 1 ? "es" : ""}
                </Text>

                {/* Botón reproducir todo */}
                {playlist.songs.length > 0 && (
                  <TouchableOpacity
                    style={styles.playAllBtn}
                    onPress={handlePlayAll}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="play"
                      size={16}
                      color="#080d12"
                      style={{ marginLeft: 2 }}
                    />
                    <Text style={styles.playAllText}>Reproducir todo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Separador antes de la lista de canciones */}
            {playlist.songs.length > 0 && <View style={styles.divider} />}
          </View>
        )}
        // Estado vacío
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons
              name="musical-note-outline"
              size={36}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>
              Esta playlist no tiene canciones aún
            </Text>
          </View>
        )}
      />

      <MiniPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  centered: { justifyContent: "center", alignItems: "center" },
  listContent: { paddingBottom: 100 },

  header: {
    padding: 16,
    gap: 20,
  },

  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  playlistInfo: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },

  cover: {
    width: 120,
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.bgTertiary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  meta: { flex: 1, gap: 4 },
  metaType: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  metaTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 2,
  },
  metaCount: { fontSize: 13, color: colors.textSecondary },

  playAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  playAllText: { color: "#080d12", fontSize: 13, fontWeight: "600" },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  // Fila de canción en lista — SongCard + botón eliminar
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },

  // El SongCard ocupa todo el espacio disponible
  // el botón de eliminar se añade a la derecha sin ocupar el touch del card
  removeBtn: {
    paddingLeft: 8,
    flexShrink: 0,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
    marginHorizontal: 16,
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
