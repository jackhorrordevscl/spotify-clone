import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Trash2, Music2, ArrowLeft } from "lucide-react";
import api from "../services/api";
import { usePlayerStore } from "../store/playerStore";
import { usePlaylistStore } from "../store/playlistStore";
import type { Playlist } from "../store/playlistStore";

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const PlaylistPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const { removeSongFromPlaylist } = usePlaylistStore();

  useEffect(() => {
    if (!id) return;
    api
      .get(`/playlists/${id}`)
      .then(({ data }) => setPlaylist(data))
      .catch(() => navigate("/library"))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleRemoveSong = async (songId: string) => {
    if (!id) return;
    await removeSongFromPlaylist(id, songId);
    setPlaylist((prev) =>
      prev
        ? { ...prev, songs: prev.songs.filter((s) => s.songId !== songId) }
        : null,
    );
  };

  const handlePlayAll = () => {
    if (!playlist || playlist.songs.length === 0) return;
    const songs = playlist.songs.map((ps) => ps.song);
    playSong(songs[0], songs);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col" style={{ gap: "1rem" }}>
        <div
          className="animate-pulse"
          style={{
            height: "2rem",
            width: "12rem",
            background: "var(--bg-secondary)",
            borderRadius: "0.5rem",
          }}
        />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              height: "60px",
              background: "var(--bg-secondary)",
              borderRadius: "0.75rem",
            }}
          />
        ))}
      </div>
    );
  }

  if (!playlist) return null;

  const songs = playlist.songs.map((ps) => ps.song);

  return (
    <div className="flex flex-col" style={{ gap: "2rem" }}>
      {/* ========== HEADER ========== */}
      <div className="flex flex-col" style={{ gap: "1.5rem" }}>
        {/* Volver */}
        <button
          onClick={() => navigate("/library")}
          className="flex items-center w-fit transition-colors"
          style={{
            color: "var(--text-secondary)",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-secondary)")
          }
        >
          <ArrowLeft size={16} />
          Tu biblioteca
        </button>

        {/* Cover + info */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-end"
          style={{ gap: "1.5rem" }}
        >
          <div
            className="flex items-center justify-center rounded-2xl shrink-0 overflow-hidden"
            style={{
              width: "clamp(96px, 15vw, 140px)",
              height: "clamp(96px, 15vw, 140px)",
              background: "var(--bg-tertiary)",
            }}
          >
            {playlist.coverUrl ? (
              <img
                src={playlist.coverUrl}
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music2 size={36} style={{ color: "var(--accent)" }} />
            )}
          </div>

          <div className="flex flex-col" style={{ gap: "0.5rem" }}>
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Playlist
            </p>
            <h1
              className="font-bold"
              style={{
                color: "var(--text-primary)",
                fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
                lineHeight: 1.15,
              }}
            >
              {playlist.title}
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {playlist.songs.length} canción
              {playlist.songs.length !== 1 ? "es" : ""}
            </p>
            {playlist.songs.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="flex items-center w-fit rounded-full font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: "var(--accent)",
                  color: "#080d12",
                  fontSize: "0.875rem",
                  padding: "0.5rem 1.25rem",
                  gap: "0.5rem",
                  marginTop: "0.375rem",
                }}
              >
                <Play size={15} />
                Reproducir todo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========== SIN CANCIONES ========== */}
      {playlist.songs.length === 0 && (
        <div
          className="flex flex-col items-center justify-center"
          style={{
            gap: "0.875rem",
            padding: "4rem 2rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
          }}
        >
          <Music2 size={36} style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            Esta playlist no tiene canciones aún
          </p>
        </div>
      )}

      {/* ========== LISTA CANCIONES ========== */}
      {playlist.songs.length > 0 && (
        <div className="flex flex-col" style={{ gap: "0.25rem" }}>
          {playlist.songs.map(({ song, songId }, index) => {
            const isCurrentSong = currentSong?.id === song.id;
            return (
              <div
                key={songId}
                className="group flex items-center cursor-pointer transition-colors rounded-xl"
                style={{
                  gap: "1rem",
                  padding: "0.75rem 1rem",
                  background: isCurrentSong
                    ? "var(--bg-tertiary)"
                    : "transparent",
                  border: `1px solid ${isCurrentSong ? "var(--accent)" : "transparent"}`,
                }}
                onClick={() =>
                  isCurrentSong ? togglePlay() : playSong(song, songs)
                }
                onMouseEnter={(e) => {
                  if (!isCurrentSong)
                    e.currentTarget.style.background = "var(--bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentSong)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Número / playing */}
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: "1.5rem" }}
                >
                  {isCurrentSong && isPlaying ? (
                    <span
                      style={{ color: "var(--accent)", fontSize: "0.875rem" }}
                    >
                      ♪
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.75rem",
                      }}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Cover */}
                <div
                  className="shrink-0 rounded-lg overflow-hidden"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--bg-tertiary)",
                  }}
                >
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 size={14} style={{ color: "var(--accent)" }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 overflow-hidden min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{
                      color: isCurrentSong
                        ? "var(--accent)"
                        : "var(--text-primary)",
                    }}
                  >
                    {song.title}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{
                      color: "var(--text-secondary)",
                      marginTop: "0.2rem",
                    }}
                  >
                    {song.author.name}
                  </p>
                </div>

                {/* Duración */}
                <span
                  className="hidden sm:block shrink-0 tabular-nums"
                  style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}
                >
                  {formatDuration(song.duration)}
                </span>

                {/* Eliminar */}
                <button
                  className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded transition-all"
                  style={{ color: "var(--text-muted)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSong(song.id);
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#f87171")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-muted)")
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;
