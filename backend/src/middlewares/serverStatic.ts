import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    const normalizedBaseDir = path.resolve(baseDir)

    return (req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('..')) {
            return next()
        }

        const filePath = path.resolve(normalizedBaseDir, `.${req.path}`)

        if (!filePath.startsWith(normalizedBaseDir)) {
            return next()
        }

        // Проверяем, существует ли файл
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // Файл не существует отдаем дальше мидлварам
                return next()
            }
            // Файл существует, отправляем его клиенту
            return res.sendFile(filePath, (sendErr) => {
                if (sendErr) {
                    next(sendErr)
                }
            })
        })
    }
}
