const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../model/user')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ name: 'rootUser', username: 'root', passwordHash })

    await user.save()
})

describe('While creating a new User', () => {
    test('when username or password field is empty', async () => {
        const initialState = await helper.usersInDb()
        const userObjTotest = {
            name: 'test',
        }

        const result = await api
            .post('/api/users')
            .send(userObjTotest)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(result.body.error).toContain('field cannot be empty')
        const latestUser = await helper.usersInDb()
        expect(latestUser).toHaveLength(initialState.length)
        const usernames = latestUser.map((u) => u.username)
        expect(usernames).not.toContain(userObjTotest.username)
    })

    test('username length with less than 3', async () => {
        const initialState = await helper.usersInDb()
        const userObjTotest = {
            username: 't',
            name: 'test',
            password: '111',
        }
        const result = await api
            .post('/api/users')
            .send(userObjTotest)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(result.body.error).toContain(
            'username should be atleast 3 character long'
        )
        const latestUser = await helper.usersInDb()
        expect(latestUser).toHaveLength(initialState.length)
        const usernames = latestUser.map((u) => u.username)
        expect(usernames).not.toContain(userObjTotest.username)
    })

    test('password length with less than 3', async () => {
        const initialState = await helper.usersInDb()
        const userObjTotest = {
            username: 'test',
            name: 'test',
            password: '1',
        }
        const result = await api
            .post('/api/users')
            .send(userObjTotest)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(result.body.error).toContain(
            'password should be atleast 3 character long'
        )
        const latestUser = await helper.usersInDb()
        expect(latestUser).toHaveLength(initialState.length)
    })

    test('when username is not unique', async () => {
        const initialState = await helper.usersInDb()
        const userObjTotest = {
            username: 'root',
            name: 'unique usernameTest',
            password: '111',
        }
        const result = await api
            .post('/api/users')
            .send(userObjTotest)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(result.body.error).toContain(
            'User validation failed: username: Error'
        )
        const latestUser = await helper.usersInDb()
        expect(latestUser).toHaveLength(initialState.length)
    })

    test('creation succeeds with a fresh username', async () => {
        const initialState = await helper.usersInDb()

        const userObjTotest = {
            username: 'nuru7',
            name: 'nurus',
            password: 'nurus',
        }

        await api
            .post('/api/users')
            .send(userObjTotest)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const latestUser = await helper.usersInDb()
        expect(latestUser).toHaveLength(initialState.length + 1)

        const usernames = latestUser.map((u) => u.username)
        expect(usernames).toContain(userObjTotest.username)
    })
})

afterAll(() => {
    mongoose.connection.close()
})
