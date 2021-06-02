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


module.exports = {
    id,
    username,
    fullname,
    role,
    rating
}
