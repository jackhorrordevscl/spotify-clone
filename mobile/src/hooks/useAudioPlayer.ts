// mobile/src/hooks/useAudioPlayer.ts
import { useEffect, useRef } from "react";
import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeIOS,
  InterruptionModeAndroid,
} from "expo-av";
import { usePlayerStore } from "../store/playerStore";

export const useAudioPlayer = () => {
  const { currentSong, isPlaying, volume, setCurrentTime, playNext } =
    usePlayerStore();

  const soundRef = useRef<Audio.Sound | null>(null);

  // Configurar audio
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!currentSong) return;

    const loadAndPlay = async () => {
      // unload anterior
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentSong.audioUrl },
        { shouldPlay: isPlaying, volume },
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;

        if ("positionMillis" in status) {
          setCurrentTime(status.positionMillis / 1000);
        }
        if ("didJustFinish" in status && status.didJustFinish) {
          playNext();
        }
      });

      if (isPlaying) {
        await sound.playAsync();
      }
    };

    loadAndPlay().catch(console.error);

    return () => {
      soundRef.current?.unloadAsync().catch(console.error);
    };
  }, [currentSong]);

  useEffect(() => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.playAsync().catch(console.error);
    } else {
      soundRef.current.pauseAsync().catch(console.error);
    }
  }, [isPlaying]);

  useEffect(() => {
    soundRef.current?.setVolumeAsync(volume).catch(console.error);
  }, [volume]);

  const seek = async (time: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(time * 1000);
    setCurrentTime(time);
  };

  return { seek };
};
