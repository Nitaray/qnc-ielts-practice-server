const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || 30 * 24 * 60

const JWT_EXPIRY = process.env.JWT_EXPIRY || 15


function verifyUser(currentID, claimedID) {
    return currentID === claimedID || process.env.NODE_ENV === 'development'
}

function verifyRolePermission(reqRoleId, tarRoleId) {
    return reqRoleId > tarRoleId;
}

module.exports = {
    verifyUser,
    verifyRolePermission,
    REFRESH_TOKEN_EXPIRY,
    JWT_EXPIRY
};