# fetch-tools

Set of utilities for JS [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) function.

## Goals

- do not change `fetch` behavior, just add some features
- ability to run in browser, Node.js, Deno, Bun
- zero dependencies

## Installation

```bash
# in Node.js
npm add @krutoo/fetch-tools

# in Node.js via yarn
yarn add @krutoo/fetch-tools

# in Bun
bun add @krutoo/fetch-tools
```

## Usage

Creating fetch with some extra features.

```ts
import { configureFetch, applyMiddleware } from '@krutoo/fetch-tools';
import { baseURL, validateStatus, defaultHeaders, log } from '@krutoo/fetch-tools/middleware';

// configure your own fetch...
const myFetch = configureFetch(
  fetch,
  applyMiddleware([
    // add base URL (like in axios)
    baseURL('https://jsonplaceholder.typicode.com/'),

    // validate status (like in axios)
    validateStatus(status => status >= 200 && status < 300),

    // add default headers
    defaultHeaders({ 'user-agent': 'test' }),

    // log request stages (before request, after response, on catch)
    log({ onCatch: ({ error }) => console.error(error) }),
  ]),
);

// ...and using it like normal fetch
myFetch('posts/1')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Writing middleware

Middleware is just function.

```ts
async function middleware(config, next) {
  try {
    // [do something before request here]

    const response = await next(config);

    // [do something after response here]

    return response;
  } catch (error) {
    // [do something on error here but don't forget throw error or return response]

    throw error;
  }
}
```

## To do

- JWT middleware
- Cookie middleware (for server)
