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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Tu biblioteca
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ background: "var(--accent)", color: "#080d12", padding: '7px' }}
        >
          <Plus size={16} />
          Nueva playlist
        </button>
      </div>

      {/* Input nueva playlist */}
      {showInput && (
        <div
          className="flex gap-2 p-4 rounded-xl"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nombre de la playlist"
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <button
            onClick={handleCreate}
            disabled={isCreating || !newTitle.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
            style={{
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
            className="px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl animate-pulse"
              style={{ background: "var(--bg-secondary)" }}
            />
          ))}
        </div>
      )}

      {/* Sin playlists */}
      {!isLoading && playlists.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 py-20 rounded-xl"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <Music2 size={40} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
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

      {/* Lista de playlists */}
      {!isLoading && playlists.length > 0 && (
        <div className="flex flex-col gap-2">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
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
                className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ background: "var(--bg-tertiary)" }}
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
              <div className="flex-1 overflow-hidden">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {playlist.title}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {playlist.songs.length} canción
                  {playlist.songs.length !== 1 ? "es" : ""}
                </p>
              </div>

              {/* Eliminar */}
              <button
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all"
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
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
