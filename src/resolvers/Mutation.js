const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function signup(parent, args, context, info) {
    let user = await context.prisma.user.findUnique({
        where: {
            Username: args.user.username
        }
    })

    if (user)
        throw new Error('Username already exists!')

    const password = await bcrypt.hash(args.user.password, 10)

    user = await context.prisma.user.create({ 
        data: {
            Username: args.user.username,
            Fullname: args.user.name ? args.user.name : "",
            Password: password,
            Rating: process.env.DEFAULT_ELO | 1000,
            RoleId: 1,
        } 
    })

    const retUser = {
        id: user.UserId,
        username: user.Username,
        fullname: user.Fullname,
        rating: user.Rating
    }

    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
        token: token,
        user: retUser,
    }
}

async function login(parent, args, context, info) {
    const user = await context.prisma.user.findUnique({ where: { Username: args.username } })
    if (user === null) {
        throw new Error('No such user found')
    }

    const valid = await bcrypt.compare(args.password, user.Password)
    if (!valid) {
        throw new Error('Invalid password')
    }

    const retUser = {
        id: user.UserId,
        username: user.Username,
        fullname: user.Fullname,
        rating: user.Rating
    }

    const token = jwt.sign({ userId: user.id }, APP_SECRET)
    
    return {
        token: token,
        user: retUser
    }
}

async function createComment(parent, args, context, info) {
    const test = await context.prisma.test.findUnique({
        where: {
            TestId: args.testId
        }
    })
    if (test === null)
        throw new Error("Test does not exist!")

    const user = await context.prisma.User.findUnique({
        where: {
            UserId: args.userId
        }
    })
    if (user === null)
        throw new Error("User does not exists!")

    if (args.content === "")
        throw new Error("Comment's content is empty!")

    return await context.prisma.comment.create({
        data: {
            Content: args.content,
            CommenteduserId: args.userId,
        }
    })
}

async function deleteComment(parent, args, context, info) {

}

async function addTest(parent, args, context, info) {
    
}

async function changeName(parent, args, context, info) {
    
}

module.exports = {
    signup,
    login,
    createComment,
    deleteComment,
    addTest,
    changeName
}