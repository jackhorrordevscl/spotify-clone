// mobile/src/hooks/useAudioPlayer.ts
import { useEffect, useRef } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import { usePlayerStore } from "../store/playerStore";

export const useAudioPlayer = () => {
  const { currentSong, isPlaying, volume, setCurrentTime, playNext } =
    usePlayerStore();

  const soundRef = useRef<Audio.Sound | null>(null);

  // 🔹 Cargar nueva canción
  useEffect(() => {
    const loadAndPlay = async () => {
      if (!currentSong) return;

      // Detener y liberar audio anterior
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentSong.audioUrl },
        { shouldPlay: isPlaying, volume },
        (status: AVPlaybackStatus) => {
          // ✅ Solo procesar si es un estado válido
          if (!status.isLoaded) return;

          setCurrentTime((status.positionMillis ?? 0) / 1000);

          if ((status as any).didJustFinish) {
            playNext();
          }
        },
      );

      soundRef.current = sound;
    };

    loadAndPlay();
  }, [currentSong]);

  // 🔹 Play / Pause
  useEffect(() => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.playAsync().catch(() => {});
    } else {
      soundRef.current.pauseAsync().catch(() => {});
    }
  }, [isPlaying]);

  // 🔹 Volumen
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(volume).catch(() => {});
    }
  }, [volume]);

  // 🔹 Seek manual
  const seek = async (time: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(time * 1000);
      setCurrentTime(time);
    }
  };

  // 🔹 Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  return { seek };
};
