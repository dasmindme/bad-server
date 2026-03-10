import { NextFunction, Request, Response, Router } from 'express'
import { uploadFile } from '../controllers/upload'
import fileMiddleware from '../middlewares/file'
import BadRequestError from '../errors/bad-request-error'

const uploadRouter = Router()

const MIN_FILE_SIZE = 1

const minFileSizeGuard = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const file = req.file

    if (!file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    if (file.size < MIN_FILE_SIZE) {
        return next(
            new BadRequestError('Размер файла слишком мал (меньше 2KB)')
        )
    }

    return next()
}

uploadRouter.post(
    '/',
    fileMiddleware.single('file'),
    minFileSizeGuard,
    uploadFile
)

export default uploadRouter
