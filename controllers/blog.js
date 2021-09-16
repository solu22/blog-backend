const blogRouter = require('express').Router()

const Blog = require('../model/blog')

blogRouter.get('/', async (request, response)=>{
    const routeResponse = 'This is home route test'
    response.send(routeResponse)
})

blogRouter.get('/api/blogs', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogRouter.post('/api/blogs', async (request, response) => {
    const blog = new Blog(request.body)
    const blogEntry = await blog.save()
    response.status(201).json(blogEntry)
    
})

module.exports = blogRouter
