import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import request from 'supertest'

describe('Users routes', () => {
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

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })
      .expect(201)
  })

  it('should be able to get user by sessionId', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const userResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)

    expect(userResponse.body.user).toEqual(
      expect.objectContaining({
        name: 'John Doe',
      }),
    )
  })

  it('should be able to get user by id', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const userBySessionIdResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)

    const userResponse = await request(app.server)
      .get(`/users/${userBySessionIdResponse.body.user.id}`)
      .set('Cookie', cookies)

    expect(userResponse.body.user).toEqual(
      expect.objectContaining({
        name: 'John Doe',
      }),
    )
  })

  it('should be able to update user session', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const originalCookies = createTransactionResponse.get('Set-Cookie')

    const userBySessionIdResponse = await request(app.server)
      .get('/users')
      .set('Cookie', originalCookies)

    const userResponse = await request(app.server)
      .patch(`/users/${userBySessionIdResponse.body.user.id}`)
      .set('Cookie', originalCookies)

    const newCookie = userResponse.get('Set-Cookie')

    expect(originalCookies === newCookie).toBeFalsy()
  })

  it('should be able to update user', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
      })

    const originalCookies = createTransactionResponse.get('Set-Cookie')

    const userBySessionIdResponse = await request(app.server)
      .get('/users')
      .set('Cookie', originalCookies)

    const userResponse = await request(app.server)
      .put(`/users/${userBySessionIdResponse.body.user.id}`)
      .send({
        name: 'John Doe 1',
      })
      .set('Cookie', originalCookies)

    expect(userResponse.body.user).toEqual(
      expect.objectContaining({
        name: 'John Doe 1',
      }),
    )
  })
})
