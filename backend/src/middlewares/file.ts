import { Request, Express } from 'express'
import multer from 'multer'
import { join, extname } from 'path'
import { mkdirSync } from 'fs'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        const destination = join(
            __dirname,
            process.env.UPLOAD_PATH_TEMP
                ? `../public/${process.env.UPLOAD_PATH_TEMP}`
                : '../public'
        )

        // Гарантируем, что директория для временных файлов существует
        mkdirSync(destination, { recursive: true })

        cb(null, destination)
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const ext = extname(file.originalname).toLowerCase()
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
        cb(null, uniqueName)
    },
})

export default multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
})
