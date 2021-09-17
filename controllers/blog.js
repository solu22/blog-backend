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

blogRouter.delete('/api/blogs/:id', async(request, response)=>{
    const id = request.params.id
    // eslint-disable-next-line no-unused-vars
    const deleteBlog = await Blog.findByIdAndDelete(id)
    response.status(204).json({message: 'successfully deleted'})
})

blogRouter.put('/api/blogs/:id', async (request, response)=>{
    const {likes} = request.body 
    const blogObj = {
        likes
    }

    const updateBlog = await Blog.findByIdAndUpdate(request.params.id, blogObj, {new:true})
    response.json(updateBlog)
})

module.exports = blogRouter
