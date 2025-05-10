import multer from 'multer'
import fs from 'fs'
import path from 'path'

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir) // Set the destination to the uploads directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, `${uniqueSuffix}-${file.originalname}`)
    }
})

const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'audio/mpeg',
        'audio/mp3',
        'audio/m4a',
        'audio/wav',
        'audio/mp4',
        'video/mp4',
        'video/3gpp',
        'audio/3gpp',
        'image/gif',
        'image/heic',
        'video/webm',
        'audio/aac',
        'audio/amr',
        'audio/ogg'
    ]
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(
            new Error(
                'Invalid file type. Only JPEG, PNG, JPG, GIF, HEIC, MP3, M4A, WAV, MP4, 3GP, AAC, AMR, OGG, WEBM are allowed.'
            )
        )
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
})

export default upload
