// mobile/src/screens/SearchScreen.tsx
// Equivalente a frontend/src/pages/SearchPage.tsx
// Diferencias clave:
//   - TextInput con SearchBar integrado
//   - FlatList en lugar de grid CSS
//   - Debounce implementado con useRef + setTimeout (sin librería)

import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "../api/api";
import SongCard, { CARD_WIDTH } from "../components/SongCard";
import MiniPlayer from "../components/MiniPlayer";
import type { Song } from "../types";

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

export default function SearchScreen() {
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // useRef para el timer del debounce — no necesita re-render
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((text: string) => {
    setQuery(text);

    // Limpiar resultados si el input está vacío
    if (!text.trim()) {
      setResults([]);
      return;
    }

    // Cancelar el timer anterior antes de crear uno nuevo
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Esperar 400ms después de que el usuario deje de escribir
    // Mismo debounce que el frontend (useSearch.ts)
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(
          `/songs/search?q=${encodeURIComponent(text)}`,
        );
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);
  }, []);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const renderSong = ({ item }: { item: Song }) => (
    <SongCard song={item} queue={results} variant="grid" />
  );

  return (
    <View style={styles.container}>
      {/* ── SEARCH BAR ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Buscar</Text>
        <Text style={styles.subtitle}>
          Encuentra canciones por título o artista
        </Text>

        {/* Input con ícono de lupa y botón de limpiar */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={16}
            color={colors.textMuted}
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué quieres escuchar?"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={search}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />

          {/* Botón X para limpiar — solo visible si hay texto */}
          {query.length > 0 && (
            <TouchableOpacity
              onPress={clearSearch}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── ESTADOS ── */}

      {/* Sin query — estado inicial */}
      {!query && (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>Escribe algo para buscar</Text>
        </View>
      )}

      {/* Cargando */}
      {query && isLoading && (
        <View style={styles.emptyState}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      )}

      {/* Sin resultados */}
      {query && !isLoading && results.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 36 }}>♪</Text>
          <Text style={styles.emptyText}>
            No se encontraron canciones para "{query}"
          </Text>
        </View>
      )}

      {/* Resultados */}
      {query && !isLoading && results.length > 0 && (
        <FlatList
          data={results}
          renderItem={renderSong}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <Text style={styles.resultsCount}>
              {results.length} resultado{results.length !== 1 ? "s" : ""} para "
              {query}"
            </Text>
          )}
        />
      )}

      {/* MiniPlayer fijo en la parte inferior */}
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginTop: 4,
    gap: 8,
  },
  searchIcon: { flexShrink: 0 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  resultsCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  columnWrapper: { gap: 12 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
});
