/* eslint-disable no-unused-vars */

const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../model/blog')
const User = require('../model/user')
const helper = require('./test_helper')

jest.setTimeout(60000)
beforeEach(async ()=>{
    await Blog.deleteMany({})
    await User.deleteMany({})
    const user = new User(helper.initUser)
    await user.save()
    const userinBlog= helper.initBlogs.map(blog=> blog.user = user.id)
    const blogObj= await helper.initBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObj.map(blog=> blog.save())
    await Promise.all(promiseArray)
})

test('blog posts are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('blog returns unique identifier as id not _id', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0]['id']).toBeDefined()
})

test('a valid post can be added', async()=>{
    const blogObj = {
        title: 'tokentest',
        author: 'Async',
        url: 'https:test.com',
        likes:2
    }
    const token = await helper.userToken()
    await api.post('/api/blogs').set('Authorization',`bearer ${token}`).send(blogObj)
    const latestBlog = await helper.blogsInDB()
    const contents = latestBlog.map((post) => post.author)
    expect(contents).toContainEqual('Async')
    expect(latestBlog).toHaveLength(helper.initBlogs.length+1)
})

test('missing likes from post results gives 0 as default value', async () => {
    
    const blogObj = {
        title: 'likes test',
        author: 'likes',
        url: 'https://likestest.com',
    }
    const token = await helper.userToken()
    await api.post('/api/blogs').set('Authorization', `bearer ${token}`).send(blogObj)
    const data = await helper.blogsInDB()
    const author = data.find((l) => l.author === 'likes')
    expect(author.likes).toBe(0 || undefined)
})

test('missing title and url', async () => {
    const blogObj = {
        author: 'bad request test'
    }
    const token = await helper.userToken()
    await api.post('/api/blogs').set('Authorization', `bearer ${token}`).send(blogObj).expect(400)
    const data = await helper.blogsInDB()
    expect(data).toHaveLength(helper.initBlogs.length)
})

test('deleting blog returns original length - 1', async ()=>{
    const initialBlogState = await helper.blogsInDB()
    const targetBlog = initialBlogState[0]
    const token = await helper.userToken()
    await api.delete(`/api/blogs/${targetBlog.id}`).set('Authorization', `bearer ${token}`).expect(200)
    const afterDelete = await helper.blogsInDB()
    expect(afterDelete).toHaveLength(initialBlogState.length-1)
    
})

test('update likes of blog', async()=>{
    const initialBlogState = await helper.blogsInDB()
    const targetBlog = initialBlogState[0]
    const token = await helper.userToken()
    await api.put(`/api/blogs/${targetBlog.id}`).set('Authorization', `bearer ${token}`).send({likes: targetBlog.likes +1}).expect(200)
    const afterUpdate = await api.get(`/api/blogs/${targetBlog.id}`)
    expect(afterUpdate.body.likes).toBe(targetBlog.likes +1)
})

test('blog without Authorization header cannot be added', async()=>{
    const blogObj = {
        title: 'without header',
        author:'need header',
        url:'headertest.com',
        likes: 0
    }

    await api.post('/api/blogs').send(blogObj).expect(401)
    const getBlogData = await helper.blogsInDB()
    expect(getBlogData).toHaveLength(helper.initBlogs.length)
})

afterAll(() => {
    mongoose.connection.close()
})
