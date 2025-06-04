import Route from '@adonisjs/core/services/router'
import AuthController from '../controllers/AuthController'
import AdminController from '../controllers/AdminController'
import { AuthGuard } from '../auth/AuthGuard'

const authController = new AuthController()
const adminController = new AdminController()

Route.post('/auth/login', (ctx) => authController.login(ctx))
Route.post('/auth/register', (ctx) => authController.register(ctx))
Route.post('/auth/refresh', (ctx) => authController.refresh(ctx))

Route.group(() => {
  Route.post('/api/clients', (ctx) => adminController.createClient(ctx))
  Route.get('/api/clients', (ctx) => adminController.listClients())
  Route.patch('/api/clients/:id', (ctx) => adminController.updateClient(ctx))
  Route.get('/auth/token/:id', (ctx) => adminController.getToken(ctx))
  Route.patch('/auth/token/:id', (ctx) => adminController.revokeToken(ctx))
})
  .middleware(async (ctx, next) => {
    const guard = new AuthGuard(ctx)
    const user = await guard.authenticate(['session', 'api'])
    if (!user) {
      ctx.response.status(401)
      return
    }
    await next()
  })
