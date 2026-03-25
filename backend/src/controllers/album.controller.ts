import { Request, Response } from "express";
import prisma from "../config/prisma";

/**
 * POST /api/albums
 * Crear álbum
 */
export const createAlbum = async (req: Request, res: Response) => {
  try {
    const { title, artistId, coverUrl } = req.body;

    if (!title || !artistId) {
      return res
        .status(400)
        .json({ message: "title y artistId son obligatorios" });
    }

    // validar artista
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
    });

    if (!artist) {
      return res.status(404).json({ message: "Artista no encontrado" });
    }

    const album = await prisma.album.create({
      data: {
        title,
        coverUrl,
        artistId,
      },
    });

    res.status(201).json(album);
  } catch (e) {
    console.error("Error en createAlbum:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
