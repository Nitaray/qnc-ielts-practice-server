const { MOD_PERM_LVL } = require('../utils/permission')

async function allUsers(parent, args, context, info) {
	const users = await context.prisma.user.findMany({
		orderBy: {
			Username: 'asc'
		}
	})

	if (users === null)
		return []

	const retUsers = users.map(user => {
		return {
			id: user.UserId,
			username: user.Username,
			fullname: user.Fullname,
			rating: user.Rating
		}
	})

	return retUsers
}

async function getUserById(parent, args, context, info) {
	const user = await context.prisma.user.findUnique({
		where: {
			UserId: args.id
		}
	})

	if (user === null)
		throw new Error('User does not exists!')

	const retUser  = {
		id: user.UserId,
		username: user.Username,
		fullname: user.Fullname,
		rating: user.Rating
	}
	
	return retUser
}

async function allTests(parent, args, context, info) {
	const tests = await context.prisma.test.findMany({
		orderBy: {
			Title: 'desc'
		}
	})

	if (tests === null)
		return []

	const retTests = tests.map(test => {
		return {
			id: test.TestId,
			title: test.Title,
			type: test.TestType
		}
	})

	return retTests
}

async function getTestById(parent, args, context, info) {
	const test = await context.prisma.test.findUnique({
		where: {
			TestId: args.id
		}
	})

	if (test === null)
		throw new Error("Test does not exist")

	const retTest = {
		id: test.TestId,
		title: test.Title,
		type: test.TestType
	}

	return retTest
}

async function getTestResult(parent, args, context, info) {
	if (!verifyUser(context.userId, args.userId) && !verifyRolePermission(context.roleId, MOD_PERM_LVL))
		throw new Error("User does not have permission to request this information.")

	const doneTest = await context.prisma.hasDone.findUnique({
		where: {
			UserId_TestId: {
				UserId: args.userId,
				TestId: args.testId
			}
		},
		select: {
			Test: {
				select: {
					TestSection: {
						select: {
							QuestionGroup: {
								select: {
									QuestionInGroup: {
										select: {
											Question: true
										}
									}
								}
							}
						}
					}
				}
			}
		}
	})

	if (doneTest === null)
		throw new Error('User has not done this test!')

	const questions = []

	doneTest.Test.TestSection.map(section => {
		section.QuestionGroup.map(group => {
			group.QuestionInGroup.map(QiG => {
				questions.push(QiG.Question)
			})
		})
	})

	const answeredQuestionHistory = []
	let correctAnswers = 0

	// TODO Optimize code
	// It might be possible to query the answerHistory from the question query above.
	questions.map(async (question, index) => {
		const userQuestionHistory = await context.prisma.answerHistory.findUnique({
			where: {
				UserId_QuestionId: {
					UserId: args.userId,
					QuestionId: question.QuestionId
				}
			},
			select: {
				Answer: true
			}
		})

		answeredQuestionHistory.push({
			question: {
				id: question.QuestionId,
				order: index + 1,
				type: question.QuestionType,
				statementText: question.Statement
			},
			answer: userQuestionHistory ? {
				id: userQuestionHistory.Answer.AnswerId,
				text: userQuestionHistory.Answer.AnswerText
			} : null
		})

		const answerOfQuestion = await context.prisma.answerOfQuestion.findUnique({
			where: {
				AnswerId_QuestionId: {
					AnswerId: userQuestionHistory.Answer.AnswerId,
					QuestionId: question.QuestionId
				},
				select: {
					IsCorrect: true
				}
			}
		})

		correctAnswers += answerOfQuestion.IsCorrect ? 1 : 0
	})

	return {
		test: {
			id: doneTest.Test.TestId,
			title: doneTest.Test.Title,
			type: doneTest.Test.TestType
		},
		score: correctAnswers / questions.length,
		answerHistory: answeredQuestionHistory
	}
}

module.exports = {
	allUsers,
	getUserById,
	allTests,
	getTestById,
	getTestResult
}