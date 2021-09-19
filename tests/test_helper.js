const jwt  = require('jsonwebtoken')
const Blog = require('../model/blog')
const User = require('../model/user')

const initBlogs = [
    {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
        __v: 0,
    },
    {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0,
    },
]

const initUser = {
    name: 'auth',
    username: 'auth',
    password: 'auth'
}

const userToken = async ()=>{
    const user = await User.findOne({ username:initUser.username})
    const payload = {
        username: user.username, id: user.id, name: user.name
    }
    return jwt.sign(payload, process.env.JWT_SECRET)
}

const blogsInDB = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async ()=>{
    const users = await User.find({})
    return users.map(user=>user.toJSON())
}

module.exports = { initBlogs, blogsInDB, usersInDb,initUser,userToken }
