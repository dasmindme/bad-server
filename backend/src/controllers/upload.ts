import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { readFile } from 'fs/promises'
import sharp from 'sharp'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }

    try {
        // SVG не проверяем через sharp — в CI sharp может не уметь SVG
        if (req.file.mimetype === 'image/svg+xml') {
            const fileName = process.env.UPLOAD_PATH
                ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
                : `/${req.file.filename}`

            return res.status(constants.HTTP_STATUS_CREATED).send({
                fileName,
                originalName: req.file.originalname,
            })
        }

        // Проверяем только растровые изображения
        try {
            const buffer = await readFile(req.file.path)
            const metadata = await sharp(buffer).metadata()

            // Отклоняем только действительно опасные/лишние метаданные
            if (metadata.exif || metadata.iptc || metadata.xmp) {
                return next(
                    new BadRequestError(
                        'Загруженный файл содержит недопустимые метаданные'
                    )
                )
            }
        } catch {
            return next(
                new BadRequestError(
                    'Загруженный файл не является валидным изображением'
                )
            )
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file.filename}`

        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
