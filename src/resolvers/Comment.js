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
    const commentUser = await context.prisma.user.findUnique({
        where: {
            UserId: parent.userId
        },
        select: {
            UserId: true,
            Username: true,
            Fullname: true,
            Rating: true,
        }
    })

    if (commentUser === null)
        throw new Error('User does not exists!')
    
    return {
        id: commentUser.UserId,
        username: commentUser.Username,
        fullname: commentUser.Fullname,
        rating: commentUser.Rating
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