const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')

const { verifyUser, verifyRolePermission, refreshTokens } = require('../utils/auth')
const { APP_SECRET } = require('../utils/jwt')

const ADD_TEST_PERM = process.env.ADD_TEST_PERM || 3
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || 30 * 24 * 60
const JWT_EXPIRY = process.env.JWT_EXPIRY || 15

async function signup(parent, args, context, info) {
    if (args.user.username === "")
        throw new Error('Username cannot be empty!')

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

    refrToken = uuid()

    refreshTokens.set(refrToken, {
        uid: user.UserId,
        expiry: new Date().getTime() + REFRESH_TOKEN_EXPIRY * 60 * 1000
    })
    context.res.cookie('refresh_token', refrToken, { httpOnly: true, maxAge: REFRESH_TOKEN_EXPIRY * 60 * 1000 })
    
    const token = jwt.sign(
        { 
            userId: user.UserId, 
            roleId: user.RoleId 
        }, APP_SECRET,
        {
            expiresIn: JWT_EXPIRY * 60 * 1000
        })

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

    refrToken = uuid()

    refreshTokens.set(refrToken, {
        uid: user.UserId,
        expiry: new Date().getTime() + REFRESH_TOKEN_EXPIRY * 60 * 1000
    })
    context.res.cookie('refresh_token', refrToken, { httpOnly: true, maxAge: REFRESH_TOKEN_EXPIRY * 60 * 1000 })
    
    const token = jwt.sign(
        { 
            userId: user.UserId, 
            roleId: user.RoleId 
        }, APP_SECRET, 
        {
            expiresIn: JWT_EXPIRY * 60 * 1000
        })
    
    return {
        token: token,
        user: retUser
    }
}

async function refreshJWT(parent, args, context, info) {
    cookies = context.req.cookies
    if (!cookies)
        throw new Error('Cookies not found! Please login!')

    refrToken = context.req.cookies['refresh_token']
    if (!refrToken || !refreshTokens.has(refrToken))
        throw new Error('Refresh token does not exist or expired! Please login!')
    
    refrTokenData = refreshTokens.get(refrToken)
    
    expiresDate = refrTokenData.expiry
    if (new Date().getTime() > expiresDate) {
        refreshTokens.delete(refrToken)
        throw new Error('Refresh token does not exist of expired! Please login!')
    }
    
    userId = refrTokenData.uid
    const user = await context.prisma.user.findUnique({
        where: {
            UserId: userId
        }
    })

    if (user === null)
        throw new Error('User does not exist!')

    refreshTokens.delete(refrToken)

    refrToken = uuid()

    refreshTokens.set(refrToken, {
        uid: user.UserId,
        expiry: new Date().getTime() + REFRESH_TOKEN_EXPIRY * 60 * 1000
    })
    context.res.cookie('refresh_token', refrToken, { httpOnly: true, maxAge: REFRESH_TOKEN_EXPIRY * 60 * 1000 })

    const jwtToken = jwt.sign(
        {
            userId: user.UserId,
            roleId: user.RoleId
        }, APP_SECRET, 
        {
            expiresIn: JWT_EXPIRY * 60 * 1000
        }
    )

    const retUser = {
        id: user.UserId,
        username: user.Username,
        fullname: user.Fullname,
        rating: user.Rating
    }

    return {
        token: jwtToken,
        user: retUser
    }
}

async function createComment(parent, args, context, info) {
    
    if (!verifyUser(context.userId, args.comment.userId))
        throw new Error("Access Denied! User does not have authorization for this action!")

    const comment = await context.prisma.comment.findFirst({
        where: {
            Content: args.comment.content,
            CommentedUserId: args.comment.userId,
            InTestId: args.comment.testId
        }
    })

    if (comment !== null)
        throw new Error("The exact comment has already exists! This fails to prevent spam!")

    const test = await context.prisma.test.findUnique({
        where: {
            TestId: args.comment.testId
        }
    })
    if (test === null)
        throw new Error("Test does not exist!")

    const user = await context.prisma.user.findUnique({
        where: {
            UserId: args.comment.userId
        }
    })
    if (user === null)
        throw new Error("User does not exists!")

    if (args.content === "")
        throw new Error("Comment's content is empty!")

    const createdComment =  await context.prisma.comment.create({
        data: {
            Content: args.comment.content,
            CommentedUserId: args.comment.userId,
            InTestId: args.comment.testId
        }
    })

    const retComment = {
        id: createdComment.CommentId,
        content: createdComment.Content,
        created: createdComment.DateCreated,
        userId: createdComment.CommentedUserId,
        testId: createdComment.InTestId
    }

    return retComment
}

async function deleteComment(parent, args, context, info) {

    const comment = await context.prisma.comment.findUnique({
        where: {
            CommentId: args.commentId
        }
    })

    if (comment === null)
        throw new Error("Comment does not exists!")

    if (!verifyUser(context.userId, comment.CommentedUserId) && !verifyRolePermission(context.roleId, comment.CommentedUserId))
        throw new Error("Access Denied! Unauthenticated user for this action!")

    await context.prisma.comment.delete({
        where: {
            CommentId: args.commentId
        }
    })

    const retComment = {
        id: comment.CommentId,
        content: comment.Content,
        created: comment.DateCreated,
        userId: comment.CommentedUserId,
        testId: comment.InTestId
    }
    return retComment
}

async function addTest(parent, args, context, info) {
    if (context.roleId < ADD_TEST_PERM)
        throw new Error(`Access Denied! Only user with permission level ${ADD_TEST_PERM} or higher can add a Test`)
    
    const test = await context.prisma.test.findUnique({
        where: {
            Title: args.test.title,
        }
    })

    if (test !== null)
        throw new Error('A test with the same title and type already exists!')

    const createdTest = await context.prisma.test.create({
        data: {
            TestType: args.test.type,
            Title: args.test.title
        }
    })

    return {
        id: createdTest.TestId,
        title: createdTest.Title,
        type: createdTest.TestType,
        sections: []
    }
}

async function submitTest(parent, args, context, info) {

}

async function changeName(parent, args, context, info) {
    if (!verifyUser(context.userId, args.userId))
        throw new Error("Not authenticated for this action!")
    
    const updatedUser = await context.prisma.user.update({
        where: {
            UserId: args.userId
        },
        data: {
            Fullname: args.newName
        }
    })

    if (updatedUser === null)
        throw new Error('User does not exist!')
    
    return {
        id: updatedUser.UserId,
        username: updatedUser.Username,
        fullname: updatedUser.Fullname,
        rating: updatedUser.Rating
    }
}

module.exports = {
    signup,
    login,
    refreshJWT,
    createComment,
    deleteComment,
    addTest,
    submitTest,
    changeName
}