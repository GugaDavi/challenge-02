// eslint-disable-next-line
import { Knex } from 'knex'
// ou faça apenas:
// import 'knex'

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string
      session_id: string
      name: string
      goal: number
      created_at: string
      updated_at: string
    }
  }
}

declare module 'knex/types/tables' {
  export interface Tables {
    users: User
    meals: Meal
  }
}
