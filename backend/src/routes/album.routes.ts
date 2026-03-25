import { Router } from "express";
import { createAlbum } from "../controllers/album.controller";

const router = Router();

// Crear álbum
router.post("/", createAlbum);

export default router;
