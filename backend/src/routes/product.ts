import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
} from '../controllers/products'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import {
    validateObjId,
    validateProductBody,
    validateProductUpdateBody,
} from '../middlewares/validations'
import { Role } from '../models/user'

const productRouter = Router()

const strictLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
})

productRouter.get('/', strictLimiter, getProducts)
productRouter.post(
    '/',
    auth,
    roleGuardMiddleware(Role.Admin),
    validateProductBody,
    createProduct
)
productRouter.delete(
    '/:productId',
    auth,
    roleGuardMiddleware(Role.Admin),
    validateObjId,
    deleteProduct
)
productRouter.patch(
    '/:productId',
    auth,
    roleGuardMiddleware(Role.Admin),
    validateObjId,
    validateProductUpdateBody,
    updateProduct
)

export default productRouter
