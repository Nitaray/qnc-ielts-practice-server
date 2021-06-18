<!-- PROJECT INFO -->
<p align="center">
  <h3 align="center">QNC IELTS PRACTICE SERVER</h3>

  <p align="center">
    A GraphQL backend server implementation using ApolloServerExpress for handling GraphQL queries <br/> and Prisma for database connection.
    <br />
    <a href="https://github.com/Nitaray/qnc-ielts-practice-server"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://nitaray.github.io/qnc-ielts-practice/">View Demo</a>
    ·
    <a href="https://github.com/Nitaray/qnc-ielts-practice-server/issues">Report Bug</a>
    ·
    <a href="https://github.com/Nitaray/qnc-ielts-practice-server/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

This project is designed and implemented by HCMIU students as a course project for the course Web Application Development. It serves as a backend server for the [QNC-IELTS-PRACTICE](https://nitaray.github.io/qnc-ielts-practice) web application. 

Team member:
* Nguyễn Lê Nguyễn - Backend Developer
* Cáp Kim Quang - Frontend Developer
* Nguyễn Tiến Cường - Database Developer

Of course, this project was designed and completed within one semester, so there are inevitably errors in design and implementation. Even so, there is a number of features that are supported by the project. These include user authentication, test moderation and test submission, user discussion via comment, and more.

### Built With

* [ApolloGraphQL](https://apollographql.com/)
* [ExpressJS](https://expressjs.com/)
* [Prisma](https://prisma.io/)



<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

Install the latest version of NodeJS and Node Package Manager.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/nitaray/qnc-ielts-practice-server.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Setup environment variables in a .env file
   ```js
	####### AUTHENTICATION #######

	DATABASE_URL="YOUR_DATABASE_URL_FOR_DATABASE_CONNECTION"

	JWT_SECRET="A_SERVERSIDE_JWT_SECRET_TO_VALIDATE_JSON_WEB_TOKENS"

	CLIENT_ORIGIN="CLIENT_HOST_ADDRESS_FOR_CROSS_ORIGIN_REQUESTS"

	####### APP SETTINGS #######

	DEFAULT_ELO=1000 // THE DEFAULT ELO FOR THE USER RANKING SYSTEM

	USER_PERM_LVL=1  // THE DEFAULT PERMISSION LEVEL OF A USER
	MOD_PERM_LVL=2   // THE DEFAULT PERMISSION LEVEL OF A MODERATOR
	ADMIN_PERM_LVL=3 // THE DEFAULT PERMISSION LEVEL OF AN ADMIN


	####### NODE #######

	NODE_ENV='development' // FOR DEVELOPMENT, REMOVE IF IN PRODUCTION
   ```


<!-- USAGE EXAMPLES -->
## Usage
To start the server and begin processing API requests, just use
	```
	node src/index.js
	```




<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/Nitaray/qnc-ielts-practice-server/issues) for a list of proposed features (and known issues).

Future features to be implemented, if resources are provided:

* Actual ELO calculation for users.
* More user-related information management.
* More moderator and admin tools.
* Listening test support.
