const USER_PERM_LVL = process.env.USER_PERM_LVL || 1

const MOD_PERM_LVL = process.env.MOD_PERM_LVL || 2

const ADMIN_PERM_LVL = process.env.ADMIN_PERM_LVL || 3

module.exports = {
	USER_PERM_LVL,
	MOD_PERM_LVL,
	ADMIN_PERM_LVL
}