function id(parent, args, context, info) {
    return parent.id
}

function content(parent, args, context, info) {
    return parent.content
}

function created(parent, args, context, info) {
    return parent.created
}

async function user(parent, args, context, info) {
    const commentUser = await context.prisma.comment.findUnique({
        where: {
            CommentId: parent.id
        },
        select: {
            User: {
                select: {
                    UserId: true,
                    Username: true,
                    Fullname: true,
                    Rating: true,
                }
            }
        }
    })

    if (commentUser === null)
        throw new Error('User does not exists!')
    
    return {
        id: commentUser.User.UserId,
        username: commentUser.User.Username,
        fullname: commentUser.User.Fullname,
        rating: commentUser.User.Rating
    }
}

async function test(parent, args, context, info) {
    const commentTest = await context.prisma.comment.findUnique({
        where: {
            CommentId: parent.id
        },
        select: {
            Test: {
                select: {
                    TestId: true,
                    TestType: true,
                    Title: true
                }
            }
        }
    })

    if (commentTest === null)
        throw new Error('Test does not exists!')

    return {
        id: commentTest.Test.TestId,
        title: commentTest.Test.Title,
        type: commentTest.Test.TestType
    }
}

module.exports = {
    id,
    user,
    test,
    content,
    created
}