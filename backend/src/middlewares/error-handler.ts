import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import ConflictError from '../errors/conflict-error'
import ForbiddenError from '../errors/forbidden-error'
import NotFoundError from '../errors/not-found-error'
import UnauthorizedError from '../errors/unauthorized-error'

// ВРЕМЕННЫЙ лог для диагностики upload в CI
// Логи будут видны в GitHub Actions и помогут понять статус/сообщение на /upload

export default (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // eslint-disable-next-line no-console
    console.error('[error-handler]', {
        path: req.path,
        message: err.message,
        name: err.name,
    })

    if (err instanceof BadRequestError) {
        return res
            .status(constants.HTTP_STATUS_BAD_REQUEST)
            .send({ message: err.message })
    }

    if (err instanceof UnauthorizedError) {
        return res
            .status(constants.HTTP_STATUS_UNAUTHORIZED)
            .send({ message: err.message })
    }

    if (err instanceof ForbiddenError) {
        return res
            .status(constants.HTTP_STATUS_FORBIDDEN)
            .send({ message: err.message })
    }

    if (err instanceof NotFoundError) {
        return res
            .status(constants.HTTP_STATUS_NOT_FOUND)
            .send({ message: err.message })
    }

    if (err instanceof ConflictError) {
        return res
            .status(constants.HTTP_STATUS_CONFLICT)
            .send({ message: err.message })
    }

    return res
        .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: 'На сервере произошла ошибка' })
}
