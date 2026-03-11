import csurf from 'csurf'
import { Router } from 'express'
import {
    getCurrentUser,
    getCurrentUserRoles,
    login,
    logout,
    refreshAccessToken,
    register,
    updateCurrentUser,
} from '../controllers/auth'
import auth from '../middlewares/auth'
import {
    validateAuthentication,
    validateUserBody,
} from '../middlewares/validations'

const authRouter = Router()

// csrfProtection хранит секрет в cookie (требует cookie-parser, уже подключён в app.ts)
const csrfProtection = csurf({ cookie: true })

// GET /auth/csrf-token — возвращает CSRF-токен для форм входа и регистрации
authRouter.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() })
})

authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, updateCurrentUser)
authRouter.get('/roles', auth, getCurrentUserRoles)
authRouter.post('/login', csrfProtection, validateAuthentication, login)
authRouter.get('/token', refreshAccessToken)
authRouter.get('/logout', logout)
authRouter.post('/register', csrfProtection, validateUserBody, register)

export default authRouter
