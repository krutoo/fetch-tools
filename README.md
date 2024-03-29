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
import { validateStatus, defaultHeaders, log } from '@krutoo/fetch-tools/middleware';

// configure your own fetch...
const myFetch = configureFetch(
  fetch,
  applyMiddleware(
    // validate status (like in axios)
    validateStatus(status => status >= 200 && status < 300),

    // add default headers
    defaultHeaders({
      'user-agent': 'test',
    }),

    // log request stages (before request, after response, on catch)
    log({
      onCatch: ({ error }) => console.error(error),
    }),
  ),
);

// ...and using it like normal fetch
myFetch('posts/1')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Middleware

Middleware are just functions and you can write your own.

```ts
async function myMiddleware(request, next) {
  try {
    // [do something before request here]

    const response = await next(request);

    // [do something after response here]

    return response;
  } catch (error) {
    // [do something on error here but don't forget throw error or return response]

    throw error;
  }
}
```

## Builtin middleware

### `validateStatus`

Returns a middleware that will validate status.

```ts
import { configureFetch, applyMiddleware } from '@krutoo/fetch-tools';
import { validateStatus } from '@krutoo/fetch-tools/middleware';

const myFetch = configureFetch(
  fetch,
  applyMiddleware(validateStatus(status => status >= 200 && status < 300)),
);
```

### `defaultHeaders`

Returns a middleware that will set default headers to request.

```ts
import { configureFetch, applyMiddleware } from '@krutoo/fetch-tools';
import { defaultHeaders } from '@krutoo/fetch-tools/middleware';

const myFetch = configureFetch(fetch, applyMiddleware(defaultHeaders({ 'user-agent': 'spy' })));
```

### `log`

Returns a middleware that will log phases by handler.

```ts
import { configureFetch, applyMiddleware } from '@krutoo/fetch-tools';
import { log } from '@krutoo/fetch-tools/middleware';

const myFetch = configureFetch(
  fetch,
  log({
    onRequest({ request }) {
      console.log(request);
    },

    onResponse({ request, response }) {
      console.log(response);
    },

    onCatch({ request, error }) {
      console.error(error);
    },
  }),
);
```

### `cookie`

Returns a middleware that will accumulate cookies. Useful on the server.

```ts
import { configureFetch, applyMiddleware } from '@krutoo/fetch-tools';
import { cookie } from '@krutoo/fetch-tools/middleware';
import { createCookieStore } from '@krutoo/fetch-tools/utils';

const store = createCookieStore();

const fetch1 = configureFetch(fetch, applyMiddleware(cookie(store)));
const fetch2 = configureFetch(fetch, applyMiddleware(cookie(store)));

await fetch1('https://www.hello.com/');
await fetch2('https://www.world.com/');

// there will be cookies from all responses
console.log(store.getCookies());
```

**IMPORTANT**: this middleware makes it possible to accumulate all received cookies.
It does not filter cookies in outgoing requests based on the URL.
To use cookies like a browser you can use [fetch-cookie](https://github.com/valeriangalliat/fetch-cookie).

To use **fetch-cookie** as an middleware, follow [these](https://github.com/valeriangalliat/fetch-cookie/issues/79#issuecomment-1672188226) instructions.

## Server utilities

You can use utils for simply configure your HTTP server.

**In Bun:**

```ts
import { router, route } from '@krutoo/fetch-tools';

Bun.serve({
  port: 1234,
  fetch: router(
    // handler of GET /
    route.get('/', () => new Response('Home page')),

    // handler of PUT /about
    route.put('/about', () => new Response('About page')),

    // handler of POST /news
    route.post('/news', () => new Response('News page')),

    // handler for any method
    route('/stats', () => new Response('Some stats')),
  ),
});
```

**In Deno:**

```ts
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';
import { router, route } from '@krutoo/fetch-tools';

await serve(
  router(
    route('/', () => new Response('Home page')),
    route('/news', () => new Response('News page')),
    route('/about', () => new Response('About page')),
  ),
  { port: 1234 },
);
```

**In Node.js (node:http or express):**

Currently there is no builtin server implementation based on fetch API.

Is it possible to use adapter for `node:http` or `express` from [@whatwg-node/server](https://www.npmjs.com/package/@whatwg-node/server).

```ts
import express from 'express';
import { createServerAdapter } from '@whatwg-node/server';

const handler = createServerAdapter((request: Request) => {
  return new Response(`Hello World!`, { status: 200 });
});

const app = express();

app.get('/greeting', handler);
```

### Middleware for servers

You can use middleware for server handlers too:

```ts
import { router, route, applyMiddleware } from '@krutoo/fetch-tools';
import { log } from '@krutoo/fetch-tools/middleware';

const enhance = applyMiddleware(
  log({
    onCatch: ({ error }) => console.error(error),
  }),
);

const handler = enhance(
  router(
    route('/', () => new Response('Home page')),
    route('/news', () => new Response('News page')),
    route('/about', () => new Response('About page')),
  ),
);

Bun.serve({
  port: 1234,
  fetch: handler,
});
```

## To do

- JWT middleware
- retry middleware
- ~~ability to use with Bun's `Bun.serve` and Deno's `serve` from `std/http`~~
