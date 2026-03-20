import { useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import api from "../../services/api";

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
    setCurrentTime,
    playNext,
    playPrev,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  //  ===============   CREAR O ACTUALIZAR EL ELEMENTO DE AUDIO ===============

  useEffect(() => {
    if (!currentSong) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src = currentSong.audioUrl;
    audioRef.current.volume = volume;

    if (isPlaying) {
      audioRef.current.play();

      // =============== REGISTRAR PLAY EN LA API ===============

      api.patch(`/songs/${currentSong.id}/play`).catch(() => {});
    }

    audioRef.current.ontimeupdate = () => {
      setCurrentTime(audioRef.current!.currentTime);
    };

    audioRef.current.onended = () => {
      playNext();
    };
  }, [currentSong]);

  // =============== CONTROLAR PLAY/PAUSE ===============

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // =============== CONTROLAR VOLUMEN ===============

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!currentSong) {
    return (
      <div
        className="flex items-center justify-center px-8"
        style={{
          height: "88px",
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

  return (
    <div
      className="flex items-center px-8 gap-6"
      style={{
        height: "88px",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
        padding: '20px',
      }}
    >
      {/* =============== INFO CANCIÓN ===============*/}

      <div className="flex items-center gap-4 w-72 flex-shrink-0">
        <div
          className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden"
          style={{ background: "var(--bg-tertiary)" }}
        >
          {currentSong.coverUrl ? (
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span style={{ fontSize: 22, color: "var(--accent)" }}>♪</span>
            </div>
          )}
        </div>
        <div className="overflow-hidden">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {currentSong.title}
          </p>
          <p
            className="text-xs mt-1 truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {currentSong.author.name}
          </p>
        </div>
      </div>

      {/* =============== CONTROLES CENTRALES =============== */}

      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex items-center gap-6">
          <button
            onClick={playPrev}
            className="transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            <SkipBack size={20} />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105"
            style={{ background: "var(--accent)" }}
          >
            {isPlaying ? (
              <Pause size={18} style={{ color: "#080d12" }} />
            ) : (
              <Play size={18} style={{ color: "#080d12", marginLeft: 2 }} />
            )}
          </button>

          <button
            onClick={playNext}
            className="transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* =============== BARRA DE PROGRESO =============== */}

        <div className="flex items-center gap-3 w-full max-w-lg">
          <span
            className="text-xs w-9 text-right tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 h-1 rounded-full cursor-pointer relative group"
            style={{ background: "var(--bg-tertiary)" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              const newTime = pct * currentSong.duration;
              if (audioRef.current) audioRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: "var(--accent)" }}
            />
          </div>
          <span
            className="text-xs w-9 tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            {formatTime(currentSong.duration)}
          </span>
        </div>
      </div>

      {/* =============== VOLUMEN =============== */}

      <div className="flex items-center gap-3 w-36 flex-shrink-0">
        <Volume2 size={16} style={{ color: "var(--text-secondary)" }} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 h-1"
          style={{ accentColor: "var(--accent)" }}
        />
      </div>
    </div>
  );
};

export default Player;
