// mobile/src/screens/LibraryScreen.tsx
// Equivalente a frontend/src/pages/LibraryPage.tsx
// Muestra las playlists del usuario con opciones de crear y eliminar
// Navega a PlaylistScreen al tocar una playlist

import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { usePlaylistStore } from "../store/playlistStore";
import MiniPlayer from "../components/MiniPlayer";
import type { MainStackParamList } from "../navigation/AppNavigator";
import type { Playlist } from "../types";

type LibraryNavProp = NativeStackNavigationProp<MainStackParamList>;

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

export default function LibraryScreen() {
  const navigation = useNavigation<LibraryNavProp>();
  const insets = useSafeAreaInsets();
  const {
    playlists,
    isLoading,
    fetchPlaylists,
    createPlaylist,
    deletePlaylist,
  } = usePlaylistStore();

  const [showInput, setShowInput] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      await createPlaylist(newTitle.trim());
      setNewTitle("");
      setShowInput(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = (playlist: Playlist) => {
    // Alert.alert con dos botones — equivalente al click del ícono trash en web
    Alert.alert("Eliminar playlist", `¿Eliminar "${playlist.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deletePlaylist(playlist.id),
      },
    ]);
  };

  const renderPlaylist = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={styles.playlistRow}
      onPress={() =>
        navigation.navigate("Playlist", {
          id: item.id,
          title: item.title,
        })
      }
      activeOpacity={0.75}
    >
      {/* Cover */}
      <View style={styles.playlistCover}>
        {item.coverUrl ? (
          <Image
            source={{ uri: item.coverUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="musical-notes" size={22} color={colors.accent} />
        )}
      </View>

      {/* Info */}
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.playlistCount}>
          {item.songs.length} canción{item.songs.length !== 1 ? "es" : ""}
        </Text>
      </View>

      {/* Botón eliminar */}
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={playlists}
        renderItem={renderPlaylist}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        // Header con título, botón Nueva playlist e input condicional
        ListHeaderComponent={() => (
          <View style={styles.header}>
            {/* Fila: título + botón */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Tu biblioteca</Text>
                <Text style={styles.subtitle}>
                  {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.newBtn}
                onPress={() => setShowInput(!showInput)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color="#080d12" />
                <Text style={styles.newBtnText}>Nueva</Text>
              </TouchableOpacity>
            </View>

            {/* Input de nueva playlist — visible al pulsar "Nueva" */}
            {showInput && (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de la playlist"
                  placeholderTextColor={colors.textMuted}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  autoFocus
                  // Crear al pulsar "Listo" en el teclado
                  onSubmitEditing={handleCreate}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[
                    styles.createBtn,
                    (!newTitle.trim() || isCreating) &&
                      styles.createBtnDisabled,
                  ]}
                  onPress={handleCreate}
                  disabled={!newTitle.trim() || isCreating}
                >
                  {isCreating ? (
                    <ActivityIndicator color="#080d12" size="small" />
                  ) : (
                    <Text style={styles.createBtnText}>Crear</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowInput(false);
                    setNewTitle("");
                  }}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        // Estado vacío
        ListEmptyComponent={() =>
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="musical-notes-outline"
                size={40}
                color={colors.textMuted}
              />
              <Text style={styles.emptyText}>No tienes playlists aún</Text>
              <TouchableOpacity onPress={() => setShowInput(true)}>
                <Text style={styles.emptyLink}>Crea tu primera playlist</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPrimary },
  listContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 8 },
  header: { gap: 16, marginBottom: 8 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  newBtnText: { color: "#080d12", fontSize: 13, fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.bgTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
  },
  createBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { color: "#080d12", fontSize: 13, fontWeight: "600" },
  cancelText: { color: colors.textSecondary, fontSize: 13 },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.bgSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  playlistCover: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.bgTertiary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  playlistInfo: { flex: 1, gap: 3, minWidth: 0 },
  playlistTitle: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  playlistCount: { fontSize: 12, color: colors.textSecondary },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 13, color: colors.textSecondary },
  emptyLink: { fontSize: 13, color: colors.accent, fontWeight: "500" },
});
