import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

interface Artist {
    id: string;
    name: string;
}

interface Album {
  id: string;
  title: string;
  coverUrl: string | null;
}

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
  artist: Artist;
  album: Album | null;
  author: Author | null;
}

const normalizeSong = (song : any): Song => {
  return {
    id: song.id,
    title: song.title,
    audioUrl: song.audioUrl,
    coverUrl: song.coverUrl,
    duration: song.duration,
    plays: song.plays,
    artist: song.artist 
    ? {
        id: song.artist.id,
        name: song.artist.name,
    }
    : {
        id: song.author.id,
        name: song.author.name,
    },
    album: song.album 
    ? { 
        id: song.album.id,
        title: song.album.title,
        coverUrl: song.album.cover
      }
      : null,
    author: song.author, 
  };
};

export const useSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSongs = useCallback(() => {
    setIsLoading(true)
    api.get('/songs')
      .then(({ data }) => {
        const normalized = data.map(normalizeSong);
        setSongs(normalized);
      })
      .catch(() => setError('No se pudieron cargar las canciones'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchSongs()
  }, [fetchSongs]);

  return { songs, isLoading, error, refetch: fetchSongs };
};
