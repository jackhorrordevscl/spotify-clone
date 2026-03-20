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
    setPlaylist((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        songs: prev.songs.filter((s) => s.songId !== songId),
      };
    });
  };

  const handlePlayAll = () => {
    if (!playlist || playlist.songs.length === 0) return;
    const songs = playlist.songs.map((ps) => ps.song);
    playSong(songs[0], songs);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div
          className="h-8 w-48 rounded-lg"
          style={{ background: "var(--bg-secondary)" }}
        />
        <div
          className="h-4 w-32 rounded-lg"
          style={{ background: "var(--bg-secondary)" }}
        />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl"
            style={{ background: "var(--bg-secondary)" }}
          />
        ))}
      </div>
    );
  }

  if (!playlist) return null;

  const songs = playlist.songs.map((ps) => ps.song);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate("/library")}
          className="flex items-center gap-2 text-sm w-fit transition-colors"
          style={{ color: "var(--text-secondary)" }}
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

        <div className="flex items-center gap-6">
          {/* Cover */}
          <div
            className="w-32 h-32 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ background: "var(--bg-tertiary)" }}
          >
            {playlist.coverUrl ? (
              <img
                src={playlist.coverUrl}
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music2 size={40} style={{ color: "var(--accent)" }} />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2">
            <p
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Playlist
            </p>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {playlist.title}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {playlist.songs.length} canción
              {playlist.songs.length !== 1 ? "es" : ""}
            </p>

            {playlist.songs.length > 0 && (
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold w-fit mt-2"
                style={{ background: "var(--accent)", color: "#080d12", padding: '7px' }}
              >
                <Play size={16} />
                Reproducir todo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sin canciones */}
      {playlist.songs.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-16 rounded-xl"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <Music2 size={36} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Esta playlist no tiene canciones aún
          </p>
        </div>
      )}

      {/* Lista de canciones */}
      {playlist.songs.length > 0 && (
        <div className="flex flex-col gap-1">
          {playlist.songs.map(({ song, songId }, index) => {
            const isCurrentSong = currentSong?.id === song.id;
            return (
              <div
                key={songId}
                className="group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-colors"
                style={{
                  background: isCurrentSong
                    ? "var(--bg-tertiary)"
                    : "transparent",
                  border: `1px solid ${isCurrentSong ? "var(--accent)" : "transparent"}`,
                }}
                onClick={() => {
                  if (isCurrentSong) {
                    togglePlay();
                  } else {
                    playSong(song, songs);
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentSong)
                    e.currentTarget.style.background = "var(--bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentSong)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Número / icono playing */}
                <div className="w-6 flex items-center justify-center flex-shrink-0">
                  {isCurrentSong && isPlaying ? (
                    <span style={{ color: "var(--accent)", fontSize: 14 }}>
                      ♪
                    </span>
                  ) : (
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Cover */}
                <div
                  className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
                  style={{ background: "var(--bg-tertiary)" }}
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
                <div className="flex-1 overflow-hidden">
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
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {song.author.name}
                  </p>
                </div>

                {/* Duración */}
                <span
                  className="text-xs flex-shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatDuration(song.duration)}
                </span>

                {/* Eliminar */}
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all flex-shrink-0"
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
