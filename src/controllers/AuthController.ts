import { randomUUID } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import { AuthGuard } from '../auth/AuthGuard'
import { User } from '../models/User'

// In-memory store for demo
const users: Record<string, User> = {}

export default class AuthController {
  public async register({ request }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user: User = { id: randomUUID(), email, password, isActive: true }
    users[user.id] = user
    const tokens = AuthGuard.issueTokens(user, 'session')
    return {
      accessToken: tokens.accessToken.id,
      refreshToken: tokens.refreshToken.id,
      clientId: user.id,
    }
  }

  public async login({ request, session }: HttpContext) {
    const { identifier, secret, grantType } = request.only(['identifier', 'secret', 'grantType'])
    const user = Object.values(users).find((u) => u.email === identifier)
    if (!user || user.password !== secret) {
      throw new Error('Invalid credentials')
    }

    if (grantType === 'session') {
      session.put('userId', user.id)
    }

    const tokens = AuthGuard.issueTokens(user, grantType)
    return {
      accessToken: tokens.accessToken.id,
      refreshToken: tokens.refreshToken.id,
      clientId: user.id,
    }
  }

  public async refresh({ request }: HttpContext) {
    const { refreshToken } = request.only(['refreshToken'])
    const token = AuthGuard.getToken(refreshToken)
    if (!token || token.revoked || token.expiresAt < new Date()) {
      throw new Error('Invalid token')
    }
    const user = users[token.userId]
    const tokens = AuthGuard.issueTokens(user, token.grantType)
    return {
      accessToken: tokens.accessToken.id,
      refreshToken: tokens.refreshToken.id,
      clientId: user.id,
    }
  }
}
