import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import request from 'supertest'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('should be able to get the user meals summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const date = new Date().toISOString()

    await Promise.all([
      request(app.server).post('/meals').set('Cookie', cookies).send({
        name: 'Dieta legal',
        description: 'Descrição legal 2',
        date,
        isDiet: true,
      }),
      request(app.server).post('/meals').set('Cookie', cookies).send({
        name: 'Dieta legal',
        description: 'Descrição legal 2',
        date,
        isDiet: true,
      }),
      request(app.server).post('/meals').set('Cookie', cookies).send({
        name: 'Dieta legal',
        description: 'Descrição legal 2',
        date,
        isDiet: false,
      }),
      request(app.server).post('/meals').set('Cookie', cookies).send({
        name: 'Dieta legal',
        description: 'Descrição legal 2',
        date,
        isDiet: true,
      }),
    ])

    const summaryResponse = await request(app.server)
      .get('/meals/summary')
      .set('Cookie', cookies)

    expect(summaryResponse.body.summary).toEqual({
      mealsQty: 4,
      inDietQty: 3,
      notInDietQty: 1,
      bestSequence: 2,
    })
  })
})
