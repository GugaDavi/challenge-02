import { FastifyInstance } from 'fastify'
import { UserHandler } from './handlers/user-handler'
import { validateUserSession } from '../../middlewares/validate-user-session'

const handler = new UserHandler()

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', handler.createUser)

  app.get('/:id', { preHandler: validateUserSession }, handler.getUser)
  app.get('/', { preHandler: validateUserSession }, handler.getUser)
  app.patch(
    '/:id',
    { preHandler: validateUserSession },
    handler.updateUserSession,
  )
  app.put('/:id', { preHandler: validateUserSession }, handler.updateUser)
}
