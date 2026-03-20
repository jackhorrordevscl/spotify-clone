// frontend/src/types.ts
// Fuente única de verdad para todos los tipos compartidos del frontend

export interface Author {
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

export interface PlaylistSong {
  songId: string;
  addedAt: string;
  song: Song;
}

export interface Playlist {
  id: string;
  title: string;
  coverUrl: string | null;
  createdAt: string;
  songs: PlaylistSong[];
}
