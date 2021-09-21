const jwt = require('jsonwebtoken')
const User = require('../model/user')

const errorHandler = (error, request, response, next)=>{
    if(error.name === 'CastError'){
        return response.status(400).send({error: 'malformed id'})
    }
    else if(error.name === 'ValidationError'){
        return response.status(400).json({error: error.message})
    }
    else if (error.name === 'JsonWebTokenError'){
        return response.status(401).json({
            error: 'invalid Token'
        })
    }
    else if(error.name === 'TokenExpiredError'){
        return response.status(401).json({
            error: 'token expired'
        })
    }

    next(error)
}

const tokenExtractor = (request, response, next)=>{
    const authorization = request.get('authorization')
    if(authorization && authorization.toLowerCase().startsWith('bearer')){
        request.token= authorization.substring(7)
    }
    next()
}

const userExtractor = async (request, response, next)=>{

    const token = request.token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if(!token || ! decodedToken.id){
        return response.status(401).json({error:'token missing or invalid'})
    }
    const user = await User.findById(decodedToken.id)
    request.user = user
    next()
}

module.exports = {errorHandler, tokenExtractor, userExtractor}