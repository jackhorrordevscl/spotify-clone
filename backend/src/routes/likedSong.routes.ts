import { Router, Request, Response } from 'express'
import prisma from '../config/prisma'
import authMiddleware from '../middlewares/auth.middleware'

const router = Router()

router.use(authMiddleware)

//GET /api/liked - OBTENER CANCIONES LIKEADAS
router.get('/', async (req: Request, res: Response) => {
    const userId = (req as any).userId
    const liked = await prisma.likedSong.findMany({
        where: { userId },
        include: {
            song: {
                include: {
                    author: { select: { id: true, name: true, avatarUrl: true } }
                }
            }
        },
        orderBy: { likedAt: 'desc' }
    })
    res.json(liked)
})

//POST /api/liked/ - LIKEAR CANCION
router.post('/', async (req: Request, res: Response) => {
    const userId = (req as any).userId
    const { songId } = req.body

    const existing = await prisma.likedSong.findUnique({
        where: { userId_songId: { userId, songId } }
    })

    if (existing) {
        res.status(409).json({ message: 'Ya likeaste la canción' })
        return
    }

    await prisma.likedSong.create({ data: { userId, songId } })
    res.status(201).json({ message: 'Canción likeada' })
}) 

//DELETE /api/liked/:songId - QUITAR LIKE
router.delete('/:songId', async (req: Request, res: Response) => {
    const userId = (req as any).userId
    const songId = req.params['songId'] as string

    await prisma.likedSong.delete({
        where: { userId_songId: { userId, songId } }
    })
    res.json({ message: 'Like eliminado' })
})

export default router