import { useState, useRef, useEffect } from "react";
import { Play, Pause, MoreVertical, Plus, Heart } from "lucide-react";
import { Song } from "../../hooks/useSongs";
import { usePlayerStore } from "../../store/playerStore";
import { usePlaylistStore } from "../../store/playlistStore";
import { useLikedStore } from "../../store/likedStore";

interface Props {
  song: Song;
  queue: Song[];
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const SongCard = ({ song, queue }: Props) => {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();
  const { playlists, addSongToPlaylist } = usePlaylistStore();
  const { isLiked, likeSong, unlikeSong } = useLikedStore();
  const liked = isLiked(song.id);
  const isCurrentSong = currentSong?.id === song.id;
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleAddToPlaylist = async (
    playlistId: string,
    playlistTitle: string,
  ) => {
    try {
      await addSongToPlaylist(playlistId, song.id);
      setFeedback(`Agregada a "${playlistTitle}"`);
    } catch {
      setFeedback("Ya está en esa playlist");
    } finally {
      setMenuOpen(false);
      setTimeout(() => setFeedback(""), 2500);
    }
  };

  return (
    <div
      className="group relative flex flex-col cursor-pointer transition-colors"
      style={{
        background: isCurrentSong
          ? "var(--bg-tertiary)"
          : "var(--bg-secondary)",
        border: `1px solid ${isCurrentSong ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "1rem",
        padding: "0.875rem",
        gap: "0.75rem",
      }}
      onClick={() => {
        if (isCurrentSong) togglePlay();
        else playSong(song, queue);
      }}
      onMouseEnter={(e) => {
        if (!isCurrentSong)
          e.currentTarget.style.background = "var(--bg-tertiary)";
      }}
      onMouseLeave={(e) => {
        if (!isCurrentSong)
          e.currentTarget.style.background = "var(--bg-secondary)";
      }}
    >
      {/* ========== COVER ========== */}
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{ aspectRatio: "1", background: "var(--bg-tertiary)" }}
      >
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              style={{
                fontSize: "clamp(28px, 7vw, 40px)",
                color: "var(--accent)",
              }}
            >
              ♪
            </span>
          </div>
        )}

        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(8,13,18,0.55)" }}
        >
          <div
            className="flex items-center justify-center rounded-full transition-transform hover:scale-105"
            style={{
              background: "var(--accent)",
              width: "40px",
              height: "40px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              isCurrentSong ? togglePlay() : playSong(song, queue);
            }}
          >
            {isCurrentSong && isPlaying ? (
              <Pause size={17} style={{ color: "#080d12" }} />
            ) : (
              <Play size={17} style={{ color: "#080d12", marginLeft: 2 }} />
            )}
          </div>
        </div>
      </div>

      {/* ========== INFO ========== */}
      <div className="flex flex-col overflow-hidden" style={{ gap: "0.3rem" }}>
        {/* Título + like */}
        <div
          className="flex items-start justify-between"
          style={{ gap: "0.5rem" }}
        >
          <p
            className="text-sm font-semibold truncate leading-snug flex-1 min-w-0"
            style={{
              color: isCurrentSong ? "var(--accent)" : "var(--text-primary)",
            }}
          >
            {song.title}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              liked ? unlikeSong(song.id) : likeSong(song.id);
            }}
            className="shrink-0 transition-transform hover:scale-110"
            style={{
              color: liked ? "var(--accent)" : "var(--text-muted)",
              padding: "2px",
              marginTop: "1px",
            }}
          >
            <Heart size={14} fill={liked ? "var(--accent)" : "none"} />
          </button>
        </div>

        {/* Artista */}
        <p
          className="text-xs truncate"
          style={{ color: "var(--text-secondary)" }}
        >
          {song.artist.name}
        </p>

        {/* Duración */}
        <p
          className="text-xs"
          style={{ color: "var(--text-muted)", marginTop: "0.125rem" }}
        >
          {formatDuration(song.duration)}
        </p>
      </div>

      {/* ========== MENÚ OPCIONES ========== */}
      <div className="relative" ref={menuRef}>
        <button
          className="absolute opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg"
          style={{ color: "var(--text-secondary)", bottom: 0, right: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-secondary)")
          }
        >
          <MoreVertical size={15} />
        </button>

        {menuOpen && (
          <div
            className="absolute z-50 rounded-xl shadow-xl"
            style={{
              bottom: "1.75rem",
              right: 0,
              minWidth: "11rem",
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              padding: "0.5rem",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{
                color: "var(--text-muted)",
                padding: "0.375rem 0.75rem 0.5rem",
              }}
            >
              Agregar a playlist
            </p>
            {playlists.length === 0 && (
              <p
                className="text-xs"
                style={{
                  color: "var(--text-muted)",
                  padding: "0.375rem 0.75rem",
                }}
              >
                No tienes playlists
              </p>
            )}
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="w-full flex items-center gap-2 text-sm text-left rounded-lg transition-colors"
                style={{
                  color: "var(--text-primary)",
                  padding: "0.5rem 0.75rem",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToPlaylist(playlist.id, playlist.title);
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-secondary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Plus
                  size={13}
                  style={{ color: "var(--accent)", flexShrink: 0 }}
                />
                <span className="truncate">{playlist.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========== FEEDBACK TOAST ========== */}
      {feedback && (
        <div
          className="absolute inset-x-2 bottom-2 text-center text-xs rounded-lg z-10"
          style={{
            background: "var(--accent)",
            color: "#080d12",
            fontWeight: 600,
            padding: "0.375rem 0.5rem",
          }}
        >
          {feedback}
        </div>
      )}
    </div>
  );
};

export default SongCard;
