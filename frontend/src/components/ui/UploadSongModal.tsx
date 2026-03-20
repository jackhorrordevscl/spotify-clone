import { useState, useRef } from "react";
import { X, Upload, Music2 } from "lucide-react";
import api from "../../services/api";
import { useSongs } from "../../hooks/useSongs";

interface Props {
  onClose: () => void;
  onUploaded: () => void;
}

const UploadSongModal = ({ onClose, onUploaded }: Props) => {
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("El título es requerido");
      return;
    }
    if (!audioFile) {
      setError("Seleccione un archivo de audio");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("audio", audioFile);
      if (coverFile) formData.append("cover", coverFile);

      await api.post("/songs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUploaded();
      onClose();
    } catch {
      setError("Error al subir la canción");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(8,13,18,0.85)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl flex flex-col gap-5"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          padding: "2rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===================== HEADER ===================== */}

        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Subir canción
          </h2>
          <button
            onClick={onClose}
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <X size={20} />
          </button>
        </div>

        {/* ===================== COVER PREVIEW Y SELECTOR ===================== */}

        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
            }}
            onClick={() => coverInputRef.current?.click()}
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <Music2 size={28} style={{ color: "var(--text-muted)" }} />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Portada
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Opcional · JPG, PNG, WebP
            </p>
            <button
              onClick={() => coverInputRef.current?.click()}
              className="text-xs mt-1 w-fit"
              style={{ color: "var(--accent)" }}
            >
              Seleccionar Imagen
            </button>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={handleCoverChange}
          />
        </div>

        {/* ===================== TITULO ===================== */}

        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nombre de la canción"
            className="rounded-xl text-sm outline-none"
            style={{
              padding: "0.625rem 1rem",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        {/* ===================== AUDIO ===================== */}

        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Archivo de Audio
          </label>
          <div
            className="flex items-center gap-3 rounded-xl cursor-pointer transition-colors"
            style={{
              padding: "0.625rem 1rem",
              background: "var(--bg-tertiary)",
              border: `1px solid ${audioFile ? "var(--accent)" : "var(--border)"}`,
            }}
            onClick={() => audioInputRef.current?.click()}
          >
            <Upload
              size={16}
              style={{
                color: audioFile ? "var(--accent)" : "var(--text-muted)",
              }}
            />
            <span
              className="text-sm truncate"
              style={{
                color: audioFile ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              {audioFile ? audioFile.name : "MP3, WAV, FLAC · máx 20MB"}
            </span>
          </div>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/flac,audio/mp3"
            className="hidden"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* ===================== ERROR ===================== */}

        {error && (
          <p className="text-xs text-center" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}

        {/* ===================== BOTONES ===================== */}

        <div className="flex gap-3 mt-1">
            <button
                onClick={onClose}
                className="flex-1 rounded-xl text-sm font-medium"
                style={{ 
                    padding: '0.625rem',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                 }}
            >
                Cancelar
            </button>
            <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 rounded-xl text-sm font-semibold transition-opacity"
                style={{ 
                    padding: '0.625rem',
                    background: 'var(--accent)',
                    color: '#080d12',
                    opacity: isUploading ? 0.6 : 1
                 }}
                >
                {isUploading ? 'Subiendo...' : 'Subir Canción'}
            </button>
        </div>
      </div>
    </div>
  )
}

export default UploadSongModal
