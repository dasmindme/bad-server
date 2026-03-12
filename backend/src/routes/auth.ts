import csurf from 'csurf'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
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

const csrfProtection = csurf({ cookie: true })

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
})

authRouter.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

authRouter.get('/user', auth, getCurrentUser)
authRouter.patch('/me', auth, updateCurrentUser)
authRouter.get('/user/roles', auth, getCurrentUserRoles)

authRouter.post('/login', authLimiter, csrfProtection, validateAuthentication, login)
authRouter.get('/token', refreshAccessToken)
authRouter.get('/logout', logout)
authRouter.post('/register', authLimiter, csrfProtection, validateUserBody, register)

export default authRouter