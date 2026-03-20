import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);

// GET /api/liked
router.get("/", async (req: Request, res: Response) => {
  try {
    const liked = await prisma.likedSong.findMany({
      where: { userId: req.userId },
      include: {
        song: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { likedAt: "desc" },
    });
    res.json(liked);
  } catch (e) {
    console.error("Error en GET /liked:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// POST /api/liked
router.post("/", async (req: Request, res: Response) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      res.status(400).json({ message: "songId es requerido" });
      return;
    }

    // Verificar que la canción existe
    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      res.status(404).json({ message: "Canción no encontrada" });
      return;
    }

    const existing = await prisma.likedSong.findUnique({
      where: { userId_songId: { userId: req.userId, songId } },
    });
    if (existing) {
      res.status(409).json({ message: "Ya likeaste esta canción" });
      return;
    }

    await prisma.likedSong.create({ data: { userId: req.userId, songId } });
    res.status(201).json({ message: "Canción likeada" });
  } catch (e) {
    console.error("Error en POST /liked:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// DELETE /api/liked/:songId
router.delete("/:songId", async (req: Request, res: Response) => {
  try {
    const songId = req.params['songId'] as string;

    const existing = await prisma.likedSong.findUnique({
      where: { userId_songId: { userId: req.userId, songId } },
    });
    if (!existing) {
      res.status(404).json({ message: "Like no encontrado" });
      return;
    }

    await prisma.likedSong.delete({
      where: { userId_songId: { userId: req.userId, songId } },
    });
    res.json({ message: "Like eliminado" });
  } catch (e) {
    console.error("Error en DELETE /liked:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
