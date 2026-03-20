// mobile/src/components/Player.tsx
import { Audio } from "expo-av";
import { useEffect, useRef } from "react";
import { usePlayerStore } from "../store/playerStore";

export const useAudioPlayer = () => {
  const { currentSong, isPlaying, volume, setCurrentTime, playNext } =
    usePlayerStore();
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!currentSong) return;

    const loadAndPlay = async () => {
      // Descargar sonido anterior
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentSong.audioUrl },
        { shouldPlay: isPlaying, volume },
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setCurrentTime(status.positionMillis / 1000);
        if (status.didJustFinish) playNext();
      });
    };

    loadAndPlay();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [currentSong]);

  useEffect(() => {
    if (!soundRef.current) return;
    isPlaying ? soundRef.current.playAsync() : soundRef.current.pauseAsync();
  }, [isPlaying]);

  useEffect(() => {
    soundRef.current?.setVolumeAsync(volume);
  }, [volume]);

  const seek = async (time: number) => {
    await soundRef.current?.setPositionAsync(time * 1000);
    setCurrentTime(time);
  };

  return { seek };
};
