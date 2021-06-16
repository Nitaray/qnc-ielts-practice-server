const USER_PERM_LVL = process.env.USER_PERM_LVL || 1

const MOD_PERM_LVL = process.env.MOD_PERM_LVL || 2

const ADMIN_PERM_LVL = process.env.ADMIN_PERM_LVL || 3

const TEST_TIME_LIMIT = process.env.TEST_TIME_LIMIT || 60

const TEST_TIME_LIMIT_LAX = process.env.TIME_LIMIT_LAX || 0.5

module.exports = {
	USER_PERM_LVL,
	MOD_PERM_LVL,
	ADMIN_PERM_LVL,
	TEST_TIME_LIMIT,
	TEST_TIME_LIMIT_LAX
}