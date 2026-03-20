import { Request, Response } from "express";
import prisma from "../config/prisma";
import { uploadToCloudinary } from "../config/uploadtoCloudinary";

//POST /api/songs - subir una canción
export const uploadSong = async (req: Request, res: Response) => {
  try {
    const { title, albumId } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!title) {
      res.status(400).json({ message: "El título es requerido" });
      return;
    }
    if (!files.audio || files.audio.length === 0) {
      res.status(400).json({ message: "El archivo de audio es requerido" });
      return;
    }

    const audioFile = files.audio[0];
    const coverFile = files.cover ? files.cover[0] : null;

    //SUBIR AUDIO A CLOUDINARY
    const audioResult = await uploadToCloudinary(
      audioFile.buffer,
      "spotify-clone/songs",
      "video", // CLOUDINARY USA 'VIDEO' PARA AUDIO
    );

    //SUBIR PORTADA SI EXSITE
    let coverUrl: string | undefined;
    if (coverFile) {
      const coverResult = await uploadToCloudinary(
        coverFile.buffer,
        "spotify-clone/covers",
        "image",
      );
      coverUrl = coverResult.url;
    }

    //GUARDAR EN BASE DE DATOS
    const song = await prisma.song.create({
      data: {
        title,
        audioUrl: audioResult.url,
        coverUrl: coverUrl ?? null,
        duration: Math.round(audioResult.duration ?? 0),
        authorId: (req as any).userId,
        albumId: albumId ?? null,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
    res.status(201).json(song);
  } catch (e) {
    console.error("Error en uploadSong: ", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

//GET /api/songs - OBTENER LAS CANCIONES
export const getAllSongs = async (req: Request, res: Response) => {
  try {
    const songs = await prisma.song.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        album: {
          select: { id: true, title: true, coverUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(songs);
  } catch (e) {
    console.error("Error en getAllSongs:", e);
    res.status(500).json({ message: "Error interno del servidor " });
  }
};

//GET /API/SONGS/:ID - OBTENER CANCIONES POR ID
export const getSongById = async (req: Request, res: Response) => {
  try {
    const id  = req.params['id'] as string

    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        album: {
          select: { id: true, title: true, coverUrl: true },
        },
      },
    });

    if (!song) {
      res.status(404).json({ message: "Canción no encontrada " });
      return;
    }
    res.json(song);
  } catch (e) {
    console.error("Error en getSongById:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

//GET /API/SONGS/SEARCH?Q=QUERY - BUSCAR CANCIONES
export const searchSongs = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      res.status(400).json({ message: "Parámetro de búsqueda requerido" });
      return;
    }

    const songs = await prisma.song.findMany({
      where: {
        title: {
          contains: q,
          mode: "insensitive", //BUSQUEDA CASE-SENSITIVE
        },
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    res.json(songs);
  } catch (e) {
    console.error("Error en searchSongs:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

//PATCH /api/songs/:id/play - INCREMENTAR CONTADOR DE REPRODUCCIONES
export const incrementPlays = async (req: Request, res: Response) => {
  try {
    const id  = req.params['id'] as string;

    await prisma.song.update({
      where: { id },
      data: { plays: { increment: 1 } },
    });
    res.json({ message: "Reproducción registrada" });
  } catch (e) {
    console.error("Error en incrementPlays:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}
