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
const Test = require('./resolvers/Test')
const TestSection = require('./resolvers/TestSection')
const QuestionGroup = require('./resolvers/QuestionGroup')
const Question = require('./resolvers/Question')

process.env.DATASOURCE_URL = `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_URL}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`

const prisma = new PrismaClient()

console.log(process.env.DATASOURCE_URL)


const resolvers = {
	Query: Query,
	Mutation: Mutation,
	User: User,
	Role: Role,
	Comment: Comment,
	Test: Test,
	TestSection: TestSection,
	QuestionGroup: QuestionGroup,
	Question: Question
}

const server = new ApolloServer({
	typeDefs: fs.readFileSync(
		path.join(__dirname, 'schema.graphql'),
		'utf-8'
	),
	resolvers,
	context: ({ req, res }) => {
		return {
			...req,
			...res,
			prisma,
			userId:
				req && req.headers.authorization
					? getUserId(req)
					: null,
			roleId:
				req && req.headers.authorization
					? getUserRoleId(req)
					: null
		}
	}
})

const app = express();
app.disable('x-powered-by')

const cookieParser = require('cookie-parser')
app.use(cookieParser())

// CORS configuration
const corsOptions = {
	origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
	credentials: true,
	allowedHeaders: ['Content-Type', 'Authorization']
}

const PORT = process.env.PORT || 4000;

server.applyMiddleware({ app, cors: corsOptions });

app.listen(PORT, () => {
	console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
})