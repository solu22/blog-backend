const blogRouter = require('express').Router()

const Blog = require('../model/blog')

blogRouter.get('/', (request, response)=>{
    response.json('hello test')
})

blogRouter.get('/api/blogs', (request, response) => {
    Blog.find({}).then((blogs) => {
        response.json(blogs)
    })
})

blogRouter.post('/api/blogs', (request, response) => {
    const blog = new Blog(request.body)

    blog.save().then((result) => {
        response.status(201).json(result)
    })
})

module.exports = blogRouter
