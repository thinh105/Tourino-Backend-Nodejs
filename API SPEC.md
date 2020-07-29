# Tourino API Spec

## Authentication Header:

`Authorization: Bearer jwt.token.here`

# JSON Objects returned by API:

### Tours

### Errors and Status Codes

If a request fails any validations, expect a 422 and errors in the following format:

```JSON
{
  "errors":{
    "body": [
      "can't be empty"
    ]
  }
}
```

#### Other status codes:

401 for Unauthorized requests, when a request requires authentication but it isn't provided

403 for Forbidden requests, when a request may be valid but the user doesn't have permissions to perform the action

404 for Not found requests, when a resource can't be found to fulfill the request

# Endpoints:

## Get All Tours

`GET /api/v1/tours`

No authentication required, returns a list of [Tours](#Tours)

## Advanced query

### Filter query

Provide `tag`, `author` or `favorited` query parameter to filter results

Query Parameters:

Filter by tag:

`?tag=AngularJS`

Filter by author:

`?author=jake`

Favorited by user:

`?favorited=jake`

Limit number of articles (default is 20):

`?limit=20`

Offset/skip number of articles (default is 0):

`?offset=0`

### Authentication:

`POST /api/users/login`

Example request body:

```JSON
{
  "user":{
    "email": "jake@jake.jake",
    "password": "jakejake"
  }
}
```

No authentication required, returns a [User](#users-for-authentication)

Required fields: `email`, `password`

### Registration:

`POST /api/users`

Example request body:

```JSON
{
  "user":{
    "username": "Jacob",
    "email": "jake@jake.jake",
    "password": "jakejake"
  }
}
```

No authentication required, returns a [User](#users-for-authentication)

Required fields: `email`, `username`, `password`

### Get Current User

`GET /api/user`

Authentication required, returns a [User](#users-for-authentication) that's the current user

### Update User

`PUT /api/user`

Example request body:

```JSON
{
  "user":{
    "email": "jake@jake.jake",
    "bio": "I like to skateboard",
    "image": "https://i.stack.imgur.com/xHWG8.jpg"
  }
}
```

Authentication required, returns the [User](#users-for-authentication)

Accepted fields: `email`, `username`, `password`, `image`, `bio`

### Get Profile

`GET /api/profiles/:username`

Authentication optional, returns a [Profile](#profile)

### Follow user

`POST /api/profiles/:username/follow`

Authentication required, returns a [Profile](#profile)

No additional parameters required

### Unfollow user

`DELETE /api/profiles/:username/follow`

Authentication required, returns a [Profile](#profile)

No additional parameters required

### List Articles

`GET /api/articles`

Returns most recent articles globally by default, provide `tag`, `author` or `favorited` query parameter to filter results

Query Parameters:

Filter by tag:

`?tag=AngularJS`

Filter by author:

`?author=jake`

Favorited by user:

`?favorited=jake`

Limit number of articles (default is 20):

`?limit=20`

Offset/skip number of articles (default is 0):

`?offset=0`

Authentication optional, will return [multiple articles](#multiple-articles), ordered by most recent first

### Feed Articles

`GET /api/articles/feed`

Can also take `limit` and `offset` query parameters like [List Articles](#list-articles)

Authentication required, will return [multiple articles](#multiple-articles) created by followed users, ordered by most recent first.

### Get Article

`GET /api/articles/:slug`

No authentication required, will return [single article](#single-article)

### Create Article

`POST /api/articles`

Example request body:

```JSON
{
  "article": {
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "You have to believe",
    "tagList": ["reactjs", "angularjs", "dragons"]
  }
}
```

Authentication required, will return an [Article](#single-article)

Required fields: `title`, `description`, `body`

Optional fields: `tagList` as an array of Strings

### Update Article

`PUT /api/articles/:slug`

Example request body:

```JSON
{
  "article": {
    "title": "Did you train your dragon?"
  }
}
```

Authentication required, returns the updated [Article](#single-article)

Optional fields: `title`, `description`, `body`

The `slug` also gets updated when the `title` is changed

### Delete Article

`DELETE /api/articles/:slug`

Authentication required

### Add Comments to an Article

`POST /api/articles/:slug/comments`

Example request body:

```JSON
{
  "comment": {
    "body": "His name was my name too."
  }
}
```

Authentication required, returns the created [Comment](#single-comment)

Required field: `body`

### Get Comments from an Article

`GET /api/articles/:slug/comments`

Authentication optional, returns [multiple comments](#multiple-comments)

### Delete Comment

`DELETE /api/articles/:slug/comments/:id`

Authentication required

### Favorite Article

`POST /api/articles/:slug/favorite`

Authentication required, returns the [Article](#single-article)

No additional parameters required

### Unfavorite Article

`DELETE /api/articles/:slug/favorite`

Authentication required, returns the [Article](#single-article)

No additional parameters required

### Get Tags

`GET /api/tags`

No authentication required, returns a [List of Tags](#list-of-tags)
