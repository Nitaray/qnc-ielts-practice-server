const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function signup(parent, args, context, info) {
    const password = await bcrypt.hash(args.password, 10)

    const user = await context.prisma.User.create({ data: { ...args, password } })

    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }
}

async function login(parent, args, context, info) {
    const user = await context.prisma.User.findUnique({ where: { Username: args.username } })
    if (!user) {
        throw new Error('No such user found')
    }

    const valid = await bcrypt.compare(args.password, user.password)
    if (!valid) {
        throw new Error('Invalid password')
    }

    const token = jwt.sign({ userId: user.id }, APP_SECRET)
    
    return {
        token,
        user,
    }
}

async function createComment(parent, args, context, info) {
    const test = await context.prisma.test.findUnique({
        where: {
            TestId: args.testId
        }
    })

    const user = await context.prisma.User.findUnique({
        where: {
            UserId: args.userId
        }
    })

    if (test === null || user === null || args.content === "") 
        return {
            success: false,
            message: "Either testId doesn't exist, userId doesn't exist, or comment is empty!"
        }

    let comment = await context.prisma.comment.create({
        data: {
            Content: args.content,
            CommenteduserId: args.userId,
        }
    })

    if (comment !== null) 
        return {
            success: true,
            message: "Successfully added comment to database!"
        }

    return {
        success: false,
        message: "Failed to add comment to database! Please contact administrator for further information"
    }
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