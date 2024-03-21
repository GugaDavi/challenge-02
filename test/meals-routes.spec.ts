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

  it('should be able to register a new meal', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const date = new Date().toISOString()

    const mealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Dieta legal',
        description: 'Descrição legal 2',
        date,
        isDiet: true,
      })

    expect(mealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Dieta legal',
        description: 'Descrição legal 2',
        date,
        isDiet: 1,
      }),
    )
  })

  it('should be able to get a meal', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const date = new Date().toISOString()

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Dieta legal',
        description: 'Descrição legal 2',
        date,
        isDiet: true,
      })

    const mealsResponse = await request(app.server)
      .get(`/meals/${createMealResponse.body.meal.id}`)
      .set('Cookie', cookies)

    expect(mealsResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Dieta legal',
        description: 'Descrição legal 2',
        date,
        isDiet: 1,
      }),
    )
  })

  it('should be able to get all meals', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const date = new Date().toISOString()

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Dieta legal',
      description: 'Descrição legal 2',
      date,
      isDiet: true,
    })

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(mealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Dieta legal',
        description: 'Descrição legal 2',
        date,
        isDiet: 1,
      }),
    ])
  })

  it('should be able to update a meal', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const date = new Date().toISOString()

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Dieta legal',
        description: 'Descrição legal 2',
        date,
        isDiet: true,
      })

    const mealsResponse = await request(app.server)
      .put(`/meals/${createMealResponse.body.meal.id}`)
      .set('Cookie', cookies)
      .send({
        description: 'Updated description',
      })

    expect(mealsResponse.body.meal).toEqual(
      expect.objectContaining({
        description: 'Updated description',
      }),
    )
  })

  it('should be able to delete a meal', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const date = new Date().toISOString()

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Dieta legal',
        description: 'Descrição legal 2',
        date,
        isDiet: true,
      })

    await request(app.server)
      .delete(`/meals/${createMealResponse.body.meal.id}`)
      .set('Cookie', cookies)

    await request(app.server)
      .get(`/meals/${createMealResponse.body.meal.id}`)
      .set('Cookie', cookies)
      .expect(404)
  })
})
