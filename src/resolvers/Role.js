function id(parent, args, context, info) {
    return parent.id
}

async function name(parent, args, context, info) {
    const roleName = await context.prisma.role.findUnique({
        where: {
            RoleId: parent.id
        },
        select: {
            RoleName: true
        }
    })

    if (roleName === null) 
        throw new Error('Role does not exists!')

    return roleName.RoleName
}

module.exports = {
    id,
    name
}