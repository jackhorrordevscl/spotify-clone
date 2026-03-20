import { Router } from 'express'
import {
    uploadSong,
    getAllSongs,
    getSongById,
    searchSongs,
    incrementPlays
} from '../controllers/song.controller'
import authMiddleware from '../middlewares/auth.middleware'
import upload from '../config/multer'

const router = Router()

//RUTAS PUBLICAS
router.get('/', getAllSongs)
router.get("/search", searchSongs);
router.get("/:id", getSongById);
router.get("/:id/play", incrementPlays);

//RUTAS PROTEGIDAS
router.post(
    '/',
    authMiddleware,
    upload.fields([
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 }
    ]),
    uploadSong
)

export default router