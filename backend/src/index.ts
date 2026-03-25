import express, { Router } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import authRoutes from './routes/auth.routes'
import songRoutes from './routes/song.routes'
import playlistRoutes from './routes/playlist.routes'
import likedSongRoutes from './routes/likedSong.routes'
import artistRoutes from './routes/artist.routes'



const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`>>> ${req.method} ${req.url}`);
  next();
});

//RUTAS
app.use('/api/auth', authRoutes)
app.use('/api/songs', songRoutes)
app.use('/api/playlists', playlistRoutes)
app.use('/api/liked', likedSongRoutes)
app.use('/api/artists', artistRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'OK' })
})


app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})