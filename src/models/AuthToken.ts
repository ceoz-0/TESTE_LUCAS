export type GrantType = 'session' | 'api'

export interface AuthToken {
  id: string
  userId: string
  clientId: string
  grantType: GrantType
  abilities: string[]
  revoked: boolean
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
}
