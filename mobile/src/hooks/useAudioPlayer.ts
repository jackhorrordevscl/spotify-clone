import { useEffect, useRef } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import { usePlayerStore } from "../store/playerStore";
import api from "../api/api";

export const useAudioPlayer = () => {
  const { currentSong, isPlaying, volume, setCurrentTime, playNext } =
    usePlayerStore();
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadingRef = useRef<string | null>(null);

  useEffect(() => {
    //Configuración global necesaria para Android
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

  useEffect(() => {
    if (!currentSong?.id) return;

    let isMounted = true;

    const loadAudio = async () => {
      //no reintentar recargar canción si ya se está cargando
      if (loadingRef.current === currentSong.id) return;

      try {
        //limpiar rastros de la carga anterior antes de cargar uno nuevo
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        loadingRef.current = currentSong.id;

        //creación y carga del sonido
        const { sound } = await Audio.Sound.createAsync(
          { uri: `${api.defaults.baseURL}/songs/stream/${currentSong.id}` },
          {
            shouldPlay: isPlaying, // si el store confirma que está en play, sonido empieza
            volume: volume,
          },
          onPlaybackStatusUpdate,
        );
        if (isMounted) {
          soundRef.current = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch (e) {
        console.error("Error crítico en useAudioPlayer:", e);
        loadingRef.current = null;
      }
    };

    loadAudio();
    return () => {
      isMounted = false;
    };
  }, [currentSong?.id]);

  useEffect(() => {
    const syncStatus = async () => {
      if (!soundRef.current) return;

      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;

      if (isPlaying) {
        await soundRef.current.playAsync();
      } else {
        await soundRef.current.pauseAsync();
      }
    };
    syncStatus();
  }, [isPlaying]); //se dispara cuando cambia el estado de play/pause

  const seek = async (time: number) => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.setPositionAsync(time * 1000);
    } catch (e) {
      console.log("Seek Error (useAudioPlayer.ts): ", e);
    }
  };

  return { seek };
};
