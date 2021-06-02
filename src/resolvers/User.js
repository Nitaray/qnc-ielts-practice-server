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
    const userComments = await context.prisma.user.findUnique({
        where: {
            UserId: parent.id
        },
        select: {
            comment: {
                select: {
                    CommentId: true,
                    Content: true,
                    DateCreated: true
                }
            }
        }
    })


    const retComments = userComments.comment.map(comment => {
        return {
            id: comment.CommentId,
            user: parent,
            content: comment.Content,
            created: comment.DateCreated
        }
    })

    return retComments
}

async function doneTests(parent, args, context, info) {
    const doneTests = await context.prisma.user.findUnique({
        where: {
            UserId: parent.id
        },
        select: {
            hasdone: {
                select: {
                    test: {
                        select: {
                            TestId: true,
                            TestType: true,
                            Title: true,
                            ListOfSectionIds: true
                        }
                    },
                    TestHistory: true
                }
            }
        }
    })

    console.log(doneTests)
    
    const retTest = []
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
