const { ApolloServer } = require('apollo-server-express')
const { PrismaClient } = require('@prisma/client')
const express = require('express')

const fs = require('fs')
const path = require('path')

const { getUserId } = require('./utils')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const User = require('./resolvers/User')
const Role = require('./resolvers/Role')

const prisma = new PrismaClient()


const resolvers = {
	Query: {

	},
	Mutation: Mutation,
	User: User,
	Role: Role
}

const server = new ApolloServer({
	typeDefs: fs.readFileSync(
		path.join(__dirname, 'schema.graphql'),
		'utf-8'
	),
	resolvers,
	context: ({req}) => {
		return {
			...req,
			prisma,
			userID:
				req && req.headers.authorization
					?	getUserId(req)
					:	null
		}
	}
})

// server
// 	.listen()
// 	.then(({ url }) =>
// 		console.log(`Server is running on ${url}`)
// 	);

const app = express();

// CORS configuration
const corsOptions = {
	origin: 'http://localhost:3000',
	credentials: true
}

const PORT = process.env.PORT || 4000;

server.applyMiddleware({ app, cors: corsOptions });

app.listen(PORT, () => {
	console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
})