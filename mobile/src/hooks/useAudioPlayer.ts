// mobile/src/hooks/useAudioPlayer.ts
import { useEffect, useRef } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import { usePlayerStore } from "../store/playerStore";
import api from "../api/api";

export const useAudioPlayer = () => {
  const { currentSong, isPlaying, volume, setCurrentTime, playNext } =
    usePlayerStore();

  const soundRef = useRef<Audio.Sound | null>(null);

  // Configurar el modo de audio al montar el hook
  // Permite reproducir con el dispositivo en silencio (importante en iOS)
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
  }, []);

  // Cambio de canción — cargar y reproducir
  useEffect(() => {
    if (!currentSong) return;

    const loadAndPlay = async () => {
      // Descargar el sonido anterior antes de cargar el nuevo
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentSong.audioUrl },
        { shouldPlay: false, volume },
      );

      soundRef.current = sound;

      // Actualizar el tiempo actual y detectar cuando termina la canción
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        setCurrentTime(status.positionMillis / 1000);
        if (status.didJustFinish) playNext();
      });

      // Registrar la reproducción en la API
      api.patch(`/songs/${currentSong.id}/play`).catch(() => {});
    };

    loadAndPlay().catch(console.error);

    // Cleanup: descargar el audio al desmontar o cambiar de canción
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [currentSong]);

  // Play / Pause
  useEffect(() => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.playAsync().catch(console.error);
    } else {
      soundRef.current.pauseAsync().catch(console.error);
    }
  }, [isPlaying]);

  // Volumen
  useEffect(() => {
    soundRef.current?.setVolumeAsync(volume).catch(console.error);
  }, [volume]);

  // Seek manual desde el MiniPlayer
  const seek = async (time: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(time * 1000);
      setCurrentTime(time);
    }
  };

  return { seek };
};
