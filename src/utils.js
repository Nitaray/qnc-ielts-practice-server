const jwt = require('jsonwebtoken');
const APP_SECRET = process.env.JWT_SECRET ? process.env.JWT_SECRET : "SMOOTH CRIMINAL H3H3";

function getTokenPayload(token) {
    return jwt.verify(token, APP_SECRET);
}

function getUserId(req, authToken) {
    if (req) {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            if (!token) {
                throw new Error('No token found');
            }
            const { userId } = getTokenPayload(token);
            return userId;
        }
    } else if (authToken) {
        const { userId } = getTokenPayload(authToken);
        return userId;
    }

    throw new Error('Not authenticated');
}

function getUserRoleId(req, authToken) {
    if (req) {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            if (!token) {
                throw new Error('No token found');
            }
            const { roleId } = getTokenPayload(token);
            return roleId;
        }
    } else if (authToken) {
        const { roleId } = getTokenPayload(authToken);
        return roleId;
    }

    throw new Error('Not authenticated');
}

function verifyUser(currentID, claimedID) {
    return currentID === claimedID || process.env.NODE_ENV === 'development'
}

function verifyRolePermission(reqRoleId, tarRoleId) {
    return reqRoleId > tarRoleId;
}

module.exports = {
    APP_SECRET,
    getUserId,
    getUserRoleId,
    verifyUser,
    verifyRolePermission
};