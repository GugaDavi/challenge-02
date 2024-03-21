import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../../../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { Meal } from '../../../core/entities/meal'

export class MealsHandler {
  public async showMeal(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized.',
      })
    }

    const updateMealParamSchema = z.object({
      id: z.string().uuid(),
    })

    const mealId = updateMealParamSchema.parse(req.params).id

    const meal = await knex('meals')
      .where({ id: mealId, user_id: user.id })
      .first()

    if (!meal) {
      return reply.status(404).send({
        error: 'Meal not found.',
      })
    }

    return reply.status(200).send({
      meal,
    })
  }

  public async listMeals(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized.',
      })
    }

    const meals = await knex('meals').where({ user_id: user.id })

    return reply.status(200).send({
      meals,
    })
  }

  public async createMeal(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized.',
      })
    }

    const createMealSchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string().datetime(),
      isDiet: z.boolean(),
    })

    const meal = createMealSchema.parse(req.body)

    const createdMeal = await knex('meals')
      .insert({ id: randomUUID(), ...meal, user_id: user.id })
      .returning('*')

    return reply.status(201).send({
      meal: createdMeal[0],
    })
  }

  public async updateMeal(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized.',
      })
    }

    const updateMealParamSchema = z.object({
      id: z.string().uuid(),
    })

    const mealId = updateMealParamSchema.parse(req.params).id

    const meal = await knex('meals')
      .where({ id: mealId, user_id: user.id })
      .first()

    if (!meal) {
      return reply.status(404).send({
        error: 'Meal not found.',
      })
    }

    const createMealSchema = z.object({
      name: z.string().nullish().nullable(),
      description: z.string().nullish().nullable(),
      date: z.string().datetime().nullish().nullable(),
      isDiet: z.boolean().nullish().nullable(),
    })

    const bodyMeal = createMealSchema.parse(req.body)

    const mealToUpdate: Meal = {
      id: meal.id,
      name: bodyMeal.name ?? meal.name,
      description: bodyMeal.description ?? meal.description,
      date: bodyMeal.date ?? meal.date,
      isDiet: bodyMeal.isDiet ?? meal.isDiet,
      user_id: meal.user_id,
      created_at: meal.created_at,
      updated_at: new Date().toISOString(),
    }

    const updatedMeal = await knex('meals').update(mealToUpdate).returning('*')

    return reply.status(200).send({
      meal: updatedMeal[0],
    })
  }

  public async deleteMeal(req: FastifyRequest, reply: FastifyReply) {
    const user = req.user

    if (!user) {
      return reply.status(401).send({
        error: 'Unauthorized.',
      })
    }

    const updateMealParamSchema = z.object({
      id: z.string().uuid(),
    })

    const mealId = updateMealParamSchema.parse(req.params).id

    await knex('meals').where({ id: mealId, user_id: user.id }).del()

    return reply.status(204).send()
  }
}
