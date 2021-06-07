const refreshTokens = new Map()

function verifyUser(currentID, claimedID) {
    return currentID === claimedID || process.env.NODE_ENV === 'development'
}

function verifyRolePermission(reqRoleId, tarRoleId) {
    return reqRoleId > tarRoleId;
}

module.exports = {
    refreshTokens,
    verifyUser,
    verifyRolePermission
};