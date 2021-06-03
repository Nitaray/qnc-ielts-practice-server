const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, verifyUser, verifyRolePermission} = require('../utils')

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

    const token = jwt.sign({ userId: user.UserId, roleId: user.RoleId }, APP_SECRET)

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

    const token = jwt.sign({ userId: user.UserId, roleId: user.RoleId }, APP_SECRET)
    
    return {
        token: token,
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