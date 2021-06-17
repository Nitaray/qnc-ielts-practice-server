const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')

const { 
	verifyUser, 
	verifyRolePermission, 
	REFRESH_TOKEN_EXPIRY, 
	JWT_EXPIRY 
	} = require('../utils/auth')
const { APP_SECRET } = require('../utils/jwt')
const { ADMIN_PERM_LVL, TEST_TIME_LIMIT, TEST_TIME_LIMIT_LAX } = require('../utils/config')

async function signup(parent, args, context, info) {
	if (args.user.username === "")
		throw new Error('Username cannot be empty!')

	let user = await context.prisma.user.findUnique({
		where: {
			Username: args.user.username
		}
	})

	if (user)
		throw new Error('Username already exists!')

	const password = await bcrypt.hash(args.user.password, 10)

	user = await context.prisma.user.create({ 
		data: {
			Username: args.user.username,
			Fullname: args.user.name ? args.user.name : "",
			Password: password,
			Rating: process.env.DEFAULT_ELO | 1000,
			RoleId: 1,
		} 
	})

	const retUser = {
		id: user.UserId,
		username: user.Username,
		fullname: user.Fullname,
		rating: user.Rating
	}

	refrToken = uuid()

	await context.prisma.user.update({
		data: {
			RefreshToken: refrToken
		},
		where: {
			UserId: user.UserId
		}
	})
	context.res.cookie('refresh_token', refrToken, { 
		httpOnly: true, 
		maxAge: REFRESH_TOKEN_EXPIRY * 60 * 1000,
		secure: true,
		sameSite: 'None' 
	})
	
	const token = jwt.sign(
		{ 
			userId: user.UserId, 
			roleId: user.RoleId 
		}, APP_SECRET,
		{
			expiresIn: JWT_EXPIRY * 60 * 1000
		})

	return {
		token: token,
		user: retUser,
	}
}

async function login(parent, args, context, info) {
	const user = await context.prisma.user.findUnique({ where: { Username: args.username } })
	if (user === null) {
		throw new Error('No such user found')
	}

	const valid = await bcrypt.compare(args.password, user.Password)
	if (!valid) {
		throw new Error('Invalid password')
	}

	const retUser = {
		id: user.UserId,
		username: user.Username,
		fullname: user.Fullname,
		rating: user.Rating
	}

	refrToken = uuid()

	await context.prisma.user.update({
		data: {
			RefreshToken: refrToken
		},
		where: {
			UserId: user.UserId
		}
	})
	context.res.cookie('refresh_token', refrToken, { 
		httpOnly: true, 
		maxAge: REFRESH_TOKEN_EXPIRY * 60 * 1000,
		secure: true,
		sameSite: 'None'
	})
	
	const token = jwt.sign(
		{ 
			userId: user.UserId, 
			roleId: user.RoleId 
		}, APP_SECRET, 
		{
			expiresIn: JWT_EXPIRY * 60 * 1000
		})
	
	return {
		token: token,
		user: retUser
	}
}

async function refreshJWT(parent, args, context, info) {
	cookies = context.req.cookies
	if (!cookies)
		throw new Error('Cookies not found! Please login!')

	refrToken = context.req.cookies['refresh_token']
	if (!refrToken)
		throw new Error('No refresh token found! Please login!')
	
	const user = await context.prisma.user.findFirst({
		where: {
			RefreshToken: refrToken
		}
	})

	if (user === null)
		throw new Error('Refresh token expired or does not exists! Please login!')

	refrToken = uuid()

	await context.prisma.user.update({
		data: {
			RefreshToken: refrToken
		},
		where: {
			UserId: user.UserId
		}
	})
	context.res.cookie('refresh_token', refrToken, { 
		httpOnly: true, 
		maxAge: REFRESH_TOKEN_EXPIRY * 60 * 1000,
		secure: true,
		sameSite: 'None'
	})

	const jwtToken = jwt.sign(
		{
			userId: user.UserId,
			roleId: user.RoleId
		}, APP_SECRET, 
		{
			expiresIn: JWT_EXPIRY * 60 * 1000
		}
	)

	const retUser = {
		id: user.UserId,
		username: user.Username,
		fullname: user.Fullname,
		rating: user.Rating
	}

	return {
		token: jwtToken,
		user: retUser
	}
}

