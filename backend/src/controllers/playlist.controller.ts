import { Request, Response } from "express";
import prisma from "../config/prisma";
import { uploadToCloudinary } from "../config/uploadtoCloudinary";

export const getUserPlaylists = async (req: Request, res: Response) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { userId: req.userId },
      include: {
        songs: {
          include: {
            song: {
              include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { addedAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(playlists);
  } catch (e) {
    console.error("Error en getUserPlaylists:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getPlaylistById = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        songs: {
          include: {
            song: {
              include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { addedAt: "asc" },
        },
      },
    });

    if (!playlist) {
      res.status(404).json({ message: "Playlist no encontrada" });
      return;
    }

    res.json(playlist);
  } catch (e) {
    console.error("Error en getPlaylistById:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const coverFile = req.file;

    if (!title) {
      res.status(400).json({ message: "El título es requerido" });
      return;
    }

    let coverUrl: string | undefined;
    if (coverFile) {
      const result = await uploadToCloudinary(
        coverFile.buffer,
        "spotify-clone/playlist-covers",
        "image",
      );
      coverUrl = result.url;
    }

    const playlist = await prisma.playlist.create({
      data: { title, coverUrl: coverUrl ?? null, userId: req.userId },
      include: { songs: true },
    });

    res.status(201).json(playlist);
  } catch (e) {
    console.error("Error en createPlaylist:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updatePlaylist = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;
    const { title } = req.body;
    const coverFile = req.file;

    const existing = await prisma.playlist.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "Playlist no encontrada" });
      return;
    }
    if (existing.userId !== req.userId) {
      res
        .status(403)
        .json({ message: "No tienes permiso para editar esta playlist" });
      return;
    }

    let coverUrl = existing.coverUrl;
    if (coverFile) {
      const result = await uploadToCloudinary(
        coverFile.buffer,
        "spotify-clone/playlist-covers",
        "image",
      );
      coverUrl = result.url;
    }

    const playlist = await prisma.playlist.update({
      where: { id },
      data: { title: title ?? existing.title, coverUrl },
    });
    res.json(playlist);
  } catch (e) {
    console.error("Error en updatePlaylist:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const id = req.params["id"] as string;

    const existing = await prisma.playlist.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "Playlist no encontrada" });
      return;
    }
    if (existing.userId !== req.userId) {
      res
        .status(403)
        .json({ message: "No tienes permiso para eliminar esta playlist" });
      return;
    }

    await prisma.playlistSong.deleteMany({ where: { playlistId: id } });
    await prisma.playlist.delete({ where: { id } });

    res.json({ message: "Playlist eliminada correctamente" });
  } catch (e) {
    console.error("Error en deletePlaylist:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const addSongToPlaylist = async (req: Request, res: Response) => {
  try {
    const playlistId = req.params["id"] as string;
    const { songId } = req.body;

    if (!songId) {
      res.status(400).json({ message: "songId es requerido" });
      return;
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) {
      res.status(404).json({ message: "Playlist no encontrada" });
      return;
    }
    if (playlist.userId !== req.userId) {
      res
        .status(403)
        .json({ message: "No tienes permiso para modificar esta playlist" });
      return;
    }

    const existing = await prisma.playlistSong.findUnique({
      where: { playlistId_songId: { playlistId, songId } },
    });
    if (existing) {
      res.status(409).json({ message: "La canción ya está en la playlist" });
      return;
    }

    await prisma.playlistSong.create({ data: { playlistId, songId } });
    res.status(201).json({ message: "Canción agregada a la playlist" });
  } catch (e) {
    console.error("Error en addSongToPlaylist:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const removeSongFromPlaylist = async (req: Request, res: Response) => {
  try {
    const playlistId = req.params["id"] as string;
    const songId = req.params["songId"] as string;

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });
    if (!playlist) {
      res.status(404).json({ message: "Playlist no encontrada" });
      return;
    }
    if (playlist.userId !== req.userId) {
      res
        .status(403)
        .json({ message: "No tienes permiso para modificar esta playlist" });
      return;
    }

    await prisma.playlistSong.delete({
      where: { playlistId_songId: { playlistId, songId } },
    });
    res.json({ message: "Canción eliminada de la playlist" });
  } catch (e) {
    console.error("Error en removeSongFromPlaylist:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
