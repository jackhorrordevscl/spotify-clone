import { useEffect, useRef, useState } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import { usePlayerStore } from "../store/playerStore";
import api from "../api/api";

export const useAudioPlayer = () => {
  const { currentSong, isPlaying, volume, setCurrentTime, playNext } =
    usePlayerStore();
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadingId = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // ✅ Control de carga real

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  }, []);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setCurrentTime(status.positionMillis / 1000);
    if (status.didJustFinish && !status.isLooping) {
      playNext();
    }
  };

  // EFECTO DE CARGA
  useEffect(() => {
    if (!currentSong?.id) return;

    const loadAudio = async () => {
      if (loadingId.current === currentSong.id) return;

      setIsLoaded(false); // Bloquear comandos hasta que cargue

      try {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        loadingId.current = currentSong.id;

        // ✅ URL LIMPIA (sin espacios) y asegurando que sea absoluta
        const streamUrl =
          `${api.defaults.baseURL}/songs/stream/${currentSong.id}`.trim();

        const { sound } = await Audio.Sound.createAsync(
          { uri: streamUrl },
          {
            shouldPlay: isPlaying, // Si ya estaba en play, inicia solo al cargar
            volume: volume,
          },
          onPlaybackStatusUpdate,
        );

        soundRef.current = sound;
        setIsLoaded(true); // ✅ Liberar comandos de play/pause
      } catch (e) {
        console.error("Error en Railway Stream:", e);
        loadingId.current = null;
      }
    };

    loadAudio();
  }, [currentSong?.id]);

  // EFECTO DE CONTROL (Sincronizado con isLoaded)
  useEffect(() => {
    const syncStatus = async () => {
      // 🛑 No hacer nada si el sonido no existe o no ha terminado de cargar
      if (!soundRef.current || !isLoaded) return;

      try {
        if (isPlaying) {
          await soundRef.current.playAsync();
        } else {
          await soundRef.current.pauseAsync();
        }
      } catch (e) {
        console.log("Error al sincronizar audio:", e);
      }
    };

    syncStatus();
  }, [isPlaying, isLoaded]); // Reacciona al cambio de Play O al terminar la carga

  return {
    seek: async (time: number) => {
      if (!soundRef.current || !isLoaded) return;
      await soundRef.current.setPositionAsync(time * 1000);
    },
  };
};
