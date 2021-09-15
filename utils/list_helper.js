/* eslint-disable no-unused-vars */

const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favouriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    return blogs.reduce((count, curr) =>
        count.likes > curr.likes ? count : curr
    )
}

const mostBlogs = (blogs) => {
    const author_blognumber = _.countBy(blogs, 'author')
    const maxValue = Math.max(...Object.values(author_blognumber))
    const maxIndex = Object.keys(author_blognumber).find(
        (key) => author_blognumber[key] === maxValue
    )

    return {
        author: maxIndex,
        blogs: maxValue,
    }
}

const mostLikes = (blogs) => {
    const authors = _.groupBy(blogs, 'author')
    const like = _.map(authors,(a,b)=>{
        return{
            author: b, likes:_.reduce(a,(totalLikes, items)=> totalLikes + items.likes,0)
        }
    })

    const maxLikes = _.maxBy(like, 'likes')
    return maxLikes
}
module.exports = { dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes }
