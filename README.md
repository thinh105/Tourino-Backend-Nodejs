![](Tourino-banner-back-end.png)

# Live Demo

https://tourino.herokuapp.com/api/v1/tours

# About this project

> ### A REST API Backend using `Node` - `Express` - `Mongoose` for the Tourino Project contains practical examples (CRUD, auth, error Handling, etc)
>
> <br />

# Tech Stacks

- Nodejs
- Express
- Mongoose

# Code Overview

-

## Error Handling

In `routes/api/index.js`, we define a error-handling middleware for handling Mongoose's `ValidationError`. This middleware will respond with a 422 status code and format the response to have [error messages the clients can understand](https://github.com/gothinkster/realworld/blob/master/API.md#errors-and-status-codes)

## Authentication

Requests are authenticated using the `Authorization` header with a valid JWT. We define two express middlewares in `routes/auth.js` that can be used to authenticate requests. The `required` middleware configures the `express-jwt` middleware using our application's secret and will return a 401 status code if the request cannot be authenticated. The payload of the JWT can then be accessed from `req.payload` in the endpoint. The `optional` middleware configures the `express-jwt` in the same way as `required`, but will _not_ return a 401 status code if the request cannot be authenticated.

<br />
