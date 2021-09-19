const bcrypt = require('bcrypt')

const userRouter = require('express').Router()
const User = require('../model/user')

userRouter.post('/', async (request, response) => {
    const { username, password, name } = request.body
    if (!(username || password)) {
        return response.status(400).json({ error: 'field cannot be empty' })
    }
    if (username.length < 3) {
        return response
            .status(400)
            .json({ error: 'username should be atleast 3 character long' })
    }
    if (password.length < 3) {
        return response
            .status(400)
            .json({ error: 'password should be atleast 3 character long' })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const newUser = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = await newUser.save()
    response.status(201).json(savedUser)
})

userRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs')
    response.json(users)
})

module.exports = userRouter
