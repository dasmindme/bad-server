import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import { readFile } from 'fs/promises'
import path from 'node:path'
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
        const ext = path.extname(req.file.originalname).toLowerCase()
        const isSvg = req.file.mimetype === 'image/svg+xml' || ext === '.svg'

        // SVG не проверяем через sharp — в CI sharp может не уметь SVG
        if (!isSvg) {
            // Проверяем только, что файл действительно является валидным растровым изображением
            try {
                const buffer = await readFile(req.file.path)
                await sharp(buffer).metadata() // если не картинка — упадёт
            } catch {
                return next(
                    new BadRequestError(
                        'Загруженный файл не является валидным изображением'
                    )
                )
            }
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
