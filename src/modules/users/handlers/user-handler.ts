import { randomUUID } from 'crypto'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../../../database'
import { SessionHandler } from '../../session/handlers/session-handler'

const sessionHandler = new SessionHandler()

export class UserHandler {
  public async createUser(req: FastifyRequest, reply: FastifyReply) {
    const createUserSchema = z.object({
      name: z.string(),
      goal: z
        .number()
        .positive()
        .nullish()
        .nullable()
        .transform((val) => val ?? 0.5),
    })

    const result = createUserSchema.safeParse(req.body)

    if (!result.success) {
      console.log(result.error)
      return reply.status(400).send({
        error: 'Invalid request body',
      })
    }

    const { name, goal } = result.data

    const newSessionToken = randomUUID()

    await knex('users').insert({
      id: randomUUID(),
      name,
      goal,
      session_id: newSessionToken,
    })

    await sessionHandler.createSession(newSessionToken, reply)

    return reply.status(201).send()
  }

  public async updateUser(req: FastifyRequest, reply: FastifyReply) {
    const sessionId = req.cookies.sessionId

    const user = await knex('users')
      .where('session_id', sessionId)
      .select()
      .first()

    if (!user) {
      return reply.status(401).send({
        error: 'User not found',
      })
    }

    const updateUserSchema = z.object({
      name: z.string().nullish().nullable(),
      goal: z.number().positive().nullish().nullable(),
    })

    const result = updateUserSchema.safeParse(req.body)

    if (!result.success) {
      console.log(result.error)
      return reply.status(400).send({
        error: 'Invalid request body',
      })
    }

    const { name, goal } = result.data

    if (name) {
      user.name = name
    }

    if (goal) {
      user.goal = goal
    }

    const newSessionToken = randomUUID()

    const updatedUser = await knex('users')
      .where('id', user.id)
      .update({
        ...user,
        updated_at: new Date().toISOString(),
        session_id: newSessionToken,
      })
      .returning('*')

    await sessionHandler.createSession(newSessionToken, reply)

    return reply.status(200).send({
      user: updatedUser[0],
    })
  }

  public async updateUserSession(req: FastifyRequest, reply: FastifyReply) {
    const sessionId = req.cookies.sessionId

    const user = await knex('users')
      .where('session_id', sessionId)
      .select()
      .first()

    if (!user) {
      return reply.status(401).send({
        error: 'User not found',
      })
    }

    const newSessionToken = randomUUID()

    await knex('users').where('id', user.id).update({
      session_id: newSessionToken,
    })

    await sessionHandler.createSession(newSessionToken, reply)

    return reply.status(200).send()
  }

  public async getUser(req: FastifyRequest, reply: FastifyReply) {
    const sessionId = req.cookies.sessionId

    const user = await knex('users')
      .where('session_id', sessionId)
      .select()
      .first()

    if (!user) {
      return reply.status(401).send({
        error: 'User not found',
      })
    }

    return reply.status(200).send({
      user,
    })
  }
}
