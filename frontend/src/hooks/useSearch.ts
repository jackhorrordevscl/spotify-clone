import { useState, useEffect } from "react";
import api from "../services/api";
import { Song } from "./useSongs";

export const useSearch = (query: string) => {
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      setIsLoading(true);
      api
        .get(`/songs/search?q=${encodeURIComponent(query)}`)
        .then(({ data }) => setResults(data))
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false));
    }, 400); // debounce de 400ms para no spamear la API

    return () => clearTimeout(timeout);
  }, [query]);

  return { results, isLoading };
};
