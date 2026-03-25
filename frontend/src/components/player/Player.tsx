import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const Player = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    togglePlay,
    setVolume,
    playNext,
    playPrev,
  } = usePlayerStore();

  // ✅ Toda la lógica de audio en el hook — el componente solo renderiza
  const { seek } = useAudioPlayer();

  const [expanded, setExpanded] = useState(false);

  if (!currentSong) {
    return (
      <div
        className="flex items-center justify-center"
        style={{
          height: "72px",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Selecciona una canción para reproducir
        </p>
      </div>
    );
  }

  const progress =
    currentSong.duration > 0 ? (currentTime / currentSong.duration) * 100 : 0;

  const progressBar = (
    <div className="flex items-center w-full" style={{ gap: "0.625rem" }}>
      <span
        className="tabular-nums text-right shrink-0"
        style={{
          color: "var(--text-muted)",
          fontSize: "0.6875rem",
          width: "2.25rem",
        }}
      >
        {formatTime(currentTime)}
      </span>
      <div
        className="flex-1 rounded-full cursor-pointer"
        style={{ height: "3px", background: "var(--bg-tertiary)", minWidth: 0 }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          seek(pct * currentSong.duration);
        }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, background: "var(--accent)" }}
        />
      </div>
      <span
        className="tabular-nums shrink-0"
        style={{
          color: "var(--text-muted)",
          fontSize: "0.6875rem",
          width: "2.25rem",
        }}
      >
        {formatTime(currentSong.duration)}
      </span>
    </div>
  );

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
      }}
    >
      {/* Barra de progreso expandible en mobile */}
      {expanded && (
        <div className="md:hidden" style={{ padding: "0.75rem 1.25rem 0" }}>
          {progressBar}
        </div>
      )}

      <div
        className="flex items-center"
        style={{
          height: "80px",
          padding: "0 clamp(1rem, 3vw, 2rem)",
          gap: "clamp(0.75rem, 2vw, 1.5rem)",
        }}
      >
        {/* Info canción */}
        <div
          className="flex items-center shrink-0"
          style={{ gap: "0.875rem", width: "clamp(140px, 25%, 280px)" }}
        >
          <div
            className="rounded-xl shrink-0 overflow-hidden"
            style={{
              width: "48px",
              height: "48px",
              background: "var(--bg-tertiary)",
            }}
          >
            {currentSong.coverUrl ? (
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span style={{ fontSize: 20, color: "var(--accent)" }}>♪</span>
              </div>
            )}
          </div>
          <div className="overflow-hidden min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {currentSong.title}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--text-secondary)", marginTop: "0.2rem" }}
            >
              {currentSong.artist.name}
            </p>
          </div>
        </div>

        {/* Controles centrales */}
        <div
          className="flex-1 flex flex-col items-center min-w-0"
          style={{ gap: "0.5rem" }}
        >
          <div className="flex items-center" style={{ gap: "1.5rem" }}>
            <button
              onClick={playPrev}
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
            >
              <SkipBack size={19} />
            </button>
            <button
              onClick={togglePlay}
              className="flex items-center justify-center rounded-full transition-transform hover:scale-105"
              style={{
                background: "var(--accent)",
                width: "40px",
                height: "40px",
                flexShrink: 0,
              }}
            >
              {isPlaying ? (
                <Pause size={17} style={{ color: "#080d12" }} />
              ) : (
                <Play size={17} style={{ color: "#080d12", marginLeft: 2 }} />
              )}
            </button>
            <button
              onClick={playNext}
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
            >
              <SkipForward size={19} />
            </button>
          </div>
          {/* Barra de progreso — solo desktop */}
          <div className="hidden md:flex w-full" style={{ maxWidth: "520px" }}>
            {progressBar}
          </div>
        </div>

        {/* Volumen (desktop) + botón expand (mobile) */}
        <div
          className="flex items-center shrink-0"
          style={{ gap: "0.75rem" }}
        >
          <div
            className="hidden md:flex items-center"
            style={{ gap: "0.625rem", width: "130px" }}
          >
            <Volume2
              size={15}
              style={{ color: "var(--text-secondary)", flexShrink: 0 }}
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1"
              style={{ accentColor: "var(--accent)", height: "3px" }}
            />
          </div>
          <button
            className="md:hidden p-1 rounded-lg"
            style={{ color: "var(--text-muted)" }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
