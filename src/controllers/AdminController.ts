import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { AuthGuard } from '../auth/AuthGuard'
import { AuthToken } from '../models/AuthToken'

const apiClients: Record<string, { id: string; name: string; secret: string; active: boolean }> = {}

export default class AdminController {
  public async createClient({ request }: HttpContext) {
    const name = request.input('name')
    const client = { id: randomUUID(), name, secret: randomUUID(), active: true }
    apiClients[client.id] = client
    return client
  }

  public async listClients() {
    return Object.values(apiClients)
  }

  public async updateClient({ params, request }: HttpContext) {
    const client = apiClients[params.id]
    if (!client) throw new Error('Not found')
    Object.assign(client, request.only(['name', 'active']))
    return client
  }

  public async getToken({ params }: HttpContext) {
    const token = AuthGuard.getToken(params.id)
    if (!token) throw new Error('Not found')
    return token
  }

  public async revokeToken({ params }: HttpContext) {
    AuthGuard.revokeToken(params.id)
    return { success: true }
  }
}
