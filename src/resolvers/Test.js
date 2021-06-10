function id(parent, args, context, info) {
	return parent.id
}

function title(parent, args, context, info) {
	return parent.title
}

function type(parent, args, context, info) {
	return parent.type
}

async function sections(parent, args, context, info) {
	const testSections = await context.prisma.test.findUnique({
		where: {
			TestId: parent.id
		},
		select: {
			TestSection: {
				select: {
					TestSectionId: true,
					TestSectionType: true,
					StatementText: true,
					StatementAudio: true,
				}
			}
		}
	})


	const retSections = testSections.TestSection.map((section, index) => {
		return {
			id: section.TestSectionId,
			order: index + 1,
			type: section.TestSectionType,
			statementText: section.StatementText,
			statementAudio: section.StatementAudio
		}
	})

	return retSections
}

async function comments(parent, args, context, info) {
	const testComments = await context.prisma.test.findUnique({
		where: {
			TestId: parent.id
		},
		select: {
			Comment: {
				select: {
					CommentId: true,
					Content: true,
					DateCreated: true
				}
			}
		}
	})


	const retComments = testComments.Comment.map(comment => {
		return {
			id: comment.CommentId,
			content: comment.Content,
			created: comment.DateCreated,
		}
	})

	return retComments
}

module.exports = {
	id,
	title,
	type,
	sections,
	comments
}