async function createComment(parent, args, context, info) {
	
	if (!verifyUser(context.userId, args.comment.userId))
		throw new Error("Access Denied! User does not have authorization for this action!")

	const comment = await context.prisma.comment.findFirst({
		where: {
			Content: args.comment.content,
			CommentedUserId: args.comment.userId,
			InTestId: args.comment.testId
		}
	})

	if (comment !== null)
		throw new Error("The exact comment has already exists! This fails to prevent spam!")

	const test = await context.prisma.test.findUnique({
		where: {
			TestId: args.comment.testId
		}
	})
	if (test === null)
		throw new Error("Test does not exist!")

	const user = await context.prisma.user.findUnique({
		where: {
			UserId: args.comment.userId
		}
	})
	if (user === null)
		throw new Error("User does not exists!")

	if (args.content === "")
		throw new Error("Comment's content is empty!")

	const createdComment =  await context.prisma.comment.create({
		data: {
			Content: args.comment.content,
			CommentedUserId: args.comment.userId,
			InTestId: args.comment.testId
		}
	})

	const retComment = {
		id: createdComment.CommentId,
		content: createdComment.Content,
		created: createdComment.DateCreated,
	}

	return retComment
}

async function deleteComment(parent, args, context, info) {

	const comment = await context.prisma.comment.findUnique({
		where: {
			CommentId: args.commentId
		}
	})

	if (comment === null)
		throw new Error("Comment does not exists!")

	if (!verifyUser(context.userId, comment.CommentedUserId) && !verifyRolePermission(context.roleId, comment.CommentedUserId))
		throw new Error("Access Denied! Unauthenticated user for this action!")

	await context.prisma.comment.delete({
		where: {
			CommentId: args.commentId
		}
	})

	const retComment = {
		id: comment.CommentId,
		content: comment.Content,
		created: comment.DateCreated,
	}
	return retComment
}

async function addTest(parent, args, context, info) {
	if (context.roleId < ADMIN_PERM_LVL)
		throw new Error(`Access Denied! Only user with permission level ${ADMIN_PERM_LVL} or higher can add a Test`)
	
	const test = await context.prisma.test.findUnique({
		where: {
			Title: args.test.title,
		}
	})

	if (test !== null)
		throw new Error('A test with the same title and type already exists!')

	const createdTest = await context.prisma.test.create({
		data: {
			TestType: args.test.type,
			Title: args.test.title
		}
	})

	return {
		id: createdTest.TestId,
		title: createdTest.Title,
		type: createdTest.TestType,
		sections: []
	}
}

async function addTestSection(parent, args, context, info) {
	const test = await context.prisma.test.findUnique({
		where: {
			TestId: args.section.testId
		},
		select: {
			TestSection: true
		}
	})

	if (test === null)
		throw new Error("Test does not exists!")

	console.log(test)

	const order = test.TestSection.length + 1

	const addedSection = await context.prisma.testSection.create({
		data: {
			TestSectionType: args.section.type,
			StatementText: args.section.text,
			StatementAudio: args.section.audio,
			TestId: args.section.testId
		}
	})

	const retSection = {
		id: addedSection.TestSectionId,
		order: order,
		type: addedSection.TestSectionType,
		statementText: addedSection.StatementText,
		statementAudio: addedSection.StatementAudio
	}

	return retSection
}

async function addQuestionGroup(parent, args, context, info) {
	const section = await context.prisma.testSection.findUnique({
		where: {
			TestSectionId: args.group.sectionId
		},
		select: {
			QuestionGroup: true
		}
	})

	if (section === null)
		throw new Error("Section does not exists!")

	const order = section.QuestionGroup.length + 1

	const addedGroup = await context.prisma.questionGroup.create({
		data: {
			IntroText: args.group.introText,
			TestSectionId: args.group.sectionId
		}
	})

	const retGroup = {
		id: addedGroup.QuestionGroupId,
		order: order,
		introText: addedGroup.IntroText
	}

	return retGroup
}

