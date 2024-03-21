import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './modules/users/users.routes'
import { mealsRoutes } from './modules/meals/meals.routes'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: '/users',
})
app.register(mealsRoutes, {
  prefix: '/meals',
})
