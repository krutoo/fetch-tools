# fetch-tools

Set of utilities for JS [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) function.

## Goals

- do not change `fetch` behavior, just add some features
- able to run in browser, Node.js, Deno, Bun
- has no dependencies

## Installation

```bash
npm add @krutoo/fetch-tools
```

## Usage

Creating fetch with some extra features.

```ts
import { configureFetch, applyMiddleware } from '@krutoo/fetch-tools';
import { baseURL, validateStatus, log } from '@krutoo/fetch-tools/middleware';

// configure your own fetch...
const myFetch = configureFetch(
  fetch,
  applyMiddleware([
    // add base URL (like in axios)
    baseURL('https://www.my-api.com/'),

    // validate status (like in axios)
    validateStatus(status => status >= 200 && status < 300),

    // log request stages (before request, after response, on catch)
    log({ onCatch: error => console.error(error) }),
  ]),
);

// ...and using it like normal fetch
myFetch('users/current/')
  .then(res => res.json())
  .then(user => console.log(user.name));
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
