/* eslint-disable no-unused-vars */

const { response } = require('express')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../model/blog')
const helper = require('./blog_api_test_helper')

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObj = new Blog(helper.initBlogs[0])
    await blogObj.save()
    blogObj = new Blog(helper.initBlogs[1])
    await blogObj.save()
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

test('a valid post can be added', async () => {
    const blogObj = {
        title: 'supertest',
        author: 'Async',
        url: 'https://test.com',
    }

    await api
        .post('/api/blogs')
        .send(blogObj)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    const response = await api.get('/api/blogs')
    const contents = response.body.map((post) => post.author)
    expect(response.body).toHaveLength(helper.initBlogs.length + 1)
    expect(contents).toContainEqual('Async')
})

test('missing likes from post results gives 0 as default value', async () => {
    const blogObj = {
        title: 'likes test',
        author: 'likes',
        url: 'https://likestest.com',
    }

    await api.post('/api/blogs').send(blogObj).expect(201)
    const data = await helper.blogsInDB()
    const author = data.find((l) => l.author === 'likes')
    expect(author.likes).toBe(0 || undefined)
})

test('missing title and url respons with status code 400 bad request', async () => {
    const blogObj = {
        author: 'bad request test',
    }

    await api.post('/api/blogs').send(blogObj).expect(400)
    const data = await helper.blogsInDB()
    console.log('>>>', data)
    expect(data).toHaveLength(helper.initBlogs.length)
})

test('deleting blog returns original length - 1', async ()=>{
    const initialBlogState = await helper.blogsInDB()
    const targetBlog = initialBlogState[0]
    await api.delete(`/api/blogs/${targetBlog.id}`).expect(200)
    const afterDelete = await helper.blogsInDB()
    expect(afterDelete).toHaveLength(initialBlogState.length-1)
    
})

test('update likes of blog', async()=>{
    const initialBlogState = await helper.blogsInDB()
    const targetBlog = initialBlogState[0]
    await api.put(`/api/blogs/${targetBlog.id}`).send({likes: targetBlog.likes +1}).expect(200)
    const afterUpdate = await api.get(`/api/blogs/${targetBlog.id}`)
    expect(afterUpdate.body.likes).toBe(targetBlog.likes +1)
})



afterAll(() => {
    mongoose.connection.close()
})
