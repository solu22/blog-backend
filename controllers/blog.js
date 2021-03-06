
const blogRouter = require('express').Router()
const Blog = require('../model/blog')
const middleware = require('../utils/middleware')



blogRouter.post('/',middleware.tokenExtractor,middleware.userExtractor ,async(request, response)=>{
    const body = request.body
    // eslint-disable-next-line no-unused-vars
    const token = request.token
    const user = request.user

    const blog= new Blog({
        ...body, user:user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.json(savedBlog)
})

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user')
    response.json(blogs)
})


blogRouter.delete('/:id',middleware.tokenExtractor, middleware.userExtractor, async(request, response)=>{
    // eslint-disable-next-line no-unused-vars
    const token = request.token
    const user = request.user
    const blogId = request.params.id

    if(user.blogs.includes(blogId)){
        await Blog.findByIdAndRemove(blogId)
        user.blogs = user.blogs.filter((blogId)=>{
            return blogId.toString()!== blogId
        })
        await user.save()
        response.status(204).end()
    }else{
        response.status(401).json({error:'You are not authenticated'})
    }

})

blogRouter.put('/:id', middleware.tokenExtractor,middleware.userExtractor, async (request, response)=>{
    const body = request.body
    // eslint-disable-next-line no-unused-vars
    const token = request.token
    const user = request.user
    const blogToUpdate = await Blog.findById(request.params.id)
    if(blogToUpdate.user._id.toString() === user._id.toString()){
        const blogObj ={
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            comments: body.comments
        }
        const updateBlog = await Blog.findByIdAndUpdate(request.params.id, blogObj, {new:true})
        return response.json(updateBlog)
    }else{
        response.status(401).json({error:'Not permitted'})
    }
    

   
})

blogRouter.post('/:id/comments', async (request, response) => {
    const blog = await Blog .findById(request.params.id)
    blog.comments = blog.comments.concat(request.body.comment)
    await blog.save()
    response.json(blog)
})

module.exports = blogRouter
