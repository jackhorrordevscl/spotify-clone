import { Request, Response } from "express";
import prisma from "../config/prisma";

/**
 * POST /api/artists
 * Crear artista
 */
export const createArtist = async (req: Request, res: Response) => {
  try {
    const { name, avatarUrl } = req.body;

    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const artist = await prisma.artist.create({
      data: {
        name,
        avatarUrl,
      },
    });

    res.status(201).json(artist);
  } catch (e) {
    console.error("Error en createArtist:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * GET /api/artists
 * Lista todos los artistas con sus álbumes (ligero)
 */
export const getAllArtists = async (req: Request, res: Response) => {
  try {
    const artists = await prisma.artist.findMany({
      include: {
        albums: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(artists);
  } catch (e) {
    console.error("Error en getAllArtists:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * GET /api/artists/:id
 * Artista con álbumes y canciones
 */
export const getArtistById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const id = req.params.id;

    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        albums: {
          include: {
            songs: {
              include: {
                album: {
                  select: {
                    id: true,
                    title: true,
                    coverUrl: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
        songs: {
          include: {
            album: {
              select: {
                id: true,
                title: true,
                coverUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!artist) {
      return res.status(404).json({ message: "Artista no encontrado" });
    }

    res.json(artist);
  } catch (e) {
    console.error("Error en getArtistById:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * GET /api/artists/:id/albums
 */
export const getAlbumsByArtist = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const artistId = req.params.id;

    const albums = await prisma.album.findMany({
      where: { artistId },
      include: {
        songs: {
          include: {
            artist: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(albums);
  } catch (e) {
    console.error("Error en getAlbumsByArtist:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * GET /api/artists/:id/songs
 */
export const getSongsByArtist = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const artistId = req.params.id;

    const songs = await prisma.song.findMany({
      where: { artistId },
      include: {
        album: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
          },
        },
        artist: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(songs);
  } catch (e) {
    console.error("Error en getSongsByArtist:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};