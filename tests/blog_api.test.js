const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../model/blog')

const initList =[
    {
      
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
        __v: 0
    },
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
    }
]

beforeEach(async()=>{
    await Blog.deleteMany({})
    let newBlogObj = new Blog(initList[0])
    await newBlogObj.save()
    newBlogObj = new Blog(initList[1])
    await newBlogObj.save()
})


test('blogs are returned as json', async ()=>{
    await api.get('/api/blogs').expect(200).expect('Content-Type',/application\/json/)
}, 100000)

test('there is one blog', async()=>{
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initList.length)
})

test('a specific blog title within returned title ', async()=>{
    const response = await api.get('/api/blogs')
    const title = response.body.map(r=>r.title)
    expect(title).toContain('React patterns')
})


afterAll(()=>{
    mongoose.connection.close()
})