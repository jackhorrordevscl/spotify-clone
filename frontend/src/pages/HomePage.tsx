import { useState } from "react";
import { Upload } from "lucide-react";
import { useSongs } from "../hooks/useSongs";
import SongCard from "../components/ui/SongCard";
import { useAuthStore } from "../store/authStore";
import UploadSongModal from "../components/ui/UploadSongModal";

const HomePage = () => {
  const { songs, isLoading, error, refetch } = useSongs();
  const { user } = useAuthStore();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="flex flex-col" style={{ gap: "2.5rem" }}>
      {/* ========== HEADER ========== */}
      <div
        className="flex items-start justify-between gap-4"
        style={{ paddingTop: "0.25rem" }}
      >
        <div className="flex flex-col" style={{ gap: "0.5rem" }}>
          <h1
            className="font-bold"
            style={{
              color: "var(--text-primary)",
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              lineHeight: 1.2,
            }}
          >
            Bienvenido, {user?.name} 👋
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
            ¿Qué quieres escuchar hoy?
          </p>
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 rounded-xl text-sm font-medium transition-colors shrink-0"
          style={{
            padding: "0.625rem 1.25rem",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "var(--accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "var(--border)")
          }
        >
          <Upload size={15} style={{ color: "var(--accent)" }} />
          <span className="hidden sm:inline">Subir canción</span>
          <span className="sm:hidden">Subir</span>
        </button>
      </div>

      {/* ========== CANCIONES ========== */}
      <div className="flex flex-col" style={{ gap: "1.25rem" }}>
        <h2
          className="font-semibold"
          style={{ color: "var(--text-primary)", fontSize: "1.125rem" }}
        >
          Todas las canciones
        </h2>

        {isLoading && (
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse flex flex-col"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  padding: "0.875rem",
                  gap: "0.75rem",
                }}
              >
                <div
                  className="w-full aspect-square rounded-xl"
                  style={{ background: "var(--bg-tertiary)" }}
                />
                <div className="flex flex-col" style={{ gap: "0.5rem" }}>
                  <div
                    className="h-3 rounded-full w-3/4"
                    style={{ background: "var(--bg-tertiary)" }}
                  />
                  <div
                    className="h-3 rounded-full w-1/2"
                    style={{ background: "var(--bg-tertiary)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}

        {!isLoading && !error && songs.length === 0 && (
          <div
            className="flex flex-col items-center"
            style={{
              gap: "0.75rem",
              padding: "4rem 2rem",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "1rem",
            }}
          >
            <span style={{ fontSize: "3rem", color: "var(--text-muted)" }}>
              ♪
            </span>
            <p style={{ color: "var(--text-secondary)" }}>
              No hay canciones disponibles aún
            </p>
          </div>
        )}

        {!isLoading && songs.length > 0 && (
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {songs.map((song) => (
              <SongCard key={song.id} song={song} queue={songs} />
            ))}
          </div>
        )}
      </div>

      {showUpload && (
        <UploadSongModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => refetch()}
        />
      )}
    </div>
  );
};

export default HomePage;
