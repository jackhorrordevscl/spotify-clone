import { Router } from 'express'
import {
    getUserPlaylists,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
} from '../controllers/playlist.controller'
import authMiddleware from '../middlewares/auth.middleware'
import upload from '../config/multer'

const router = Router()

//TODAS LAS RUTAS DE PLAYLIST REQUIEREN AUTENTIFICACIÓN
router.use(authMiddleware)

router.get('/', getUserPlaylists)
router.post("/", upload.single("cover"), createPlaylist)

router.post("/:id/songs", addSongToPlaylist)
router.delete("/:id/songs/:songId", removeSongFromPlaylist);

router.get('/:id', getPlaylistById)

router.patch('/:id', upload.single('cover'), updatePlaylist)
router.delete('/:id', deletePlaylist)



export default router