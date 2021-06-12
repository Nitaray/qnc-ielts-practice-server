function id(parent, args, context, info) {
	return parent.id
}

function order(parent, args, context, info) {
	return parent.order
}

function introText(parent, args, context, info) {
	return parent.introText
}

async function questions(parent, args, context, info) {
	const questions = await context.prisma.questionGroup.findUnique({
		where: {
			QuestionGroupId: parent.id
		},
		select: {
			QuestionInGroup: {
				select: {
					Question: {
						select: {
							QuestionId: true,
							QuestionType: true,
							Statement: true
						}
					}
				}
			}
		}
	})


	const retQuestion = questions.QuestionInGroup.map((question, index) => {
		return {
			id: question.Question.QuestionId,
			order: index + 1,
			type: question.Question.QuestionType,
			statementText: question.Question.Statement
		}
	})

	return retQuestion
}

module.exports = {
	id,
	order,
	introText,
	questions
}