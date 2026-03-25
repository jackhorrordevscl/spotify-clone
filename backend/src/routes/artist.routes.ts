import { Router } from "express";
import {
  getAllArtists,
  getArtistById,
  getAlbumsByArtist,
  getSongsByArtist,
} from "../controllers/artist.controller";

const router = Router();

router.get("/", getAllArtists);
router.get("/:id", getArtistById);
router.get("/:id/albums", getAlbumsByArtist);
router.get("/:id/songs", getSongsByArtist);

export default router;
