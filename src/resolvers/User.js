const { verifyUser, verifyRolePermission } = require("../utils/auth");
const { MOD_PERM_LVL } = require("../utils/config")

function id(parent, args, context, info) {
    return parent.id;
}

function username(parent, args, context, info) {
    return parent.username;
}

function fullname(parent, args, context, info) {
    return parent.fullname;
}

async function role(parent, args, context, info) {
    const userRoleId = await context.prisma.user.findUnique({
        where: {
            UserId: parent.id
        },
        select: {
            RoleId: true
        }
    })

    if (userRoleId === null)
        throw new Error('User does not exists!')

    return {
        id: userRoleId.RoleId
    }
}

function rating(parent, args, context, info) {
    return parent.rating;
}

async function comments(parent, args, context, info) {
    if (!verifyUser(context.userId, parent.id) && !verifyRolePermission(context.roleId, MOD_PERM_LVL))
        return []
    
    const userComments = await context.prisma.user.findUnique({
        where: {
            UserId: parent.id
        },
        select: {
            Comment: {
                select: {
                    CommentId: true,
                    Content: true,
                    DateCreated: true
                }
            }
        }
    })


    const retComments = userComments.Comment.map(comment => {
        return {
            id: comment.CommentId,
            user: parent,
            content: comment.Content,
            created: comment.DateCreated,
            userId: parent.id
        }
    })

    return retComments
}

async function doneTests(parent, args, context, info) {
    if (!verifyUser(context.userId, parent.id) && !verifyRolePermission(context.roleId, MOD_PERM_LVL))
        return []

    const doneTests = await context.prisma.user.findUnique({
        where: {
            UserId: parent.id
        },
        select: {
            HasDone: {
                select: {
                    Test: {
                        select: {
                            TestId: true,
                            TestType: true,
                            Title: true,
                        }
                    },
                }
            }
        }
    })

    let retTest = doneTests.HasDone.map(testRecord => {
        return {
            id: testRecord.Test.TestId,
            title: testRecord.Test.Title,
            type: testRecord.Test.TestType
        }
    }) 

    if (retTest === null)
        retTest = []

    return retTest
}


module.exports = {
    id,
    username,
    fullname,
    role,
    rating,
    comments,
    doneTests
}
