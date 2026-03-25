import { Router } from "express";
import {
  createArtist, // 👈 agregar
  getAllArtists,
  getArtistById,
  getAlbumsByArtist,
  getSongsByArtist,
} from "../controllers/artist.controller";

const router = Router();

// 👉 Crear artista
router.post("/", createArtist);

// 👉 Obtener artistas
router.get("/", getAllArtists);
router.get("/:id", getArtistById);
router.get("/:id/albums", getAlbumsByArtist);
router.get("/:id/songs", getSongsByArtist);

export default router;
