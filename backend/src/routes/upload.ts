import { NextFunction, Request, Response, Router } from 'express'
import { uploadFile } from '../controllers/upload'
import fileMiddleware from '../middlewares/file'
import BadRequestError from '../errors/bad-request-error'

const uploadRouter = Router()

const MIN_FILE_SIZE = 2 * 1024

const minFileSizeGuard = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const file = req.file

    if (!file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    if (file.size <= MIN_FILE_SIZE) {
        return next(
            new BadRequestError('Размер файла слишком мал (меньше 2KB)')
        )
    }

    return next()
}

uploadRouter.post(
    '/',
    (req, res, next) => {
        res.on('finish', () => {
            // eslint-disable-next-line no-console
            console.error('[upload.finish]', res.statusCode)
        })
        next()
    },
    fileMiddleware.single('file'),
    (req, _res, next) => {
        // eslint-disable-next-line no-console
        console.error('[upload.file]', {
            hasFile: !!req.file,
            size: req.file?.size,
            mimetype: req.file?.mimetype,
            originalname: req.file?.originalname,
            filename: req.file?.filename,
            path: req.file?.path,
        })
        next()
    },
    minFileSizeGuard,
    uploadFile
)

export default uploadRouter
