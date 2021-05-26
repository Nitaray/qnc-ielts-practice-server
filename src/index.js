const { ApolloServer } = require('apollo-server')
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

const resolvers = {
	Query: {

	}
}

const server = new ApolloServer({
	typeDefs: fs.readFileSync(
		path.join(__dirname, 'schema.graphql'),
		'utf-8'
	),
	resolvers,
	context: {
		prisma,
	}
})

server
	.listen()
	.then(({ url }) =>
		console.log(`Server is running on ${url}`)
	);