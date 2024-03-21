import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../../../database'

export class MealsSummary {
  public async showMeal(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized.',
      })
    }

    const meals = await knex('meals')
      .where({ user_id: user.id })
      .orderBy('date', 'desc')

    let inDiet = 0
    let notInDiet = 0
    let bestSequence = 0
    let sequenceCounter = 0

    for (const meal of meals) {
      if (meal.isDiet) {
        sequenceCounter++
        inDiet++
      } else {
        notInDiet++
        sequenceCounter = 0
      }

      if (sequenceCounter > bestSequence) {
        bestSequence = sequenceCounter
      }
    }

    return reply.status(200).send({
      summary: {
        mealsQty: meals.length,
        inDietQty: inDiet,
        notInDietQty: notInDiet,
        bestSequence,
      },
    })
  }
}
