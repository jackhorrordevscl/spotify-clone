import multer from 'multer'

//GUARDAMOS EL ARCHIVO EN MEMORIA COMO BUFFER
//NO SE ESCRIBE EN EL DISCO
const storage = multer.memoryStorage()

const upload = multer({
    storage,
    limits: {
        fieldSize: 20 * 1024 * 1024 // 20MB Max
    },
    fileFilter: (req, file, cb) => {
        //SOLO ACEPTAMOS AUDIO E IMAGENES
        const allowedAudioTypes = [
          "audio/mpeg",
          "audio/wav",
          "audio/flac",
          "audio/mp3",
          'application/octet-stream',
        ];
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
        const allowed = [...allowedAudioTypes, ...allowedImageTypes]

        if (allowed.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`))
        }
    }
})

export default upload