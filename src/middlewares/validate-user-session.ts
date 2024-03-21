import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function validateUserSession(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  const user = await knex('users').where('session_id', sessionId).select()

  if (!user) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }

  request.user = user[0]
}
