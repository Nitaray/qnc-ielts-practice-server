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

function statementAudio(parent, args, context, info) {
	return parent.statementAudio
}

async function questionGroups(parent, args, context, info) {
	const questionGroups = await context.prisma.testSection.findUnique({
		where: {
			TestSectionId: parent.id	
		},
		select: {
			QuestionGroup: {
				select: {
					QuestionGroupId: true,
					IntroText: true,
				}
			}
		}
	})


	const retQuestionGroups = questionGroups.QuestionGroup.map((group, index) => {
		return {
			id: group.QuestionGroupId,
			order: index,
			introText: group.IntroText
		}
	})

	return retQuestionGroups 
}

module.exports = {
	id,
	order,
	type,
	statementText,
	statementAudio,
	questionGroups
}