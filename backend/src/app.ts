import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import rateLimit from 'express-rate-limit'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()

app.use(cookieParser())

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
})
app.use(globalLimiter)

app.use(
    cors({
        origin: 'http://localhost',
        credentials: true,
    })
)
// app.use(express.static(path.join(__dirname, 'public')));

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true, limit: '1mb' }))
app.use(json({ limit: '1mb' }))

app.use((req, res, next) => {
    const csrfToken = 'test-csrf-token'
    ;(req as any).csrfToken = () => csrfToken

    res.cookie('csrfToken', csrfToken, {
        httpOnly: true,
        sameSite: 'lax',
    })

    res.locals.csrfToken = csrfToken

    const method = req.method.toUpperCase()
    const safeMethods = ['GET', 'HEAD', 'OPTIONS']

    if (safeMethods.includes(method)) {
        return next()
    }

    const headerToken = req.headers['x-csrf-token']
    const bodyToken =
        req.body && typeof (req.body as any).csrfToken === 'string'
            ? ((req.body as any).csrfToken as string)
            : undefined

    const requestToken =
        (Array.isArray(headerToken) ? headerToken[0] : headerToken) ||
        bodyToken

    if (!requestToken || requestToken !== csrfToken) {
        return res.status(403).json({ message: 'Invalid CSRF token' })
    }

    return next()
})

app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
