const { ApolloServer } = require('apollo-server-express')
const { PrismaClient } = require('@prisma/client')
const express = require('express')

const fs = require('fs')
const path = require('path')

const { getUserId, getUserRoleId } = require('./utils/jwt')

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const User = require('./resolvers/User')
const Role = require('./resolvers/Role')
const Comment = require('./resolvers/Comment')

const prisma = new PrismaClient()


const resolvers = {
	Query: {

	},
	Mutation: Mutation,
	User: User,
	Role: Role,
	Comment: Comment
}

const server = new ApolloServer({
	typeDefs: fs.readFileSync(
		path.join(__dirname, 'schema.graphql'),
		'utf-8'
	),
	resolvers,
	context: ({req, res}) => {
		return {
			...req,
			...res,
			prisma,
			userId:
				req && req.headers.authorization
					?	getUserId(req)
					:	null,
			roleId:
				req && req.headers.authorization
					?	getUserRoleId(req)
					:	null
		}
	}
})

const app = express();

const cookieParser = require('cookie-parser')
app.use(cookieParser())

// CORS configuration
const corsOptions = {
	origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
	credentials: true
}

const PORT = process.env.PORT || 4000;

server.applyMiddleware({ app, cors: corsOptions });

app.listen(PORT, () => {
	console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
})