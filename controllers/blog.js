const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const Blog = require('../model/blog')
const User = require('../model/user')



blogRouter.post('/', async(request, response)=>{
    const body = request.body
    const secret = process.env.JWT_SECRET
    const token = request.token
    const decodedToken = jwt.verify(token,secret )

    if(!token || !decodedToken.id){
        return response.status(401).json({error: 'token missing or invalid'})
    }
    const user = await User.findById(decodedToken.id)

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


blogRouter.delete('/:id', async(request, response)=>{
    const token = request.token
    const secret = process.env.JWT_SECRET
    const decodedToken = jwt.verify(token, secret)
    if(!token || !decodedToken.id)
    {
        response.status(401).json({error:'invalid token or token missing'})
    }
    const user = await User.findById(decodedToken.id)
    const blogId = request.params.id

    if(user.blogs.includes(blogId)){
        await Blog.findByIdAndRemove(blogId)
        response.status(204).end()
    }else{
        response.status(401).json({error:'You are not authenticated'})
    }

})

blogRouter.put('/:id', async (request, response)=>{
    const {likes} = request.body 
    const blogObj = {
        likes
    }

    const updateBlog = await Blog.findByIdAndUpdate(request.params.id, blogObj, {new:true})
    response.json(updateBlog)
})

module.exports = blogRouter
