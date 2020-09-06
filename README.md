# [Node/Express/Mongoose Example App]

![](tourino.png)

> ### A REST API Backend using `Node` - `Express` - `Mongoose` for the Tourino Project contains practical examples (CRUD, auth, error Handling, etc)

<br />

# Getting started

To get the Node server running locally:

- Clone this repo
- `npm install` to install all required dependencies
- Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials)) and run it by executing `mongod`
- `npm run dev` to start the local server

# Code Overview

## Dependencies

    "cors": "^2.8.5",
    "dotenv": "^8.2.0",
    "mongoose": "^5.9.20",
    "mongoose-id-validator": "^0.6.0",
    "morgan": "^1.10.0",
    "ndb": "^1.1.5",
    "nodemailer": "^6.4.10",
    "slugify": "^1.4.4",
    "validator": "^12.2.0"

- [expressjs](https://github.com/expressjs/express) - The server for handling and routing HTTP requests
- [express-jwt](https://github.com/auth0/express-jwt) - Middleware for validating JWTs for authentication
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - For generating JWTs used by authentication

- [mongoose](https://github.com/Automattic/mongoose) - For modeling and mapping MongoDB data to javascript

- [mongoose-id-validator](https://www.npmjs.com/package/mongoose-id-validator) - Provides a mongoose plugin that can be used to verify that a document which references other documents by their ID is referring to documents that actually exist.

- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Optimized bcrypt in JavaScript with zero dependencies. Compatible to the C++ bcrypt binding on node.js and also working in the browser.

- [slugify](https://www.npmjs.com/package/slugify) - For encoding titles into a URL-friendly format

## Application Structure

- `server.js` - The entry point to our application, contains server network declaration, connects app to MongoDB using mongoose.

- `app.js` - This file defines our express app, also set the API declaration. It also requires the middlwares and routes we'll be using in the application.

* `controller/` - This folder contains controllers files for our API.
* `routes/` - This folder contains the route definitions for our API.
* `models/` - This folder contains the schema definitions for our Mongoose models.

## Error Handling

In `routes/api/index.js`, we define a error-handling middleware for handling Mongoose's `ValidationError`. This middleware will respond with a 422 status code and format the response to have [error messages the clients can understand](https://github.com/gothinkster/realworld/blob/master/API.md#errors-and-status-codes)

## Authentication

Requests are authenticated using the `Authorization` header with a valid JWT. We define two express middlewares in `routes/auth.js` that can be used to authenticate requests. The `required` middleware configures the `express-jwt` middleware using our application's secret and will return a 401 status code if the request cannot be authenticated. The payload of the JWT can then be accessed from `req.payload` in the endpoint. The `optional` middleware configures the `express-jwt` in the same way as `required`, but will _not_ return a 401 status code if the request cannot be authenticated.

<br />
