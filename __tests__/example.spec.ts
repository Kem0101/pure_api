/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/semi */

import app from '../index'
import { describe, test, expect } from '@jest/globals'
import { Server } from 'http'
import request from 'supertest'

let server: Server

beforeAll((done) => {
  const PORT = process.env.PORT || 4000
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`)
    done()
  })
})

afterAll(() => {
  server.close()
})

describe('Get /user/:id', () => {
  test('Should response status code 200 if the resource exist and return an object', async () => {
    const userId = '6454050fa6dcbfbf590b91f9'
    const response = await request(app).get(`/api/user/${userId}`).send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toBeInstanceOf(Object)
  })

  test('Should response status code 404 if the resource not exist', async () => {
    const nonExistenUserId = ''
    const response = await request(app).get(`/api/user/${nonExistenUserId}`)

    expect(response.statusCode).toBe(404)
  })
})

// I will continue to test the other functions in a more complex way.
