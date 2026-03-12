import { NextFunction, Request, Response } from 'express'

function hasDollarKeys(x: unknown): boolean {
    if (!x || typeof x !== 'object') return false
    if (Array.isArray(x)) return x.some(hasDollarKeys)

    for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
        if (k.startsWith('$')) return true
        if (hasDollarKeys(v)) return true
    }
    return false
}

export default function noInjection(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const queryStrings = Object.values(req.query).filter(
        (v) => typeof v === 'string'
    ) as string[]

    const hasSuspiciousQuery = queryStrings.some((s) =>
        s.includes('"$') || s.includes("'$") || s.includes('$')
    )

    if (hasDollarKeys(req.body) || hasSuspiciousQuery) {
        return res.status(400).json({ message: 'Invalid query' })
    }

    return next()
}
