// frontend/src/hooks/useAudioPlayer.ts
// Encapsula toda la lógica del HTMLAudioElement
// El componente Player solo consume este hook — sin effectos de audio directos

import { useEffect, useRef } from "react";
import { usePlayerStore } from "../store/playerStore";
import api from "../services/api";

export const useAudioPlayer = () => {
  const { currentSong, isPlaying, volume, setCurrentTime, playNext } =
    usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar el elemento de audio una sola vez
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  // Cambio de canción
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    audioRef.current.src = currentSong.audioUrl;
    audioRef.current.volume = volume;

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
      api.patch(`/songs/${currentSong.id}/play`).catch(() => {});
    }

    audioRef.current.ontimeupdate = () => {
      setCurrentTime(audioRef.current!.currentTime);
    };

    audioRef.current.onended = () => {
      playNext();
    };
  }, [currentSong]);

  // Play / Pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Seek manual desde el Player
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return { seek };
};
