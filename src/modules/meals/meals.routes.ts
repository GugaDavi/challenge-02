import { FastifyInstance } from 'fastify'
import { MealsHandler } from './handlers/meals-handler'
import { validateUserSession } from '../../middlewares/validate-user-session'
import { MealsSummary } from './handlers/meals-summary'

const handler = new MealsHandler()
const summaryHandler = new MealsSummary()

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', validateUserSession)

  app.get('/summary', summaryHandler.showMeal)

  app.get('/', handler.listMeals)
  app.get('/:id', handler.showMeal)
  app.post('/', handler.createMeal)
  app.put('/:id', handler.updateMeal)
  app.delete('/:id', handler.deleteMeal)
}
