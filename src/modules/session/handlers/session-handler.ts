import { FastifyReply } from 'fastify'

export class SessionHandler {
  public async createSession(newSessionsToken: string, reply: FastifyReply) {
    reply.setCookie('sessionId', newSessionsToken, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
  }
}
