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

  // =================== CERRAR MENÚ AL HACER CLIC FUERA ===================

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
      className="group relative flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-colors"
      style={{
        background: isCurrentSong
          ? "var(--bg-tertiary)"
          : "var(--bg-secondary)",
        border: `1px solid ${isCurrentSong ? "var(--accent)" : "var(--border)"}`,
        padding: "10px",
      }}
      onClick={() => {
        if (isCurrentSong) {
          togglePlay();
        } else {
          playSong(song, queue);
        }
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
      {/* =================== COVER =================== */}

      <div
        className="relative w-full rounded-lg overflow-hidden"
        style={{ height: "160px", background: "var(--bg-tertiary)" }}
      >
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span style={{ fontSize: 36, color: "var(--accent)" }}>♪</span>
          </div>
        )}

        {/* =================== BOTÓN PLAY/PAUSE =================== */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(8,13,18,0.5)" }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--accent)" }}
            onClick={(e) => {
              e.stopPropagation();
              if (isCurrentSong) {
                togglePlay();
              } else {
                playSong(song, queue);
              }
            }}
          >
            {isCurrentSong && isPlaying ? (
              <Pause size={18} style={{ color: "#080d12" }} />
            ) : (
              <Play size={18} style={{ color: "#080d12", marginLeft: 2 }} />
            )}
          </div>
        </div>
      </div>

      {/* =================== INFO =================== */}

      <div className="flex flex-col gap-1.5 overflow-hidden px-1">
        <div className="flex items-start justify-between gap-1">
          <p
            className="text-sm font-semibold truncate"
            style={{
              color: isCurrentSong ? "var(--accent)" : "var(--text-primary)",
            }}
          >
            {song.title}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              liked ? unlikeSong(song.id) : likeSong(song.id)
            }}
            className="flex-shrink-0 transition-transform hover:scale-110"
            style={{ color: liked ? 'var(--accent)' : 'var(--text-muted)', padding: '5px' }}
          >
            <Heart size={18} fill={liked ? 'var(--accent)' : 'none'} />
          </button>
        </div>
        <p
          className="text-xs truncate"
          style={{ color: "var(--text-secondary)" }}
        >
          {song.author.name}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {formatDuration(song.duration)}
        </p>
      </div>

      {/* =================== BOTÓN OPCIONES =================== */}

      <div className="relative" ref={menuRef}>
        <button
          className="absolute bottom-0 right-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          style={{ color: "var(--text-secondary)" }}
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
          <MoreVertical size={16} />
        </button>

        {/* =================== DROPDOWN MENÚ =================== */}
        {menuOpen && (
          <div
            className="absolute bottom-8 right-0 z-50 min-w-48 rounded-xl py-1 shadow-xl"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              padding: "10px",
            }}
          >
            <p
              className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)", paddingBottom: "5px" }}
            >
              Agregar a playlist
            </p>

            {playlists.length === 0 && (
              <p
                className="px-3 py-2 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                No tienes playlists
              </p>
            )}

            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
                style={{ color: "var(--text-primary)", paddingTop: "5px" }}
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
                <Plus size={14} style={{ color: "var(--accent)" }} />
                {playlist.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =================== FEEDBACK TOAST =================== */}
      {feedback && (
        <div
          className="absolute bottom-2 left-2 right-2 text-center text-xs py-1.5 px-2 rounded-lg z-10"
          style={{
            background: "var(--accent)",
            color: "#080d12",
            fontWeight: 500,
            padding: "5px",
          }}
        >
          {feedback}
        </div>
      )}
    </div>
  );
};

export default SongCard;
