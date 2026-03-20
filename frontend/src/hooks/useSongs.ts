import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

interface Author {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Song {
  id: string;
  title: string;
  audioUrl: string;
  coverUrl: string | null;
  duration: number;
  plays: number;
  author: Author;
}

export const useSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSongs = useCallback(() => {
    setIsLoading(true)
    api.get('/songs')
      .then(({ data }) => setSongs(data))
      .catch(() => setError('No se pudieron cargar las canciones'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchSongs()
  }, [fetchSongs]);

  return { songs, isLoading, error, refetch: fetchSongs };
};
