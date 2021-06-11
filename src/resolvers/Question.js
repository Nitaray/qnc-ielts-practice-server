function id(parent, args, context, info) {
	return parent.id
}

function order(parent, args, context, info) {
	return parent.order
}

function type(parent, args, context, info) {
	return parent.type
}

function statementText(parent, args, context, info) {
	return parent.statementText
}

async function answers(parent, args, context, info) {
	const answer = context.prisma.question.findUnique({
		where: {
			QuestionId: parent.id
		},
		select: {
			AnswerOfQuestion: {
				select: {
					AnswerId: true,
					AnswerText: true,
				}
			}
		}
	})

	const retAnswer = answer.AnswerOfQuestion.map(answer => {
		return {
			id: answer.AnswerId,
			text: answer.AnswerText
		}
	})

	return retAnswer
}

module.exports = {
	id, 
	order,
	type,
	statementText,
	answers
}