async function addQuestion(parent, args, context, info) {
	const group = await context.prisma.questionGroup.findUnique({
		where: {
			QuestionGroupId: args.question.questionGroupId
		},
		select: {
			QuestionInGroup: true
		}
	})

	if (group === null)
		throw new Error("Group does not exists!")

	const order = group.QuestionInGroup.length + 1

	const addedQuestion = await context.prisma.question.create({
		data: {
			QuestionType: args.question.type,
			Statement: args.question.statementText
		}
	})

	await context.prisma.questionInGroup.create({
		data: {
			QuestionGroupId: group.QuestionGroupId,
			QuestionId: addedQuestion.QuestionId,
			QuestionNumbering: order
		}
	})

	const retQuestion = {
		id: addedQuestion.QuestionId,
		order: order,
		type: addedQuestion.QuestionType,
		statementText: addedQuestion.Statement
	}

	return retQuestion
}

async function addAnswer(parent, args, context, info) {
	const question = await context.prisma.question.findUnique({
		where: {
			QuestionId: args.answer.questionId
		}
	})

	if (question === null)
		throw new Error("Question does not exists!")

	const similarAnswer = await context.prisma.answer.findFirst({
		where: {
			AnswerText: args.answer.text
		}
	})

	let answer = similarAnswer

	if (answer === null) {
		answer = await context.prisma.answer.create({
			data: {
				AnswerText: args.answer.text
			}
		})
	}

	let answerQuestionLink = await context.prisma.answerOfQuestion.findUnique({
		where: {
			AnswerId_QuestionId: {
				AnswerId: answer.AnswerId,
				QuestionId: args.answer.questionId
			}
		}
	})

	if (answerQuestionLink)
		throw new Error("This answer is already assigned to this question.")
	
	answerQuestionLink = await context.prisma.answerOfQuestion.create({
		data: {
			AnswerId: answer.AnswerId,
			QuestionId: args.answer.questionId,
			IsCorrect: args.answer.isCorrect
		}
	})

	const retAnswer = {
		id: answer.AnswerId,
		text: answer.AnswerText
	}

	return retAnswer
}

async function startTest(parent, args, context, info) {
	if (!verifyUser(context.userId, args.userId))
		throw new Error('User unauthenticated for this request!')

	const testHistory = await context.prisma.hasDone.findUnique({
		where: {
			UserId_TestId: {
				UserId: args.userId,
				TestId: args.testId
			}
		}
	})

	if (testHistory)
		throw new Error('User has already done this test!')

	const test = await context.prisma.test.findUnique({
		where: {
			TestId: args.testId
		}
	})

	if (test === null)
		throw new Error("Test does not exists!")

	await context.prisma.hasDone.create({
		data: {
			UserId: args.userId,
			TestId: args.TestId,
		}
	})

	const retTest = {
		id: test.TestId,
		title: test.Title,
		type: test.TestType
	}

	return retTest
}

async function submitTest(parent, args, context, info) {
	let submission = args.testSubmission

	if (!verifyUser(context.userId, submission.userId))
		throw new Error('User unauthenticated for this request!')

	const testHistory = await context.prisma.hasDone.findUnique({
		where: {
			UserId_TestId: {
				UserId: submission.userId,
				TestId: submission.testId
			}
		}
	})

	if (testHistory === null)
		throw new Error('User has not started this test yet!')

	if (new Date().getTime() - testHistory.StartTime > (TEST_TIME_LIMIT + TEST_TIME_LIMIT_LAX) * 60 * 1000)
		throw new Error('Test submission failed due to test time limit exceeded!')

	let answeredQuestions = submission.answers

	answeredQuestions.map(answeredQ => {
		
	})
}

async function changeName(parent, args, context, info) {
	if (!verifyUser(context.userId, args.userId))
		throw new Error("Not authenticated for this action!")
	
	const updatedUser = await context.prisma.user.update({
		where: {
			UserId: args.userId
		},
		data: {
			Fullname: args.newName
		}
	})

	if (updatedUser === null)
		throw new Error('User does not exist!')
	
	return {
		id: updatedUser.UserId,
		username: updatedUser.Username,
		fullname: updatedUser.Fullname,
		rating: updatedUser.Rating
	}
}

module.exports = {
	signup,
	login,
	refreshJWT,
	createComment,
	deleteComment,
	addTest,
	addTestSection,
	addQuestionGroup,
	addQuestion,
	addAnswer,
	startTest,
	submitTest,
	changeName
}