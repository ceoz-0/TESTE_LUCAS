import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { AuthToken, GrantType } from '../models/AuthToken'
import { User } from '../models/User'

// Simple in-memory stores for demonstration only
const tokens: Record<string, AuthToken> = {}
const users: Record<string, User> = {}

export class AuthGuard {
  constructor(private ctx: HttpContext) {}

  /**
   * Authenticate request using session or Bearer token.
   * Provide expected grant types. When empty, accepts both.
   */
  public async authenticate(allow: GrantType[] = ['session', 'api']): Promise<User | null> {
    const authorization = this.ctx.request.header('authorization')

    if (authorization && authorization.startsWith('Bearer ')) {
      const tokenId = authorization.replace('Bearer ', '')
      const token = tokens[tokenId]
      if (!token || token.revoked || token.expiresAt < new Date()) {
        return null
      }
      if (!allow.includes(token.grantType)) {
        return null
      }
      return users[token.userId] || null
    }

    // fallback to session
    const sessionUserId = this.ctx.session.get('userId') as string | undefined
    if (sessionUserId && allow.includes('session')) {
      return users[sessionUserId] || null
    }

    return null
  }

  /**
   * Generates a pair of access/refresh tokens for a user and grant type
   */
  public static issueTokens(user: User, grantType: GrantType, abilities: string[] = []): { accessToken: AuthToken; refreshToken: AuthToken } {
    const now = new Date()
    const accessToken: AuthToken = {
      id: randomUUID(),
      userId: user.id,
      clientId: user.id,
      grantType,
      abilities,
      revoked: false,
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(now.getTime() + 1000 * 60 * 15), // 15min
    }

    const refreshToken: AuthToken = {
      ...accessToken,
      id: randomUUID(),
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30), // 30 days
    }

    tokens[accessToken.id] = accessToken
    tokens[refreshToken.id] = refreshToken

    return { accessToken, refreshToken }
  }

  public static revokeToken(id: string): void {
    const token = tokens[id]
    if (token) {
      token.revoked = true
    }
  }

  public static getToken(id: string): AuthToken | undefined {
    return tokens[id]
  }
}
