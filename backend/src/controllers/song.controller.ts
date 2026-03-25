import { Request, Response } from "express";
import prisma from "../config/prisma";
import { uploadToCloudinary } from "../config/uploadtoCloudinary";

// POST /api/songs - subir una canción
export const uploadSong = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { title, albumId } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!title) {
      return res.status(400).json({ message: "El título es requerido" });
    }

    if (!files.audio || files.audio.length === 0) {
      return res
        .status(400)
        .json({ message: "El archivo de audio es requerido" });
    }

    const audioFile = files.audio[0];
    const coverFile = files.cover ? files.cover[0] : null;

    // SUBIR AUDIO
    const audioResult = await uploadToCloudinary(
      audioFile.buffer,
      "spotify-clone/songs",
      "video",
    );

    // SUBIR COVER
    let coverUrl: string | null = null;
    if (coverFile) {
      const coverResult = await uploadToCloudinary(
        coverFile.buffer,
        "spotify-clone/covers",
        "image",
      );
      coverUrl = coverResult.url;
    }

    const userId = (req as any).userId;

    // 🔥 OBTENER USUARIO
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // 🔥 BUSCAR O CREAR ARTISTA
    let artist = await prisma.artist.findFirst({
      where: { name: user?.name },
    });

    if (!artist) {
      artist = await prisma.artist.create({
        data: {
          name: user?.name || "Unknown Artist",
          avatarUrl: user?.avatarUrl || null,
        },
      });
    }

    // 🔥 CREAR CANCIÓN
    const song = await prisma.song.create({
      data: {
        title,
        audioUrl: audioResult.url,
        coverUrl,
        duration: Math.round(audioResult.duration ?? 0),
        authorId: userId,
        artistId: artist.id,
        albumId: albumId || null,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        artist: true,
        album: {
          select: { id: true, title: true, coverUrl: true },
        },
      },
    });

    res.status(201).json(song);
  } catch (e) {
    console.error("Error en uploadSong: ", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// GET /api/songs/stream/:id
export const streamSong = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = req.params.id;

    const song = await prisma.song.findUnique({
      where: { id },
    });

    if (!song || !song.audioUrl) {
      return res.status(404).json({ message: "Audio no encontrado" });
    }

    return res.redirect(song.audioUrl);
  } catch (e) {
    console.error("Error en streamSong:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// GET /api/songs
export const getAllSongs = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const songs = await prisma.song.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        artist: true,
        album: {
          select: { id: true, title: true, coverUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(songs);
  } catch (e) {
    console.error("Error en getAllSongs:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// GET /api/songs/:id
export const getSongById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = req.params.id;

    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        artist: true,
        album: {
          select: { id: true, title: true, coverUrl: true },
        },
      },
    });

    if (!song) {
      return res.status(404).json({ message: "Canción no encontrada" });
    }

    res.json(song);
  } catch (e) {
    console.error("Error en getSongById:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// GET /api/songs/search?q=...
export const searchSongs = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res
        .status(400)
        .json({ message: "Parámetro de búsqueda requerido" });
    }

    const songs = await prisma.song.findMany({
      where: {
        OR: [
          {
            title: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            artist: {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        artist: true,
      },
    });

    res.json(songs);
  } catch (e) {
    console.error("Error en searchSongs:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// PATCH /api/songs/:id/play
export const incrementPlays = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = req.params.id;

    await prisma.song.update({
      where: { id },
      data: { plays: { increment: 1 } },
    });

    res.json({ message: "Reproducción registrada" });
  } catch (e) {
    console.error("Error en incrementPlays:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
