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
    <div className="flex flex-col gap-10">
      {/* HEADER — saludo + botón subir */}
      <div className="flex items-start justify-between pt-2">
        <div className="flex flex-col gap-2">
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Bienvenido, {user?.name} 👋
          </h1>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            ¿Qué quieres escuchar hoy?
          </p>
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
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
          <Upload size={16} style={{ color: "var(--accent)" }} />
          Subir canción
        </button>
      </div>

      {/* CANCIONES */}
      <div className="flex flex-col gap-5">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Todas las canciones
        </h2>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-4 flex flex-col gap-3 animate-pulse"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-full aspect-square rounded-lg"
                  style={{ background: "var(--bg-tertiary)" }}
                />
                <div className="flex flex-col gap-2">
                  <div
                    className="h-3 rounded w-3/4"
                    style={{ background: "var(--bg-tertiary)" }}
                  />
                  <div
                    className="h-3 rounded w-1/2"
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
            className="flex flex-col items-center gap-3 py-16 rounded-xl"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: 48, color: "var(--text-muted)" }}>♪</span>
            <p style={{ color: "var(--text-secondary)" }}>
              No hay canciones disponibles aún
            </p>
          </div>
        )}

        {!isLoading && songs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} queue={songs} />
            ))}
          </div>
        )}
      </div>

      {/* MODAL SUBIR CANCIÓN */}
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
