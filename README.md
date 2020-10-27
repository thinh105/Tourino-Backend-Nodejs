![](Tourino-banner-back-end.png)

![node version](https://img.shields.io/badge/node->=12.0.0-brightgreen.svg)

# About this project

> <br />
> A REST API Backend using `Node` - `Express` - `Mongoose` for the Tourino Project contains practical examples (CRUD, Authentication & Authorization, Error Handling, Security).

> <br />

<br />

# API Spec

## Live Demo : https://tourino.herokuapp.com/api/v1/

<br/>

## **Tours**

| URL                        | HTTP Verb | POST Body   | Authentication | Authorization    | Result                             |
| -------------------------- | --------- | ----------- | -------------- | ---------------- | ---------------------------------- |
| /api/v1/tours              | GET       |             |                |                  | Return all tours                   |
| /api/v1/tours/:id          | GET       |             |                |                  | Return single tour (based on id)   |
| /api/v1/tours/slug/:slug   | GET       |             |                |                  | Return single tour (based on slug) |
| /api/v1/tours              | POST      | JSON String | Yes            | moderator, admin | Create new tour                    |
| /api/v1/tours/:id          | PATCH     | JSON String | Yes            | moderator, admin | Updates an existing tour           |
| /api/v1/tours/:id          | DELETE    |             | Yes            | moderator, admin | Deletes an existing tour           |
| -                          |
| /api/v1/tours/destinations | GET       |             |                |                  | Return all destinations and count  |
| /api/v1/tours/travelStyle  | GET       |             |                |                  | Return all travel style and count  |

<br />

## **Users**

| URL                               | HTTP Verb | POST Body   | Authentication | Authorization | Result                              |
| --------------------------------- | --------- | ----------- | -------------- | ------------- | ----------------------------------- |
| /api/v1/users/signup              | POST      | JSON String |                |               | Create a new user                   |
| /api/v1/users/login               | POST      | JSON String |                |               | Create a new user                   |
| /api/v1/users/forgotPassword      | POST      | JSON String |                |               | Create a new user                   |
| /api/v1/users/resetPassword:token | POST      | JSON String |                |               | Create a new user                   |
| -                                 |
| /api/v1/users/me                  | GET       |             | Yes            |               | Return a current user               |
| /api/v1/users/updateMyPassword    | PATCH     | JSON String | Yes            |               | Updates password for a current user |
| /api/v1/users/updateMe            | PATCH     | JSON String | Yes            |               | Updates a current user              |
| /api/v1/users/deleteMe            | DELETE    |             | Yes            |               | Deletes a current user              |
| -                                 |
| /api/v1/users                     | GET       |             | Yes            | admin         | Return all users                    |
| /api/v1/users/role                | GET       |             | Yes            | admin         | Return all Role's types and count   |
| /api/v1/users/:id                 | GET       |             | Yes            | admin         | Return a specific user              |
| /api/v1/users/:id                 | PATCH     | JSON String | Yes            | admin         | Update a specific user              |
| /api/v1/users/:id                 | DELETE    |             | Yes            | admin         | Delete a specific user              |

<br />

## **Reviews**

| URL                           | HTTP Verb | POST Body   | Authentication | Authorization                | Result                                  |
| ----------------------------- | --------- | ----------- | -------------- | ---------------------------- | --------------------------------------- |
| /api/v1/tours/:tourId/reviews | GET       |             |                |                              | Return all reviews from a specific tour |
| /api/v1/reviews               | GET       |             |                |                              | Return all reviews                      |
| /api/v1/reviews/:id           | GET       |             |                |                              | Return a specific review                |
| /api/v1/reviews               | POST      | JSON String | Yes            | user                         | Create new review                       |
| /api/v1/reviews/:id           | PATCH     | JSON String | Yes            | user(owner of review), admin | Updates a specific review               |
| /api/v1/reviews/:id           | DELETE    |             | Yes            | user(owner of review), admin | Deletes a specific review               |

<br />

# 📚 Tech Stacks

- NodeJS
- Express
- MongoDB
- Mongoose

<br />

# 📦 Packages used

## **🔨 Utility Package**

- [x] dotenv
  - Loads environment variables from .env file
- [x] mongoose-id-validator
  - validate that ObjectID references refer to objects that actually exist in the referenced collection
- [x] mongoose-unique-validator
  - adds pre-save validation for unique fields within a Mongoose schema.
- [x] morgan
  - HTTP request logger middleware for node.js
- [x] nodemailer
  - Easy as cake e-mail sending from your Node.js applications
- [x] qs
  - A querystring parser that supports nesting and arrays, with a depth limit
- [x] slugify
  - Slugifies a String
- [x] validator
  - String validation and sanitization

<br />

## **🚫 Security Package**

- [x] BcryptJS
  - Optimized bcrypt in plain JavaScript for NodeJS.
- [x] jsonwebtoken
  - JSON Web Token for node.js
- [x] cors
  - Node.js CORS middleware
- [x] express-rate-limit
  - Basic IP rate-limiting middleware for Express.
  - Use to limit repeated requests to public APIs and/or endpoints such as password reset.
- [x] express-mongo-sanitize
  - Sanitize your express payload to prevent MongoDB operator injection.
- [x] helmet
  - secure the Express apps
- [x] xss-clean
  - sanitize user input coming from POST body, GET queries, and url params
- [x] hpp
  - protect against HTTP Parameter Pollution attacks

<!-- # ⛔ Error Handling

<br />

# 🚻 Authentication
-->

<br />

# 🔧 Editor setup

To keep the style of resources consistent, I decided to stick to some shared rules that have to be applied to every project using some editors plugins.

I have chosen to use

- [PRETTIER](https://prettier.io/)
- [ESLint](https://eslint.org/)

This works including specific `.eslintrc.json` and `.prettierrc` files in the root directory and making sure your editor has the necessary plugin.

<br />

# 🐛 Test API

I using REST client to test my API.

- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

File test can be found in [/dev-data/testApiRequest](./dev-data/testApiRequest) folder

<br />

# 🤝 Contributing

- Fork it!
- Create your feature branch: `git checkout -b my-new-feature`
- Commit your changes: `git commit -am 'Add some feature'`
- Push to the branch: `git push origin my-new-feature`
- Submit a pull request

<br />

# 💓 Show your support

This is just a personal project created for study/demonstration purpose, it may or may not be a good fit for your project(s).

Please ⭐ this repository if you like it or this project helped you!\

Feel free to open issues or submit pull-requests to help me improving my work.
