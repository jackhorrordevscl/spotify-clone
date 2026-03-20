import { useState } from "react";
import { Plus, Trash2, Music2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlaylistStore } from "../store/playlistStore";

const LibraryPage = () => {
  const { playlists, isLoading, createPlaylist, deletePlaylist } =
    usePlaylistStore();
  const [newTitle, setNewTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="flex flex-col" style={{ gap: "1.75rem" }}>
      {/* ========== HEADER ========== */}
      <div
        className="flex items-center justify-between"
        style={{ gap: "1rem", paddingTop: "0.25rem" }}
      >
        <div>
          <h1
            className="font-bold"
            style={{
              color: "var(--text-primary)",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              lineHeight: 1.2,
            }}
          >
            Tu biblioteca
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9375rem",
              marginTop: "0.375rem",
            }}
          >
            {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-2 rounded-xl font-medium shrink-0 transition-opacity hover:opacity-90"
          style={{
            background: "var(--accent)",
            color: "#080d12",
            fontSize: "0.875rem",
            padding: "0.625rem 1.125rem",
          }}
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Nueva playlist</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* ========== INPUT NUEVA PLAYLIST ========== */}
      {showInput && (
        <div
          className="flex flex-col sm:flex-row"
          style={{
            gap: "0.75rem",
            padding: "1rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "0.875rem",
          }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nombre de la playlist"
            className="flex-1 rounded-xl text-sm outline-none"
            style={{
              padding: "0.625rem 0.875rem",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <div className="flex" style={{ gap: "0.5rem" }}>
            <button
              onClick={handleCreate}
              disabled={isCreating || !newTitle.trim()}
              className="flex-1 sm:flex-none rounded-xl text-sm font-medium transition-opacity"
              style={{
                padding: "0.625rem 1.125rem",
                background: "var(--accent)",
                color: "#080d12",
                opacity: isCreating || !newTitle.trim() ? 0.5 : 1,
              }}
            >
              {isCreating ? "Creando..." : "Crear"}
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setNewTitle("");
              }}
              className="flex-1 sm:flex-none rounded-xl text-sm"
              style={{
                padding: "0.625rem 1rem",
                background: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ========== LOADING ========== */}
      {isLoading && (
        <div className="flex flex-col" style={{ gap: "0.75rem" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: "68px",
                background: "var(--bg-secondary)",
                borderRadius: "0.875rem",
              }}
            />
          ))}
        </div>
      )}

      {/* ========== SIN PLAYLISTS ========== */}
      {!isLoading && playlists.length === 0 && (
        <div
          className="flex flex-col items-center justify-center"
          style={{
            gap: "0.875rem",
            padding: "5rem 2rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
          }}
        >
          <Music2 size={40} style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            No tienes playlists aún
          </p>
          <button
            onClick={() => setShowInput(true)}
            className="text-sm font-medium"
            style={{ color: "var(--accent)" }}
          >
            Crea tu primera playlist
          </button>
        </div>
      )}

      {/* ========== LISTA ========== */}
      {!isLoading && playlists.length > 0 && (
        <div className="flex flex-col" style={{ gap: "0.625rem" }}>
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="group flex items-center cursor-pointer transition-colors"
              style={{
                gap: "1rem",
                padding: "0.875rem 1rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "0.875rem",
              }}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-tertiary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--bg-secondary)")
              }
            >
              {/* Cover */}
              <div
                className="shrink-0 flex items-center justify-center rounded-xl overflow-hidden"
                style={{
                  width: "48px",
                  height: "48px",
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
                  <Music2 size={20} style={{ color: "var(--accent)" }} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 overflow-hidden min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {playlist.title}
                </p>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.8125rem",
                    marginTop: "0.2rem",
                  }}
                >
                  {playlist.songs.length} canción
                  {playlist.songs.length !== 1 ? "es" : ""}
                </p>
              </div>

              {/* Eliminar */}
              <button
                className="opacity-0 group-hover:opacity-100 shrink-0 p-2 rounded-lg transition-all"
                style={{ color: "var(--text-muted)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  deletePlaylist(playlist.id);
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
